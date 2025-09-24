import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      // Validate stock for physical products
      if (dto.type === 'PHYSICAL' && dto.stock === null) {
        throw new BadRequestException('Physical products must have stock quantity');
      }

      const product = await this.prisma.product.create({
        data: {
          title: dto.title,
          description: dto.description,
          price: dto.price,
          currency: dto.currency || 'USD',
          stock: dto.stock,
          images: dto.images ? JSON.stringify(dto.images) : null,
          type: dto.type,
          metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      this.logger.log(`Created product: ${product.id} - ${product.title}`);
      return this.mapToResponseDto(product);
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(query: ProductQueryDto): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { search, type, isActive, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count
      const total = await this.prisma.product.count({ where });

      // Get products
      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      });

      const totalPages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        products: products.map(this.mapToResponseDto),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToResponseDto(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      // Validate stock for physical products
      if (dto.type === 'PHYSICAL' && dto.stock === null) {
        throw new BadRequestException('Physical products must have stock quantity');
      }

      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.currency !== undefined) updateData.currency = dto.currency;
      if (dto.stock !== undefined) updateData.stock = dto.stock;
      if (dto.images !== undefined) updateData.images = dto.images ? JSON.stringify(dto.images) : null;
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.metadata !== undefined) updateData.metadata = dto.metadata ? JSON.stringify(dto.metadata) : null;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Updated product: ${product.id} - ${product.title}`);
      return this.mapToResponseDto(product);
    } catch (error) {
      this.logger.error(`Failed to update product ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if product has any orders (prevent deletion if purchased)
      const orderCount = await this.prisma.orderItem.count({
        where: { productId: id },
      });

      if (orderCount > 0) {
        throw new ConflictException(
          'Cannot delete product that has been purchased. Consider deactivating instead.',
        );
      }

      await this.prisma.product.delete({
        where: { id },
      });

      this.logger.log(`Deleted product: ${id} - ${product.title}`);
    } catch (error) {
      this.logger.error(`Failed to delete product ${id}: ${error.message}`, error.stack);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }

  async activate(id: string): Promise<ProductResponseDto> {
    return this.updateStatus(id, true);
  }

  async deactivate(id: string): Promise<ProductResponseDto> {
    return this.updateStatus(id, false);
  }

  private async updateStatus(id: string, isActive: boolean): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { isActive },
      });

      this.logger.log(`${isActive ? 'Activated' : 'Deactivated'} product: ${product.id} - ${product.title}`);
      return this.mapToResponseDto(product);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
      this.logger.error(`Failed to update product status ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update product status');
    }
  }

  private mapToResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      images: product.images ? JSON.parse(product.images) : null,
      type: product.type,
      metadata: product.metadata ? JSON.parse(product.metadata) : null,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  // Additional method to check stock and reserve for orders
  async checkAndReserveStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.isActive) {
        throw new BadRequestException('Product is not active');
      }

      // Digital products (stock === null) don't need stock check
      if (product.stock === null) {
        return true;
      }

      // Check if enough stock is available
      if (product.stock < quantity) {
        return false;
      }

      // Reserve stock by reducing it
      await this.prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock - quantity },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to check/reserve stock for product ${productId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Method to restore stock if order is cancelled
  async restoreStock(productId: string, quantity: number): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.stock === null) {
        return; // Digital products don't need stock restoration
      }

      await this.prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock + quantity },
      });

      this.logger.log(`Restored ${quantity} stock to product ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to restore stock for product ${productId}: ${error.message}`, error.stack);
    }
  }
}
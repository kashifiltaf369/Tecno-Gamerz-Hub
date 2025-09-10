import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProduct = {
    id: 'product_1',
    name: 'Gaming Skin',
    description: 'Epic gaming skin for your character',
    price: 29.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Skins',
    imageUrl: 'https://example.com/skin.jpg',
    stock: null,
    isActive: true,
    metadata: { badgeId: 'epic_skin_badge' },
    createdAt: new Date(),
    updatedAt: new Date(),
    OrderItem: []
  };

  const mockPhysicalProduct = {
    id: 'product_2',
    name: 'Gaming Headset',
    description: 'High-quality gaming headset',
    price: 199.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Hardware',
    imageUrl: 'https://example.com/headset.jpg',
    stock: 50,
    isActive: true,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    OrderItem: []
  };

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Gaming Skin',
      description: 'Epic gaming skin for your character',
      price: 29.99,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Skins',
      imageUrl: 'https://example.com/skin.jpg',
      metadata: { badgeId: 'epic_skin_badge' }
    };

    it('should create a digital product successfully', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          stock: null, // Digital products have no stock
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should create a physical product with stock', async () => {
      const physicalProductDto = {
        ...createProductDto,
        type: ProductType.PHYSICAL_MERCHANDISE,
        stock: 50,
        metadata: null
      };

      mockPrismaService.product.create.mockResolvedValue(mockPhysicalProduct);

      const result = await service.create(physicalProductDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: physicalProductDto,
      });
      expect(result).toEqual(mockPhysicalProduct);
    });

    it('should throw ConflictException if product creation fails', async () => {
      const error = new Error('Unique constraint failed');
      error.name = 'PrismaClientKnownRequestError';
      (error as any).code = 'P2002';

      mockPrismaService.product.create.mockRejectedValue(error);

      await expect(service.create(createProductDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    const queryDto: ProductQueryDto = {
      page: 1,
      limit: 10,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Skins',
      search: 'gaming',
      isActive: true
    };

    it('should return paginated products with filters', async () => {
      const mockResults = {
        products: [mockProduct],
        total: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      };

      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          type: ProductType.DIGITAL_COSMETIC,
          category: 'Skins',
          isActive: true,
          OR: [
            { name: { contains: 'gaming', mode: 'insensitive' } },
            { description: { contains: 'gaming', mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: {
          type: ProductType.DIGITAL_COSMETIC,
          category: 'Skins',
          isActive: true,
          OR: [
            { name: { contains: 'gaming', mode: 'insensitive' } },
            { description: { contains: 'gaming', mode: 'insensitive' } }
          ]
        }
      });

      expect(result).toEqual(mockResults);
    });

    it('should return all products when no filters applied', async () => {
      const emptyQuery: ProductQueryDto = { page: 1, limit: 10 };

      mockPrismaService.product.findMany.mockResolvedValue([mockProduct, mockPhysicalProduct]);
      mockPrismaService.product.count.mockResolvedValue(2);

      const result = await service.findAll(emptyQuery);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product_1');

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product_1' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Gaming Skin',
      price: 39.99,
    };

    it('should update a product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('product_1', updateProductDto);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product_1' },
        data: updateProductDto,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product not found for update', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateProductDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a product by setting isActive to false', async () => {
      const deactivatedProduct = { ...mockProduct, isActive: false };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(deactivatedProduct);

      const result = await service.remove('product_1');

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product_1' },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivatedProduct);
    });

    it('should throw NotFoundException if product not found for deletion', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock for physical products', async () => {
      const productWithReducedStock = { ...mockPhysicalProduct, stock: 45 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockPhysicalProduct);
      mockPrismaService.product.update.mockResolvedValue(productWithReducedStock);

      await service.reserveStock('product_2', 5);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product_2' },
        data: { stock: 45 },
      });
    });

    it('should not reserve stock for digital products', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await service.reserveStock('product_1', 5);

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const lowStockProduct = { ...mockPhysicalProduct, stock: 3 };
      mockPrismaService.product.findUnique.mockResolvedValue(lowStockProduct);

      await expect(
        service.reserveStock('product_2', 5)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product not found for stock reservation', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.reserveStock('nonexistent', 5)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreStock', () => {
    it('should restore stock for physical products', async () => {
      const productWithRestoredStock = { ...mockPhysicalProduct, stock: 55 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockPhysicalProduct);
      mockPrismaService.product.update.mockResolvedValue(productWithRestoredStock);

      await service.restoreStock('product_2', 5);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product_2' },
        data: { stock: 55 },
      });
    });

    it('should not restore stock for digital products', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await service.restoreStock('product_1', 5);

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found for stock restoration', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.restoreStock('nonexistent', 5)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateStock', () => {
    it('should return true for digital products (no stock validation needed)', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.validateStock('product_1', 10);

      expect(result).toBe(true);
    });

    it('should return true for physical products with sufficient stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockPhysicalProduct);

      const result = await service.validateStock('product_2', 10);

      expect(result).toBe(true);
    });

    it('should return false for physical products with insufficient stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockPhysicalProduct);

      const result = await service.validateStock('product_2', 100);

      expect(result).toBe(false);
    });

    it('should throw NotFoundException if product not found for stock validation', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.validateStock('nonexistent', 5)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkReserveStock', () => {
    it('should reserve stock for multiple products in a transaction', async () => {
      const items = [
        { productId: 'product_2', quantity: 5 },
        { productId: 'product_1', quantity: 1 }, // Digital product
      ];

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          product: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockPhysicalProduct)
              .mockResolvedValueOnce(mockProduct),
            update: jest.fn().mockResolvedValue({}),
          },
        });
      });

      await service.bulkReserveStock(items);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if any product has insufficient stock', async () => {
      const items = [
        { productId: 'product_2', quantity: 100 }, // More than available stock
      ];

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          product: {
            findUnique: jest.fn().mockResolvedValue(mockPhysicalProduct),
            update: jest.fn(),
          },
        });
      });

      await expect(service.bulkReserveStock(items)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('bulkRestoreStock', () => {
    it('should restore stock for multiple products in a transaction', async () => {
      const items = [
        { productId: 'product_2', quantity: 5 },
        { productId: 'product_1', quantity: 1 }, // Digital product
      ];

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          product: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockPhysicalProduct)
              .mockResolvedValueOnce(mockProduct),
            update: jest.fn().mockResolvedValue({}),
          },
        });
      });

      await service.bulkRestoreStock(items);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
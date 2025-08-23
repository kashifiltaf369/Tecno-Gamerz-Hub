# 🤝 Contributing to Tecno Gamerz Hub

Thank you for your interest in contributing to Tecno Gamerz Hub! This document outlines the guidelines and processes for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Security Guidelines](#security-guidelines)

## 📜 Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment for all contributors. By participating, you agree to uphold these standards:

### Our Standards

- **Respectful Communication**: Use welcoming and inclusive language
- **Constructive Feedback**: Focus on the code, not the person
- **Collaboration**: Work together to achieve common goals
- **Professionalism**: Maintain professional conduct in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or inflammatory language
- Spam, trolling, or deliberate disruption
- Sharing private information without consent

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose**
- **Git** configured with your GitHub account
- Basic knowledge of TypeScript, React, and Node.js

### First Time Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone
   git clone https://github.com/YOUR_USERNAME/tecno-gamerz-hub.git
   cd tecno-gamerz-hub
   ```

2. **Set Up Remotes**
   ```bash
   git remote add upstream https://github.com/original-org/tecno-gamerz-hub.git
   git remote -v
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   pnpm keys:generate
   # Copy secrets from .env.keys to .env
   ```

5. **Start Development Environment**
   ```bash
   docker-compose up -d
   pnpm db:migrate:deploy
   pnpm db:seed
   pnpm dev
   ```

## 💻 Development Setup

### Project Structure

Understanding the monorepo structure is crucial:

```
tecno-gamerz-hub/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # NestJS backend
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── ui/            # Shared UI components
│   ├── config/        # Shared configurations  
│   └── utils/         # Shared utilities
├── prisma/            # Database schema and migrations
└── scripts/           # Development scripts
```

### Development Commands

```bash
# Development
pnpm dev                    # Start all applications
pnpm dev --filter=web      # Start only web app
pnpm dev --filter=api      # Start only API

# Building
pnpm build                 # Build all applications
pnpm build --filter=web    # Build only web app

# Testing
pnpm test                  # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:e2e             # Run end-to-end tests

# Code Quality
pnpm lint                  # Lint all code
pnpm lint:fix             # Fix linting issues
pnpm format               # Format code with Prettier
pnpm typecheck            # Type check all code

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Create and apply migrations
pnpm db:seed              # Seed database with test data
```

## 🔄 Contribution Workflow

### 1. Find or Create an Issue

- Browse [existing issues](https://github.com/your-org/tecno-gamerz-hub/issues)
- Comment on issues you'd like to work on
- Create new issues for bugs or feature requests
- Wait for approval before starting work on large features

### 2. Create a Feature Branch

```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Commit changes following [conventional commits](#commit-messages)

### 4. Test Your Changes

```bash
# Run full test suite
pnpm test

# Check code quality
pnpm lint
pnpm typecheck

# Test in different environments
pnpm build
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Testing instructions

## 📏 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// ✅ Good: Use const assertions
const ROLES = ['ADMIN', 'GAMER', 'FAN'] as const;
type Role = typeof ROLES[number];

// ❌ Bad: Using any
function processData(data: any) { ... }

// ✅ Good: Use generics
function processData<T>(data: T): T { ... }
```

### React Component Guidelines

```tsx
// ✅ Good: Functional component with proper types
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick,
  disabled = false 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ✅ Good: Export with proper naming
export { Button };
```

### API Guidelines

```typescript
// ✅ Good: Use DTOs for validation
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;
}

// ✅ Good: Proper error handling
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }
}
```

### Database Guidelines

```prisma
// ✅ Good: Proper model relationships
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  roles     UserRole[]
  accounts  Account[]

  @@map("users")
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
feat: add user profile management
feat(auth): implement OAuth login with Google

# Bug fixes
fix: resolve login redirect issue
fix(api): handle database connection errors

# Documentation
docs: update API documentation
docs(readme): add deployment instructions

# Refactoring
refactor: optimize database queries
refactor(ui): reorganize component structure

# Tests
test: add integration tests for auth
test(e2e): add user registration flow tests

# Chores
chore: update dependencies
chore(ci): improve build performance
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Example: Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Tests

```typescript
// Example: API endpoint testing
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should login user successfully', async () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const expectedResult = { access_token: 'token' };

    jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

    const result = await controller.login(loginDto);
    expect(result).toEqual(expectedResult);
  });
});
```

### E2E Tests

```typescript
// Example: End-to-end testing
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
  });
});
```

## 📝 Pull Request Process

### PR Requirements

Before submitting a PR, ensure:

- [ ] All tests pass (`pnpm test`)
- [ ] Code is properly formatted (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Documentation is updated if needed
- [ ] Screenshots included for UI changes
- [ ] Breaking changes are documented

### PR Template

Use this template for your PR description:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Fixes #123
Closes #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
![Before](before.png)
![After](after.png)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI pipeline runs automatically
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Reviewers test functionality
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Node.js: [e.g., 18.0.0]
- Version: [e.g., 1.0.0]

## Additional Context
Screenshots, logs, etc.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the requested feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
Detailed description of the solution.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Mockups, examples, etc.
```

## 🔒 Security Guidelines

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:

1. Email security@tecnogamerzhub.com
2. Include detailed description
3. Provide steps to reproduce
4. Allow time for investigation and fix

### Security Best Practices

```typescript
// ✅ Good: Input validation
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// ✅ Good: Parameterized queries (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// ❌ Bad: Direct string interpolation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Authentication & Authorization

```typescript
// ✅ Good: Proper role checking
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.usersService.delete(id);
}

// ✅ Good: Input sanitization
import { sanitize } from 'class-sanitizer';

@Post()
async create(@Body() data: CreateUserDto) {
  sanitize(data);
  return this.service.create(data);
}
```

## 🎯 Performance Guidelines

### Frontend Performance

```typescript
// ✅ Good: Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// ✅ Good: Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

// ✅ Good: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Backend Performance

```typescript
// ✅ Good: Use database indexes
model User {
  email String @unique // Creates index automatically
  name  String @db.VarChar(255)
  
  @@index([createdAt]) // Custom index
}

// ✅ Good: Optimize queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    // Only select needed fields
  },
  where: {
    active: true,
  },
  take: 10, // Limit results
});
```

## 📚 Documentation Guidelines

### Code Documentation

```typescript
/**
 * Creates a new user account with role assignment
 * 
 * @param userData - User registration data
 * @param role - Role to assign to the user
 * @returns Promise<User> - Created user with role information
 * 
 * @throws {ConflictException} When email already exists
 * @throws {BadRequestException} When role is invalid
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * }, 'GAMER');
 * ```
 */
async function createUser(userData: CreateUserDto, role: string): Promise<User> {
  // Implementation
}
```

### README Updates

When adding new features, update:

- [ ] Feature list in README
- [ ] API documentation
- [ ] Environment variables
- [ ] Installation instructions
- [ ] Usage examples

## 🏆 Recognition

Contributors are recognized through:

- **GitHub Contributors**: Listed in repository contributors
- **Release Notes**: Major contributions mentioned in releases
- **Hall of Fame**: Outstanding contributors featured in documentation

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Real-time chat with the community
- **Stack Overflow**: Tag questions with `tecno-gamerz-hub`

### Maintainer Contact

- **Email**: maintainers@tecnogamerzhub.com
- **GitHub**: Create an issue or discussion
- **Emergency**: For security issues only

---

**Thank you for contributing to Tecno Gamerz Hub! 🎮**
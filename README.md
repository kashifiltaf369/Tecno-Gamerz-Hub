# 🎮 Tecno Gamerz Hub - Gaming Platform

![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14.0.0-black.svg)
![NestJS](https://img.shields.io/badge/nestjs-10.0.0-ea2845.svg)

A production-grade gaming platform built with modern web technologies, featuring a comprehensive monorepo architecture with Next.js frontend, NestJS API, and advanced features including authentication, role-based access control, internationalization, and real-time capabilities.

## 🌟 Features

### 🔐 Authentication & Authorization
- **Multi-Provider OAuth**: Google, Twitch, YouTube integration
- **Role-Based Access Control (RBAC)**: Admin, Gamer, Fan roles with granular permissions
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Session Management**: Secure session handling with Auth.js (NextAuth v5)

### 🏗️ Architecture
- **Monorepo Structure**: Turborepo with pnpm workspaces
- **Type-Safe**: End-to-end TypeScript with strict type checking
- **Scalable Backend**: NestJS with Fastify adapter for high performance
- **Modern Frontend**: Next.js 14 with App Router and React Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Caching & Jobs**: Redis with BullMQ for background processing

### 🌍 Internationalization
- **Multi-Language Support**: English, Urdu, Hindi
- **Server-Side Rendering**: Localized content with next-intl
- **Dynamic Language Switching**: Real-time language switching

### 🎨 User Interface
- **Gaming-Themed Design**: Custom design system with Tailwind CSS
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Shared UI components across applications
- **Accessibility**: WCAG 2.1 compliant interface

### 🚀 DevOps & Deployment
- **Docker Support**: Multi-stage builds with production optimization
- **CI/CD Pipelines**: GitHub Actions with comprehensive testing
- **Security Scanning**: Automated vulnerability detection
- **Preview Deployments**: Automatic preview environments for PRs
- **Production Deployment**: Vercel (Web) + Railway (API)

## 📁 Project Structure

```
tecno-gamerz-hub/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities and configurations
│   │   │   └── styles/        # Global styles
│   │   └── package.json
│   └── api/                    # NestJS API server
│       ├── src/
│       │   ├── modules/       # Feature modules
│       │   ├── common/        # Shared utilities
│       │   └── main.ts        # Application entry point
│       └── package.json
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configurations
│   └── utils/                  # Shared utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── infra/
│   ├── docker/                # Docker configurations
│   └── k8s/                   # Kubernetes manifests
├── scripts/                   # Utility scripts
└── .github/workflows/         # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose** (for local development)
- **PostgreSQL** (or use Docker)
- **Redis** (or use Docker)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/tecno-gamerz-hub.git
cd tecno-gamerz-hub

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Generate JWT keys and secrets
pnpm keys:generate

# Copy generated secrets to .env (check .env.keys file)
```

### 3. Database Setup

```bash
# Start services with Docker
docker-compose up -d

# Run database migrations
pnpm db:migrate:deploy

# Seed the database
pnpm db:seed
```

### 4. Development

```bash
# Start all applications in development mode
pnpm dev

# Or start individually
pnpm dev --filter=web    # Web app on http://localhost:3000
pnpm dev --filter=api    # API server on http://localhost:3001
```

## 🎮 Live Features

The platform now includes fully functional gaming features! These are the working features that demonstrate real functionality.

### ✅ Authentication System (Complete)

- ✅ **User Registration** - Create new accounts with validation
- ✅ **User Login** - Secure credential verification
- ✅ **Protected Routes** - JWT-based route protection
- ✅ **User Dashboard** - Profile management interface
- ✅ **Role System** - ADMIN, GAMER, FAN roles
- ✅ **Session Management** - Secure token handling

### 🏆 Tournament Management (Complete)

- ✅ **Tournament Creation** - Create tournaments with detailed information
- ✅ **Tournament Listing** - Browse and filter tournaments
- ✅ **Tournament Details** - View comprehensive tournament information
- ✅ **Join/Leave System** - Participate in tournaments
- ✅ **Tecno Gamerz Official Badge** - Admin tournaments marked as official
- ✅ **Real-time Status** - Upcoming, Active, Completed tournament states
- ✅ **Search & Filters** - Find tournaments by game, status, or search terms
- ✅ **Participant Management** - View tournament participants

### Quick Test Drive

1. **Start the Development Servers**:
   ```bash
   pnpm dev --filter=api    # API on http://localhost:3001
   pnpm dev --filter=web    # Web on http://localhost:3000
   ```

2. **Test the Features**:
   
   **Authentication:**
   - Visit http://localhost:3000
   - Click "Get Started" to register a new account
   - Fill in your details (name, email, password)
   - Login with your credentials
   - Access your protected dashboard
   
   **Tournament System:**
   - Visit http://localhost:3000/tournaments to browse tournaments
   - Create a new tournament (login required)
   - Join existing tournaments
   - View tournament details and participants
   - Admin users will see their tournaments marked as "Tecno Gamerz Official"

### API Endpoints

```
POST /api/v1/auth/register    # Register new user
POST /api/v1/auth/login       # Login user
GET  /api/v1/auth/me          # Get current user (protected)
POST /api/v1/auth/refresh     # Refresh access token
```

### Default Admin User

After running `pnpm db:seed`, a default admin user will be created:
- **Email**: Set via `ADMIN_EMAIL` environment variable
- **Username**: admin
- **Password**: AdminPassword123!
- **Role**: ADMIN

**Admin Privileges:**
- Can create **Tecno Gamerz Official** tournaments (marked with crown badge)
- Can edit/delete any tournament
- Full access to user management
- Official tournaments are featured prominently

### Authentication Architecture

- **JWT Tokens**: RS256 algorithm with public/private key pairs
- **Password Security**: bcrypt hashing with 12 rounds
- **Token Storage**: localStorage (client-side) - will be moved to httpOnly cookies in production
- **Role-Based Access**: Decorator-based route protection
- **Input Validation**: Class-validator with custom constraints

## 🏆 Tournament System (Live Feature)

The tournament system is now fully implemented and allows users to create, manage, and participate in gaming tournaments.

### Tournament Features

- **Create Tournaments**: Any authenticated user can create tournaments
- **Tecno Gamerz Official Badge**: Admin-created tournaments get special "Official" status with crown badge
- **Tournament Management**: 
  - Full CRUD operations (Create, Read, Update, Delete)
  - Only creators or admins can edit/delete tournaments
- **Participation System**: 
  - Join/leave tournaments before they start
  - View participant lists and statistics
  - Real-time participant count updates

### Tournament States

- **UPCOMING**: Tournament not yet started (users can join)
- **ACTIVE**: Tournament currently running (no new joins)
- **COMPLETED**: Tournament finished (archived)

### Tournament Pages

1. **Tournament Listing** (`/tournaments`):
   - Browse all tournaments with pagination
   - Filter by game, status, or official tournaments
   - Search in titles and descriptions
   - Quick join functionality

2. **Tournament Creation** (`/tournaments/create`):
   - Rich form with validation
   - Game selection with popular games
   - Date/time picker with validation
   - Admin users get automatic "Official" status

3. **Tournament Details** (`/tournaments/[id]`):
   - Comprehensive tournament information
   - Participant list with avatars
   - Tournament schedule and timeline
   - Join/leave actions
   - Edit/delete for authorized users

### Database Schema

```prisma
model Tournament {
  id                    String   @id @default(uuid())
  title                 String
  description           String
  game                  String
  startDate             DateTime
  endDate               DateTime
  createdById           String
  isTecnoGamerzOfficial Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  createdBy    User                     @relation("TournamentCreator")
  participants TournamentParticipant[]
}

model TournamentParticipant {
  id           String   @id @default(uuid())
  tournamentId String
  userId       String
  joinedAt     DateTime @default(now())

  tournament Tournament @relation(onDelete: Cascade)
  user       User       @relation(onDelete: Cascade)
  
  @@unique([tournamentId, userId])
}
```

### API Integration

The frontend uses React Query for efficient data fetching and caching:
- **GET /tournaments** - Paginated tournament listing with filters
- **POST /tournaments** - Create new tournament
- **GET /tournaments/:id** - Tournament details with participants
- **POST /tournaments/:id/join** - Join tournament
- **DELETE /tournaments/:id/leave** - Leave tournament

### UI Features

- **Gaming-themed Design**: Neon colors and gaming aesthetics
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Updates**: Participant counts and status updates
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and proper error handling

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tecno_gamerz_hub"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# JWT Configuration (Required for Authentication)
JWT_PRIVATE_KEY="your-rsa-private-key-in-pem-format"
JWT_PUBLIC_KEY="your-rsa-public-key-in-pem-format"

# Legacy JWT secrets (still used by some parts)
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITCH_CLIENT_ID="your-twitch-client-id"
TWITCH_CLIENT_SECRET="your-twitch-client-secret"

# API Configuration
API_URL="http://localhost:3001"
API_PORT=3001
CORS_ORIGIN="http://localhost:3000"

# Admin Configuration
ADMIN_EMAIL="admin@tecnogamerzhub.com"
```

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

#### Twitch OAuth
1. Go to [Twitch Developers](https://dev.twitch.tv/console)
2. Register your application
3. Add OAuth redirect URLs:
   - `http://localhost:3000/api/auth/callback/twitch` (development)
   - `https://yourdomain.com/api/auth/callback/twitch` (production)

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following key models:

- **User**: User profiles and authentication data
- **Role**: System roles (ADMIN, GAMER, FAN)
- **Permission**: Granular permissions for role-based access
- **Account**: OAuth provider accounts
- **AuditLog**: Security and activity logging

### Key Relationships

```prisma
User {
  roles     UserRole[]     // Many-to-many with roles
  accounts  Account[]      // OAuth provider accounts
  auditLogs AuditLog[]     // Activity tracking
}

Role {
  users       UserRole[]       // Users with this role
  permissions RolePermission[] // Permissions for this role
}
```

## 👥 User Roles & Permissions

### ADMIN
- Full system access
- User management
- Content moderation
- System configuration
- Analytics access

### GAMER
- Profile management
- Tournament participation
- Video uploads
- Community features
- Gaming statistics

### FAN
- Content viewing
- Basic interactions
- Profile customization
- Community participation

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm build                  # Build all applications
pnpm test                   # Run all tests
pnpm lint                   # Lint all code
pnpm typecheck             # Type check all code

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Create and apply migrations
pnpm db:migrate:deploy     # Deploy migrations (production)
pnpm db:seed               # Seed the database
pnpm db:push               # Push schema changes (development)

# Security
pnpm keys:generate         # Generate JWT keys
```

### Code Quality

The project includes comprehensive tooling for code quality:

- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message format
- **TypeScript**: Strict type checking

### Testing Strategy

- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for full application testing
- **Security Tests**: Automated vulnerability scanning

## 🚀 Deployment

### Production Deployment

The application is designed for cloud-native deployment with the following architecture:

- **Web App**: Deployed on Vercel with Edge Runtime
- **API Server**: Deployed on Railway with auto-scaling
- **Database**: PostgreSQL on Railway/Supabase
- **Cache**: Redis on Upstash/Railway
- **Storage**: AWS S3 or compatible (Cloudflare R2, MinIO)

### Environment Setup

1. **Vercel (Web App)**:
   ```bash
   # Connect your repository to Vercel
   # Set environment variables in Vercel dashboard
   # Deploy automatically on push to main
   ```

2. **Railway (API)**:
   ```bash
   # Connect repository to Railway
   # Configure environment variables
   # Set up PostgreSQL and Redis services
   ```

### CI/CD Workflows

The project includes comprehensive GitHub Actions workflows:

- **CI**: Linting, testing, building, security scanning
- **Preview Deployments**: Automatic preview environments for PRs
- **Production Deployment**: Automated deployment to production
- **Security Scanning**: Daily security checks and vulnerability scanning

## 🔒 Security

### Security Features

- **Authentication**: Secure OAuth and JWT implementation
- **Authorization**: Role-based access control with fine-grained permissions
- **Data Protection**: Input validation, sanitization, and SQL injection prevention
- **Security Headers**: Comprehensive security headers with Helmet
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Properly configured CORS policies
- **Audit Logging**: Comprehensive activity and security logging

### Security Best Practices

- Regular dependency updates and vulnerability scanning
- Secure secret management (never commit secrets)
- Production-grade JWT key management
- Regular security audits and penetration testing
- GDPR and data privacy compliance

## 🌍 Internationalization

The application supports multiple languages with server-side rendering:

### Supported Languages

- **English (en)**: Default language
- **Urdu (ur)**: Pakistan localization
- **Hindi (hi)**: India localization

### Adding New Languages

1. Add language to `apps/web/src/i18n.ts`
2. Create translation files in `apps/web/messages/`
3. Update navigation and routing configuration
4. Test with different locales

## 📊 Monitoring & Analytics

### Application Monitoring

- **Health Checks**: Comprehensive health monitoring for all services
- **Logging**: Structured logging with Pino
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Real-time performance metrics

### Business Analytics

- **User Analytics**: User engagement and behavior tracking
- **Gaming Metrics**: Tournament and gaming statistics
- **Content Analytics**: Video and content performance metrics

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'feat: add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Ensure all CI checks pass
- Follow the existing code style

### Code Review Process

All contributions go through a thorough code review process:

- Automated CI checks must pass
- Manual code review by maintainers
- Security review for sensitive changes
- Performance impact assessment
- Documentation review

## 📋 API Documentation

The API is fully documented with OpenAPI/Swagger:

- **Development**: http://localhost:3001/docs
- **Production**: https://api.tecnogamerzhub.com/docs

### Key API Endpoints

```
Authentication:
POST /auth/login              # User login
POST /auth/logout             # User logout
POST /auth/refresh            # Refresh tokens
GET  /auth/me                 # Current user

Users:
GET    /users                 # List users (ADMIN)
GET    /users/:id             # Get user profile
PUT    /users/:id             # Update user profile
DELETE /users/:id             # Delete user (ADMIN)

Tournaments:
GET    /tournaments           # List tournaments with filtering
POST   /tournaments           # Create tournament (authenticated users)
GET    /tournaments/:id       # Get tournament details
PATCH  /tournaments/:id       # Update tournament (creator/admin)
DELETE /tournaments/:id       # Delete tournament (creator/admin)
POST   /tournaments/:id/join  # Join tournament
DELETE /tournaments/:id/leave # Leave tournament
GET    /tournaments/user/participations  # User's tournament participations
```

## 🏆 Performance

### Optimization Features

- **Next.js 14**: Latest performance optimizations
- **React Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic code splitting and lazy loading
- **Caching**: Comprehensive caching strategy (Redis, CDN)
- **Bundle Analysis**: Bundle size analysis and optimization

### Performance Metrics

Target performance metrics:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s
- **API Response Time**: < 200ms (95th percentile)

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Restart database service
   docker-compose restart postgres
   ```

2. **Port Already in Use**:
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Prisma Client Issues**:
   ```bash
   # Regenerate Prisma client
   pnpm db:generate
   
   # Reset database
   pnpm db:push --force-reset
   ```

4. **Authentication Issues**:
   ```bash
   # Check OAuth configuration
   # Verify redirect URIs
   # Check environment variables
   ```

### Getting Help

- **Documentation**: Check this README and inline code documentation
- **Issues**: Create an issue on GitHub with detailed information
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security**: Report security issues via responsible disclosure

## 📝 License

This project is UNLICENSED - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Team

Built with ❤️ by the Tecno Gamerz Hub team.

---

**Happy Gaming! 🎮**
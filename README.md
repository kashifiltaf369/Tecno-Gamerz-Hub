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

### 🏅 Leaderboard & Scoring System (Complete)

- ✅ **Points System** - Users earn points from tournament results
- ✅ **Official Tournament Bonus** - Tecno Gamerz Official tournaments provide 1.5x point multiplier
- ✅ **Global Leaderboard** - Real-time rankings of top players
- ✅ **User Profiles** - Individual rank stats and points breakdown
- ✅ **Recent Match Results** - Track latest tournament performances
- ✅ **Points Breakdown** - View points from official vs regular tournaments
- ✅ **Admin Match Recording** - Admins can record tournament results and scores

### 🎮 Gamified XP, Levels & Badges (Complete)

- ✅ **XP System** - Users earn experience points from gaming activities
- ✅ **Level Progression** - Automatic level ups every 1000 XP
- ✅ **Achievement Badges** - Earn badges for milestones and accomplishments
- ✅ **Tecno Gamerz Bonus XP** - Official tournaments provide +25% XP bonus
- ✅ **Profile Gamification** - Enhanced profile pages with XP bars and badges
- ✅ **Level Display** - User levels shown throughout the platform
- ✅ **Badge Collection** - Track progress towards earning all badges

### 🤝 Social Features (Complete)

- ✅ **Friends System** - Send, accept, and manage friend requests
- ✅ **Real-time Chat** - Private messaging between friends with WebSocket support
- ✅ **Notifications** - Real-time notifications for friend requests, messages, and achievements
- ✅ **Online Status** - See which friends are online and available to chat
- ✅ **Chat History** - Persistent message storage and conversation history
- ✅ **Friend Management** - Add friends, remove friends, and manage relationships
- ✅ **Notification Bell** - Real-time notification dropdown in navigation bar

### 📺 Streaming & Content Integration (Complete)

- ✅ **Tournament Livestreams** - Embed live streams directly in tournament detail pages
- ✅ **Stream URL Management** - Admins can add/update stream URLs for tournaments (YouTube/Twitch support)
- ✅ **User Content Sharing** - Community members can share gaming videos and highlights
- ✅ **Community Page** - Dedicated page showcasing user-generated gaming content
- ✅ **Official Stream Highlighting** - Tecno Gamerz official content prominently featured with badges
- ✅ **Featured Streams Section** - Homepage integration showcasing live tournaments and top community content
- ✅ **Stream Platform Detection** - Automatic detection and embedding for YouTube and Twitch videos
- ✅ **Content Management** - Users can create, view, and delete their own shared content

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

## 🏅 Leaderboard & Scoring System (Live Feature)

The leaderboard system tracks user performance and rankings based on tournament results with an intelligent scoring mechanism.

## 🎮 Gamified XP, Levels & Badges System (Live Feature)

The gamification system provides an engaging progression experience for users through Experience Points (XP), level advancement, and achievement badges.

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
model User {
  // ... existing fields ...
  totalPoints  Int        @default(0)
  xp           Int        @default(0)      // NEW: Experience points
  level        Int        @default(1)      // NEW: User level
  badges       Json       @default("[]")   // NEW: Achievement badges
  // ... relations ...
}

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

model MatchResult {
  id           String   @id @default(uuid())
  tournamentId String
  userId       String
  score        Int
  awardedPoints Int     // Final points awarded (with multiplier applied)
  createdAt    DateTime @default(now())

  tournament Tournament @relation(onDelete: Cascade)
  user       User       @relation(onDelete: Cascade)
}

model Friendship {
  id          String           @id @default(uuid())
  requesterId String
  receiverId  String
  status      FriendshipStatus @default(PENDING)
  createdAt   DateTime         @default(now())

  requester User @relation("FriendshipRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  receiver  User @relation("FriendshipReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  content    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  sender   User @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver User @relation("MessageReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  message   String
  isRead    Boolean          @default(false)
  metadata  Json?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### API Integration

The frontend uses React Query for efficient data fetching and caching:
- **GET /tournaments** - Paginated tournament listing with filters
- **POST /tournaments** - Create new tournament
- **GET /tournaments/:id** - Tournament details with participants
- **POST /tournaments/:id/join** - Join tournament (awards XP)
- **DELETE /tournaments/:id/leave** - Leave tournament
- **POST /tournaments/:id/results** - Record match result (Admin only, awards XP)
- **POST /tournaments/:id/results/bulk** - Record multiple match results (Admin only, awards XP)
- **GET /leaderboard** - Global leaderboard rankings with levels
- **GET /leaderboard/:userId** - User rank and stats
- **GET /leaderboard/xp/top** - XP-based leaderboard
- **GET /users/profile/:id** - Complete user profile with XP, level, and badges
- **POST /friends/request** - Send friend request
- **PATCH /friends/request/:friendshipId** - Accept/decline friend request
- **GET /friends** - Get friends list
- **GET /friends/requests** - Get pending friend requests
- **DELETE /friends/:friendshipId** - Remove friend
- **POST /chat/message** - Send message to friend
- **GET /chat/messages** - Get conversation messages
- **GET /chat/conversations** - Get all conversations
- **PATCH /chat/messages/mark-read** - Mark messages as read
- **GET /notifications** - Get user notifications
- **PATCH /notifications/mark-as-read** - Mark notifications as read
- **GET /notifications/unread-count** - Get unread notification count
- **PATCH /tournaments/:id/stream** - Update tournament stream URL (Admin/Mod only)
- **POST /content** - Create user content (authenticated users)
- **GET /content** - Get all community content with official prioritization
- **DELETE /content/:id** - Delete own content (content owner only)

### UI Features

- **Gaming-themed Design**: Neon colors and gaming aesthetics
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Updates**: Participant counts and status updates
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and proper error handling

### Scoring System Rules

#### Point Calculation
- **Base Points**: Points = User Score × Base Multiplier (1.0)
- **Official Tournament Bonus**: For Tecno Gamerz Official tournaments, points are multiplied by 1.5
- **Final Formula**: `Awarded Points = Score × Base Multiplier × Official Multiplier`

#### Tournament Types
- **Regular Tournaments**: Created by any user, 1.0x point multiplier
- **Tecno Gamerz Official**: Created by admins, 1.5x point multiplier (marked with crown badge)

#### Leaderboard Features
- **Global Rankings**: Top 50 users ranked by total points
- **Live Updates**: Real-time point calculations and rank updates
- **User Profiles**: Detailed breakdown of points from official vs regular tournaments
- **Achievement Tracking**: Special recognition for users with official tournament points

#### Admin Controls
- **Match Result Recording**: Admins can record individual or bulk tournament results
- **Automatic Point Calculation**: System automatically applies multipliers and updates user totals
- **Score Validation**: Users must be tournament participants to receive points

### XP and Leveling System

#### XP Earning Rules
- **Join Tournament**: +50 XP
- **Participate in Match**: +100 XP  
- **Win Tournament**: +500 XP
- **Tecno Gamerz Official Bonus**: +25% XP for official tournaments

#### Level System
- **Formula**: Level = floor(Total XP / 1000) + 1
- **Level Examples**:
  - Level 1: 0 - 999 XP
  - Level 2: 1000 - 1999 XP  
  - Level 3: 2000 - 2999 XP
- **Max Level**: 100 (future-proofed)

#### Achievement Badges
- **🎮 Rookie**: Create account (Common)
- **⚔️ Contender**: Join first tournament (Common)
- **🏆 Champion**: Win first tournament (Rare)
- **👑 Tecno Fan**: Join official Tecno Gamerz tournament (Epic)

### Gamification Features

#### Profile Enhancement
- **XP Progress Bar**: Visual progress towards next level
- **Badge Collection**: Display earned badges with tooltips
- **Level Display**: Prominent level indicator in profile
- **Achievement Grid**: Track progress towards all badges

#### Platform Integration
- **Leaderboard Levels**: User levels shown on global leaderboard
- **Tournament XP**: Real-time XP earning during tournament participation
- **Badge Notifications**: Visual feedback when earning new badges
- **Progress Tracking**: Detailed XP and level statistics

## 🤝 Social Features System (Live Feature)

The social features system provides comprehensive friend management, real-time messaging, and notification functionality for enhanced user interaction.

### Friends System

#### Core Features
- **Friend Requests**: Send and receive friend requests with proper validation
- **Request Management**: Accept, decline, or cancel friend requests
- **Friends List**: View all friends with their levels and XP stats
- **Friend Search**: Search for users by name, username, or email address
- **Friendship Management**: Remove friends when needed

#### API Endpoints
- **POST /friends/request**: Send friend request
- **PATCH /friends/request/:id**: Respond to friend request (accept/decline)
- **GET /friends**: Get user's friends list with pagination
- **GET /friends/requests**: Get incoming and outgoing friend requests
- **DELETE /friends/:id**: Remove friendship
- **GET /friends/check/:userId**: Check if users are friends

### Real-time Chat System

#### Core Features
- **Private Messaging**: 1-to-1 chat between friends only
- **Real-time Delivery**: WebSocket-powered instant messaging
- **Message History**: Persistent storage of conversation history
- **Read Receipts**: Track which messages have been read
- **Online Status**: See which friends are currently online
- **Typing Indicators**: Real-time typing status in conversations

#### WebSocket Events
- **send-message**: Send a new message
- **new-message**: Receive incoming messages
- **typing**: Send/receive typing indicators
- **user-online/offline**: Track friend online status
- **messages-read**: Message read confirmations

### Notifications System

#### Notification Types
- **FRIEND_REQUEST**: New friend request received
- **FRIEND_ACCEPTED**: Friend request was accepted
- **MESSAGE_RECEIVED**: New message from friend
- **TOURNAMENT_START**: Tournament you joined has started
- **TOURNAMENT_WIN**: You won a tournament
- **LEVEL_UP**: You gained a new level
- **BADGE_EARNED**: You earned a new achievement badge

#### Features
- **Real-time Delivery**: Instant notifications via WebSocket
- **Notification Bell**: UI indicator showing unread count
- **Mark as Read**: Individual or bulk mark as read
- **Notification History**: Access to past notifications
- **Smart Routing**: Click notifications to navigate to relevant content

### UI Components

#### Friends Page
- **Tabbed Interface**: Friends list, requests, and add friends
- **Search Functionality**: Find friends in your list
- **Request Management**: Accept/decline incoming requests
- **Friend Cards**: Rich display with user stats and actions

#### Chat Sidebar
- **Conversation List**: All active conversations
- **Real-time Chat**: Live messaging interface
- **Message Composition**: Text input with send functionality
- **Unread Indicators**: Visual cues for new messages

#### Notification Bell
- **Dropdown Menu**: Quick access to recent notifications
- **Unread Badge**: Visual indicator of notification count
- **Action Routing**: Direct navigation to relevant content
- **Mark All Read**: Bulk action for notification management

### Security Features
- **Friend-only Messaging**: Users can only message their friends
- **Request Validation**: Prevent duplicate or self friend requests
- **Message Authorization**: Verify sender permissions
- **Notification Privacy**: Users only see their own notifications

### Performance Optimizations
- **Pagination**: Efficient loading of friends and messages
- **Real-time Updates**: WebSocket connections for instant updates
- **Lazy Loading**: Load conversations and messages on demand
- **Caching**: Optimized API responses with proper caching headers

## 📺 TecnoGamerz YouTube Integration System (Live Feature)

The TecnoGamerz YouTube Integration provides a comprehensive video platform with enhanced features, offering much more than simple YouTube embeds. Users get richer video experiences with transcripts, quizzes, clips, progress tracking, and gamification.

### Core Value Proposition
- **Enhanced Video Experience**: Watch TecnoGamerz videos with transcripts, progress tracking, and interactive features
- **Gamified Learning**: Earn XP and coins by watching videos and completing quizzes
- **Community Clips**: Create and share highlight clips from videos
- **Progress Tracking**: Never lose your place - resume watching where you left off
- **Interactive Quizzes**: Test knowledge with video-specific quizzes for rewards
- **Official Content Priority**: TecnoGamerz official content prominently featured

### Video Management Features

#### YouTube API Integration
- **Automated Sync**: Sync latest videos from TecnoGamerz YouTube channel
- **Metadata Extraction**: Automatic title, description, tags, and thumbnail import
- **Transcript Fetching**: Import video captions when available
- **Background Processing**: BullMQ-powered sync jobs for performance
- **Fallback Mode**: Graceful degradation when API key unavailable

#### Admin Video Management
- **Sync Controls**: `/admin/videos/sync` endpoint for manual channel sync
- **Bulk Operations**: Sync multiple videos with force refresh option
- **Channel Management**: Support for multiple channels (expandable beyond TecnoGamerz)
- **Metadata Updates**: Background jobs to update video metadata periodically

### User Experience Features

#### Video Discovery & Search
- **Advanced Filtering**: Search by title, description, tags, or official content only
- **Smart Sorting**: Sort by newest, oldest, most viewed, or alphabetically
- **Tag System**: Filter content by gaming topics and categories
- **Official Badges**: Clear identification of TecnoGamerz official content
- **Pagination**: Efficient loading with pagination support

#### Enhanced Video Player
- **YouTube Integration**: Seamless YouTube player embedding with custom controls
- **Progress Tracking**: Automatic watch progress saving and resume functionality
- **Auto-completion**: Videos marked complete at 90% watch progress
- **View Analytics**: Platform-specific view counting (separate from YouTube views)
- **Responsive Design**: Mobile-optimized video viewing experience

#### Interactive Features
- **Video Interactions**: Like, watch, comment, clip, and completion tracking
- **Transcript Panel**: Collapsible transcript viewer for better accessibility
- **Highlight Clips**: Users can create timestamped video clips to share
- **Social Sharing**: Easy sharing of videos with custom platform features
- **Related Videos**: Smart recommendations from same channel

#### Gamification & Rewards
- **XP System**: Earn experience points for watching videos and completing content
- **Completion Rewards**: Bonus XP for finishing videos (90%+ watch time)
- **Quiz Integration**: Interactive quizzes attached to videos with XP/coin rewards
- **Progress Badges**: Visual indicators for completed videos, liked content, and quiz achievements
- **Official Content Bonus**: Extra rewards for engaging with TecnoGamerz official videos

### Technical Implementation

#### Database Architecture
```prisma
model Channel {
  id         String @id @default(uuid())
  name       String
  source     String @default("youtube")
  externalId String @unique // YouTube channel ID
  videos     Video[]
}

model Video {
  id                String              @id @default(uuid())
  title             String
  description       String?
  youtubeId         String              @unique
  duration          Int?                // Duration in seconds
  publishedAt       DateTime?
  thumbnails        Json?               // YouTube thumbnail URLs
  tags              String[]
  transcript        String?
  views             Int                 @default(0)
  channel           Channel             @relation(fields: [channelId], references: [id])
  videoInteractions VideoInteraction[]
  videoQuizzes      VideoQuiz[]
  videoClips        VideoClip[]
}

model VideoInteraction {
  id       String                @id @default(uuid())
  userId   String
  videoId  String
  action   VideoInteractionType  // WATCH, LIKE, COMMENT, CLIP, COMPLETE
  progress Int?                  // Watch progress percentage
  metadata Json?
}
```

#### API Endpoints
```
Videos:
GET    /videos                    # Paginated video listing with filters
GET    /videos/:id               # Video details with user progress
GET    /videos/:id/transcript    # Video transcript
POST   /videos/:id/interaction   # Record user interaction
POST   /videos/clips             # Create video clip

Admin:
POST   /admin/videos/sync        # Sync videos from YouTube channel

Filtering & Search:
GET /videos?search=term          # Search in titles/descriptions
GET /videos?tag=Gaming           # Filter by tag
GET /videos?official=true        # Show only TecnoGamerz official videos
GET /videos?sort=most_viewed     # Sort options
```

#### YouTube Data API Integration
- **Channel Videos**: Fetch latest videos from TecnoGamerz channel
- **Video Metadata**: Import titles, descriptions, tags, thumbnails, duration
- **Captions Support**: Fetch available captions/transcripts (when accessible)
- **Rate Limiting**: Respect YouTube API quotas with intelligent caching
- **Error Handling**: Graceful fallbacks when API is unavailable

#### Stream Management API
- **PATCH /tournaments/:id/stream**: Update tournament stream URL (admin/mod only)
- **Stream Validation**: Backend validation ensures only valid YouTube/Twitch URLs
- **Tournament Integration**: Streams appear as dedicated tab in tournament detail view

### User Content Sharing System

#### Content Creation
- **Video Sharing**: Users can share YouTube/Twitch gaming videos with the community
- **Content Validation**: Input validation ensures proper video URLs and titles
- **User Ownership**: Users can manage (create/delete) their own content
- **Platform Integration**: Supports YouTube and Twitch video sharing

#### Community Features
- **Community Page**: Dedicated `/community` page showcasing all user content
- **Content Grid**: Responsive grid layout displaying video thumbnails and details
- **Official Prioritization**: Tecno Gamerz official content featured prominently
- **Creator Attribution**: Clear attribution showing content creator information

### Content Management API

#### User Content Endpoints
- **POST /content**: Create new user content (authenticated users only)
- **GET /content**: Retrieve all community content with sorting
- **DELETE /content/:id**: Delete own content (content owner only)

#### Content Features
- **Ownership Validation**: Users can only delete their own content
- **Content Sorting**: Official content prioritized, then by creation date
- **Rich Metadata**: Content includes title, video URL, creator info, and timestamps

### Homepage Integration

#### Featured Streams Section
- **Live Tournament Streams**: Homepage showcases active tournament streams
- **Community Highlights**: Featured user-generated content on homepage
- **Official Content Priority**: Tecno Gamerz official content prominently displayed
- **Dynamic Content**: Real-time loading of latest streams and community content

#### Stream Discovery
- **Featured Tournament**: Active tournaments with streams highlighted on homepage
- **Community Grid**: Top 3 community videos displayed in hero section
- **Navigation Integration**: Easy access to full community page and tournament details
- **Call-to-Action**: Encourage content creation and tournament participation

### Technical Implementation

#### Stream Embed Component
- **Platform Detection**: Automatic YouTube/Twitch URL parsing and embed generation
- **Responsive Design**: Video players adapt to container sizes
- **Official Badging**: Visual indicators for official Tecno Gamerz content
- **Error Handling**: Graceful handling of invalid URLs or unavailable videos

### Setup & Configuration

#### YouTube API Setup
1. **Google Cloud Console Setup**:
   ```bash
   # Visit https://console.cloud.google.com/
   # Create a new project or select existing
   # Enable YouTube Data API v3
   # Create API credentials (API key)
   # Set API key restrictions (optional but recommended)
   ```

2. **Environment Configuration**:
   ```bash
   # Add to your .env file
   YOUTUBE_API_KEY=your-youtube-data-api-key
   YOUTUBE_CHANNEL_ID=UCnuGhurhojQ8w6ksRZGcGOg  # TecnoGamerz channel ID
   VIDEO_SYNC_ENABLED=true
   ```

3. **Database Migration**:
   ```bash
   # Apply the new video schema
   pnpm db:migrate
   
   # Seed sample videos (optional)
   pnpm db:seed
   ```

#### Initial Video Sync
```bash
# Sync first batch of TecnoGamerz videos
curl -X POST http://localhost:3001/admin/videos/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "channelId": "UCnuGhurhojQ8w6ksRZGcGOg",
    "maxResults": 50,
    "forceRefresh": false
  }'
```

### Frontend Pages & Routes

#### Video Discovery
- **`/videos`**: Main video listing page with search and filters
- **`/videos?search=GTA`**: Search videos by title/description
- **`/videos?tag=Gaming`**: Filter by specific tags
- **`/videos?official=true`**: Show only TecnoGamerz official content
- **`/videos?sort=most_viewed`**: Sort by popularity/date

#### Video Viewing
- **`/videos/[id]`**: Individual video page with player and features
- **Enhanced Player**: YouTube embed with progress tracking
- **Transcript Panel**: Searchable, collapsible transcript viewer
- **Related Videos**: Sidebar with channel's other content
- **Interactive Elements**: Like, share, clip creation, quizzes

#### User Features
- **Progress Tracking**: Visual progress bars on video cards
- **Completion Badges**: Indicators for finished videos
- **Quiz Integration**: Take quizzes directly on video pages
- **Clip Creation**: Create and share timestamped highlights
- **Watch History**: Resume videos where you left off

### Performance & Scalability

#### Caching Strategy
- **Video Metadata**: Cache video information in database
- **Thumbnails**: Local thumbnail caching for faster loading
- **API Responses**: Redis caching for frequent API calls
- **User Progress**: Efficient storage of watch progress and interactions

#### Background Processing
- **Sync Jobs**: BullMQ queues for YouTube API calls
- **Metadata Updates**: Periodic refresh of video information
- **View Tracking**: Debounced view count updates per user
- **Transcript Processing**: Background caption fetching and processing

#### Monitoring & Analytics
- **Video Performance**: Track which videos are most popular
- **User Engagement**: Monitor watch completion rates and interactions
- **API Usage**: Track YouTube API quota usage and optimization
- **Error Tracking**: Log sync failures and API errors for debugging

### Security & Privacy

#### API Security
- **Server-side Keys**: YouTube API key stored securely on backend
- **Rate Limiting**: Respect YouTube API quotas and implement backoff
- **Input Validation**: Sanitize all user inputs for video interactions
- **CORS Policy**: Proper cross-origin resource sharing configuration

#### User Privacy
- **Watch Privacy**: User watch progress stored securely
- **Interaction Data**: User likes/clips associated with accounts only
- **Anonymous Viewing**: Basic video access without required authentication
- **Data Retention**: Configurable retention policies for user interaction data

### Future Enhancements

#### Advanced Features (Roadmap)
- **Live Stream Integration**: Real-time stream embedding for live videos
- **Community Comments**: Platform-specific commenting system
- **Video Playlists**: Curated playlists and learning paths
- **Offline Viewing**: Download videos for offline viewing
- **Multi-Channel Support**: Expand beyond TecnoGamerz to other gaming channels

#### AI-Powered Features
- **Smart Recommendations**: ML-based video recommendations
- **Auto-Generated Quizzes**: AI-created quizzes from video content
- **Sentiment Analysis**: Analyze user engagement and feedback
- **Content Moderation**: Automated moderation for user-generated clips

### UI/UX Features

#### Stream Integration
- **Tournament Tabs**: Stream tab appears when tournament has stream URL
- **Video Player**: Full-featured embedded players for YouTube/Twitch
- **Official Indicators**: Crown badges and special styling for official content
- **Responsive Layout**: Mobile-optimized video viewing experience

#### Community Interface
- **Content Grid**: Clean, Pinterest-style grid layout for content browsing
- **Creator Cards**: Rich user information with avatars and usernames
- **Content Actions**: Create, view, and delete actions for content management
- **Search & Discovery**: Easy navigation between community content and tournaments

#### Content Creation
- **Modal Dialog**: Clean content creation interface
- **Form Validation**: Real-time validation for titles and video URLs
- **Platform Support**: Clear indication of supported platforms (YouTube/Twitch)
- **Instant Updates**: Real-time content grid updates after creation

### Security & Validation

#### Content Security
- **URL Validation**: Backend validation ensures only legitimate YouTube/Twitch URLs
- **User Authentication**: Content creation requires user authentication
- **Ownership Checks**: Users can only modify their own content
- **Input Sanitization**: All user inputs properly sanitized and validated

#### Stream Security
- **Admin-Only Stream Management**: Only admins/mods can update tournament streams
- **URL Validation**: Stream URLs validated for proper format and platform support
- **Tournament Ownership**: Stream updates respect tournament ownership rules
- **Audit Logging**: All stream updates logged for security tracking

## 💳 Payment System (Live Feature)

The platform now includes a comprehensive, secure payment system powered by Stripe, supporting tournament entry fees, subscriptions, and marketplace purchases.

### 🚀 Payment Features

#### Core Payment Infrastructure
- **Stripe Integration**: Full Stripe Checkout integration with webhook handling
- **Security First**: PCI compliance through Stripe, no sensitive card data storage
- **Webhook Security**: Signature verification and idempotency handling
- **Admin Controls**: Complete refund functionality and payment management

#### Tournament Payment Flow
- **Entry Fees**: Support for paid tournament registration with automatic validation
- **Smart Validation**: Prevents duplicate registration and validates tournament capacity
- **Payment Status Tracking**: Real-time payment status updates and notifications
- **Automatic Registration**: Users automatically added to tournament after successful payment

#### Subscription Management
- **Multiple Plans**: Basic ($9.99), Pro ($19.99), Premium ($29.99) subscription tiers
- **Feature-Rich Plans**: Different feature sets and benefits for each subscription level
- **Subscription UI**: Beautiful subscription selection interface with plan comparisons
- **Billing Management**: Stripe-powered subscription lifecycle management

#### Shop Integration
- **Product Payments**: Complete infrastructure for marketplace/shop functionality
- **Flexible Metadata**: Support for any product type with custom metadata
- **Purchase Flow**: Seamless checkout experience for digital and physical products

### 💻 Payment API Endpoints

```
Payment Management:
POST   /payments/create-checkout-session  # Create Stripe checkout session
POST   /payments/webhook                  # Handle Stripe webhook events (secure)
GET    /payments/:id/status               # Check payment status
GET    /payments/my-payments              # Get user's payment history

Admin Operations:
POST   /payments/:id/refund               # Refund a payment (Admin only)
GET    /payments/admin/all                # Get all payments with filters (Admin only)
```

### 🎮 Tournament Integration

#### Enhanced Tournament Features
- **Entry Fee Support**: Tournaments can now have entry fees with currency handling
- **Maximum Participants**: Participant limits with payment validation
- **Prize Pool Tracking**: Automatic prize pool calculation based on entry fees
- **Payment Validation**: Smart validation prevents registration issues

#### Tournament Payment Flow
```tsx
// Tournament with entry fee
const tournament = {
  id: 'tournament-uuid',
  title: 'Championship Tournament',
  entryFee: 2000, // $20.00 in cents
  currency: 'USD',
  maxParticipants: 100
};

// Payment button component
<TournamentPaymentButton 
  tournament={tournament}
  isParticipant={false}
/>
```

### 💎 Subscription Plans

#### Plan Features
- **Basic Plan ($9.99/month)**:
  - Join unlimited free tournaments
  - Basic leaderboard access
  - Community features
  - Basic profile customization

- **Pro Plan ($19.99/month)**:
  - Everything in Basic
  - Priority tournament registration
  - Advanced statistics
  - Custom badges
  - Early access to new features

- **Premium Plan ($29.99/month)**:
  - Everything in Pro
  - VIP tournament access
  - Personal gaming coach
  - Exclusive premium tournaments
  - Custom profile themes
  - Priority customer support

#### Subscription UI
```tsx
// Subscription selection component
<SubscriptionPlans currentPlan={user.subscription?.plan} />
```

### 🔒 Security & Compliance

#### Payment Security
- **🛡️ PCI Compliance**: All card handling through Stripe Checkout
- **🔐 Webhook Security**: Signature verification for all webhook events
- **🚫 No Card Storage**: Zero sensitive payment data stored locally
- **🔑 Authentication**: All payment endpoints properly authenticated
- **⚡ Rate Limiting**: Protection against payment abuse and fraud
- **📝 Audit Logging**: Comprehensive payment activity logging

#### Data Protection
- **Encrypted Communications**: All payment communications encrypted in transit
- **Secure Tokens**: JWT-based authentication for payment endpoints
- **Input Validation**: Comprehensive validation of all payment inputs
- **Error Handling**: Secure error messages that don't leak sensitive information

### 📊 Database Schema

#### Payment Models
```sql
-- Payment transactions table
CREATE TABLE payments (
  id                        UUID PRIMARY KEY,
  user_id                   UUID REFERENCES users(id),
  amount                    MONEY NOT NULL,
  currency                  VARCHAR(3) DEFAULT 'USD',
  type                      payment_type NOT NULL,
  status                    payment_status DEFAULT 'PENDING',
  external_payment_id       VARCHAR, -- Stripe payment intent ID
  stripe_checkout_session_id VARCHAR, -- Stripe session ID
  metadata                  JSON,
  refunded_amount          MONEY,
  refunded_at              TIMESTAMP,
  created_at               TIMESTAMP DEFAULT NOW(),
  updated_at               TIMESTAMP DEFAULT NOW()
);

-- Subscription management table
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY,
  user_id               UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id    VARCHAR,
  status                subscription_status,
  plan                  subscription_plan,
  current_period_start  TIMESTAMP,
  current_period_end    TIMESTAMP,
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMP DEFAULT NOW()
);
```

#### Enhanced Tournament Schema
```sql
-- Updated tournaments table with payment support
ALTER TABLE tournaments ADD COLUMN entry_fee MONEY;
ALTER TABLE tournaments ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE tournaments ADD COLUMN max_participants INTEGER;
ALTER TABLE tournaments ADD COLUMN prize_pool MONEY;

-- Updated tournament participants with payment tracking
ALTER TABLE tournament_participants ADD COLUMN payment_id UUID;
ALTER TABLE tournament_participants ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;
```

### 🎯 Usage Examples

#### Custom Payment Button
```tsx
import { PaymentButton } from '@/components/payments/PaymentButton';

// For product purchases
<PaymentButton 
  paymentData={{
    type: 'PURCHASE',
    amount: 1999, // $19.99 in cents
    productId: 'product-uuid',
    metadata: { productName: 'Gaming Headset' }
  }}
/>

// For subscriptions  
<PaymentButton 
  paymentData={{
    type: 'SUBSCRIPTION',
    amount: 1999, // $19.99/month
    subscriptionPlan: 'PRO'
  }}
/>
```

#### Payment Service Usage
```tsx
import { paymentService } from '@/lib/services/payment-service';

// Create tournament payment
const session = await paymentService.createTournamentPayment(
  tournamentId,
  2000, // $20.00 in cents
  { tournamentName: 'Championship' }
);

// Redirect to Stripe Checkout
await paymentService.redirectToCheckout(session.sessionId);

// Check payment status
const payment = await paymentService.getPaymentStatus(paymentId);
```

### 🔧 Environment Configuration

#### Required Environment Variables
```bash
# Stripe Configuration (Backend)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Configuration (Frontend)  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

#### Stripe Setup Steps
1. **Create Stripe Account**: Sign up at https://stripe.com
2. **Get API Keys**: Copy your publishable and secret keys from the Stripe dashboard
3. **Configure Webhooks**: Set up webhook endpoint at `your-api-domain/api/v1/payments/webhook`
4. **Webhook Events**: Subscribe to these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 🚦 Testing & Development

#### Local Development
```bash
# Install Stripe CLI for webhook testing
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/api/v1/payments/webhook

# Use test data
stripe fixtures fixtures/test_data.json
```

#### Test Cards
```
# Successful payment
4242 4242 4242 4242

# Declined payment  
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

### 📈 Analytics & Monitoring

#### Payment Metrics
- **Revenue Tracking**: Real-time revenue analytics
- **Conversion Rates**: Payment completion rates by flow type
- **Failed Payments**: Analysis of failed payment reasons
- **Subscription Metrics**: MRR, churn, and growth rates

#### Admin Dashboard
- **Payment Overview**: Recent payments and trends
- **Refund Management**: Process refunds with audit trail
- **Subscription Management**: View and manage all subscriptions
- **Revenue Reports**: Detailed financial reporting

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
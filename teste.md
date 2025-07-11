# OpinaLocal - Restaurant Review Platform

## Overview

OpinaLocal is a full-stack restaurant review platform built with React on the frontend and Node.js/Express on the backend. The application allows users to discover restaurants, create detailed reviews with photos and ratings, and manage restaurant data through an admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 2025**: Migrated from in-memory storage to PostgreSQL database
- **January 2025**: Added database seeding with sample data (restaurants, categories, reviews)
- **January 2025**: Fixed Firebase authentication with proper error handling
- **January 2025**: Added RestaurantRegistrationModal component with address autocomplete simulation
- **January 2025**: Integrated Firebase Authentication with environment variables
- **January 2025**: Application fully functional with complete restaurant review workflow

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for global state (auth, app state)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Authentication System
- **Provider**: Firebase Authentication
- **Methods**: Email/password and Google OAuth
- **User Management**: Automatic user creation in local database upon first login
- **Session Handling**: Firebase tokens with custom user data sync

### Database Schema
- **Users**: Firebase UID linking, email, name, photo URL
- **Restaurants**: Name, address (JSON), location coordinates, validation status
- **Categories**: Custom rating categories with admin approval system
- **Reviews**: Text content, photos, visit date, ratings (standard + custom), overall rating

### Core Features
1. **Restaurant Discovery**: Search and browse restaurants with validation status
2. **Review Creation**: Multi-step form with restaurant selection, custom categories, and photo uploads
3. **Rating System**: Standard categories (Food, Service, etc.) plus custom user-defined categories
4. **Admin Panel**: Category approval and restaurant validation management
5. **Photo Upload**: Drag-and-drop interface with preview functionality

## Data Flow

### User Authentication Flow
1. User authenticates via Firebase (email/password or Google)
2. Frontend receives Firebase user object
3. System checks for existing user in local database
4. If new user, creates record with Firebase UID as key
5. User context provides both Firebase user and local user data

### Review Creation Flow
1. User searches for restaurant (live search with debouncing)
2. If restaurant not found, modal allows creation of new restaurant
3. User selects or creates custom rating categories
4. Multi-step form collects review data, photos, and ratings
5. Overall rating calculated from individual category ratings
6. Review submitted to backend with user ID and restaurant ID

### Data Synchronization
- TanStack Query handles caching and background refetching
- Mutations trigger cache invalidation for affected queries
- Optimistic updates for better user experience

## External Dependencies

### Firebase Integration
- Authentication service for user management
- Google OAuth provider for social login
- Client-side SDK for auth state management

### Database Infrastructure
- **PostgreSQL**: Persistent database with full ACID compliance
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection**: Environment-based DATABASE_URL configuration
- **Seeding**: Automated sample data initialization with default categories and restaurants

### UI Components
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- Express backend with TypeScript compilation via tsx
- Database migrations via Drizzle Kit
- Environment variables for Firebase and database configuration

### Production Build
- Frontend: Vite build outputs to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Single deployment artifact with static file serving
- Environment-based configuration for database and Firebase

### Database Management
- Schema defined in `shared/schema.ts` for type safety
- Migrations managed through Drizzle Kit
- Development uses `db:push` for schema synchronization
- Persistent storage replaces in-memory storage for production-ready data handling
- Seeding script available in `server/seed.ts` for initial data setup

The application follows a monorepo structure with shared types between frontend and backend, enabling full-stack type safety and efficient development workflows.
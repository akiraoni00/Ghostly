# Milanote Clone Application

## Overview

This is a full-stack web application that replicates the functionality of Milanote, a visual project management and mood board tool. The application allows users to create boards, add various types of content items (notes, images, links), and organize them visually on a canvas with drag-and-drop functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks (useState, useEffect, useCallback) for local state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with CSS custom properties for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session store
- **API Structure**: RESTful API with `/api` prefix

### Key Components

#### Frontend Components
- **MilanoteClone**: Main application component handling board management, tool selection, and canvas interactions
- **UI Components**: Complete shadcn/ui component library including buttons, dialogs, forms, and interactive elements
- **Routing**: Simple routing setup with home page and 404 handling

#### Backend Components
- **Express Server**: Main application server with middleware for JSON parsing, logging, and error handling
- **Storage Interface**: Abstract storage layer with in-memory implementation for development
- **Database Schema**: User management schema with Drizzle ORM integration
- **Route Registration**: Centralized route management system

## Data Flow

### Client-Side Data Management
1. **Board State**: Boards are managed in local React state with hierarchical structure
2. **Tool Selection**: Various tools (select, note, image, etc.) for content creation
3. **Drag and Drop**: Canvas-based interaction with zoom and pan capabilities
4. **History Management**: Undo/redo functionality for user actions
5. **File Handling**: Image upload and management for board content

### Server-Side Data Flow
1. **Request Processing**: Express middleware handles authentication, parsing, and logging
2. **Storage Layer**: Abstract interface allows switching between in-memory and database storage
3. **Database Operations**: Drizzle ORM provides type-safe database interactions
4. **Session Management**: PostgreSQL-based session storage for user authentication

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Form Handling**: React Hook Form with Zod validation
- **Utilities**: date-fns, clsx for conditional classes

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds

### Development Dependencies
- **Build Tools**: Vite, TypeScript compiler, PostCSS
- **Code Quality**: ESLint configuration, Prettier (implied)
- **Replit Integration**: Vite plugins for Replit environment

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR (Hot Module Replacement)
- **Database**: Neon Database with environment-based connection string
- **Asset Handling**: Vite handles static assets and client-side routing

### Production Build
- **Client Build**: Vite builds optimized React application to `dist/public`
- **Server Build**: esbuild bundles Node.js server to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL required for database connection

### Key Configuration Files
- **Vite Config**: Client-side build configuration with React and TypeScript
- **Drizzle Config**: Database schema and migration configuration
- **Tailwind Config**: Styling configuration with custom theme variables
- **TypeScript Config**: Shared configuration for client, server, and shared code

### Architecture Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **Type Safety**: Full TypeScript implementation across frontend and backend
3. **Database Choice**: PostgreSQL with Drizzle ORM for type-safe database operations
4. **UI Framework**: shadcn/ui with Tailwind CSS for consistent, customizable components
5. **State Management**: React Query for server state, local React state for UI interactions
6. **Development Experience**: Vite for fast development, comprehensive TypeScript support

The application is designed to be scalable, maintainable, and developer-friendly while providing a rich user experience for visual project management.
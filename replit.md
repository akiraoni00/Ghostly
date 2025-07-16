# Ghostly - Obsidian + Milanote Hybrid Application

## Overview

This is a comprehensive note-taking and visual project management application that combines the best features of Obsidian and Milanote. The application allows users to create boards, add various types of content items (notes, text files, images, links), organize them visually on a canvas, and view connections between documents through an interactive node graph. Key features include resizable/draggable text file editors, tag-based organization, and visual knowledge mapping.

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
- **MilanoteClone**: Main application component handling board management, tool selection, canvas interactions, text file editing, and node graph visualization
- **Text File System**: Full-featured text file creation with Markdown support, tag association, and inline editing
- **Node Graph**: Interactive visualization showing connections between text files based on shared tags
- **Floating Editors**: Draggable, resizable text file editors with minimize/close functionality
- **Tag Management**: Color-coded tag system for organizing and connecting documents
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
2. **Tool Selection**: Various tools (select, board, text file, note, image, line, link, todo, tag) for content creation
3. **Drag and Drop**: Canvas-based interaction with zoom and pan capabilities for all items
4. **History Management**: Undo/redo functionality for user actions
5. **File Handling**: Image upload and management for board content
6. **Text File Management**: Full text editing with auto-save, tag association, and content preview
7. **Editor State**: Multiple floating editors with position, size, and minimization state
8. **Tag System**: Persistent tag storage with color coding and association tracking
9. **Node Graph**: Dynamic connection visualization based on shared tags between documents

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

## Recent Changes (January 2025)

### Major Feature Addition: Obsidian Integration
- **Text Files**: Added full-featured text file creation and editing with Markdown support
- **Node Graph**: Implemented interactive node graph showing document connections via shared tags
- **Floating Editors**: Created draggable, resizable text editors with minimize/close functionality
- **Tag System**: Implemented comprehensive tag management with color coding and visual organization
- **Enhanced UI**: Updated toolbar with new tools and node graph toggle in top navigation
- **Board Icon**: Changed board icon from letters to simple square for better visual clarity

### Technical Improvements
- **Editor Management**: Added complete state management for multiple open editors
- **Drag & Resize**: Implemented editor window dragging and corner resize handles
- **Tag Associations**: Built tag-based connection system for knowledge graph functionality
- **Visual Enhancements**: Maintained consistent pink (#f4c2c2) theme throughout new features

### Latest Addition: Seamless Auto-Loading System (January 2025)
- **Favorite Directory System**: Set a favorite project directory that persists across app sessions
- **Auto-Loading on Startup**: App automatically loads project from favorite directory when started
- **Seamless Import/Auto-Save**: Importing a directory automatically sets it as favorite and enables auto-save
- **Continuous Sync**: Auto-save syncs changes to favorite directory every 60 seconds
- **Visual Status Indicator**: Green pulsing dot shows when auto-sync is active
- **Self-Hosted Workflow**: Perfect integration for local development with persistent data
- **Directory-Only Import**: Simplified to only support directory import (no single files)
- **Persistent Configuration**: Favorite directory path saved locally for seamless app restarts

The application now provides a completely seamless self-hosted experience where users can set up their project directory once and have it automatically load and sync across all app sessions, enabling permanent local data storage without any cloud dependencies.
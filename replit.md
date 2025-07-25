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

### Latest UI Improvements (January 2025)
- **New Hand Tool Icon**: Replaced broken hand icon with clean, minimalist SVG that matches the app's design language
- **Search Functionality**: Completely removed node graph and replaced with comprehensive search feature
  - Accessible via Ctrl+Enter keyboard shortcut
  - Searches through all boards, items, and content
  - Clean, IDE-style search interface with instant results
  - Double-click to navigate to boards directly
- **Fixed Link Tool**: Complete overhaul of link editing functionality
  - Fixed width calculation and resizing issues
  - Proper dual-field editing (title and URL)
  - Enhanced visual feedback during editing
  - Smooth tab navigation between title and URL fields
  - Proper color highlighting during edit mode

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

### Latest Migration & Storage System Overhaul (January 2025)
- **Complete Migration to Replit Environment**: Successfully migrated from Replit Agent to standard Replit with full compatibility
- **Redesigned Storage System**: Completely rebuilt the project manager with working file-based import/export
- **Robust Auto-Save**: Enhanced localStorage-based auto-save system that works every 60 seconds when enabled
- **Seamless Import/Export**: File-based project import/export system using JSON format for complete data persistence
- **Favorite Directory Setup**: Simplified favorite directory system for organizational purposes and auto-save enablement
- **Local Browser Storage**: Reliable localStorage backup system with manual save and automatic recovery options
- **Enhanced Project Manager UI**: Clean, intuitive interface with proper loading states and error handling
- **Self-Hosted Data Persistence**: Complete local data management without external dependencies
- **Backup & Recovery**: Download latest backup functionality and manual save options for data security

### UI/UX Improvements (January 2025)
- **Hand Tool Icon**: Replaced with proper hand/grab cursor icon that clearly represents the hand tool functionality
- **Color Picker Optimization**: Streamlined color picker interface with reduced quick colors, removed unnecessary text labels, more compact design
- **Advanced Color Picker**: Enhanced with mouse drag support for smooth color selection, improved responsiveness
- **Minimalist Design**: Removed verbose labels like "color picker", "advanced color picker", "quick colors" for cleaner interface
- **Color Consistency**: Ensured color space in advanced picker matches the gradient and selected colors accurately

The application now provides a robust, self-hosted experience with reliable data persistence through browser localStorage and file-based import/export, ensuring users never lose their work and can easily backup and restore their projects across sessions.

### Latest Migration & Advanced Features (January 2025)
- **Complete Replit Agent to Standard Replit Migration**: Successfully migrated from Replit Agent environment to standard Replit with full compatibility and proper client/server separation
- **Advanced Keyboard Shortcuts System**: Fully customizable keyboard shortcuts with JSON export/import support, editable through Settings modal by clicking shortcut buttons
- **Enhanced Link Component**: Complete link tool overhaul with readable text styling, proper click handling for opening links in new tabs, and embedded video player support for YouTube, Vimeo, and Dailymotion
- **Independent Media Timeline**: Persistent top-right media player showing all audio/video playback across boards, with clickable progress bars and individual track controls
- **Advanced Tag Color Management**: Enhanced Tag Manager with color picker accessible by clicking tag dots, supporting 20+ predefined colors with immediate visual feedback
- **Cross-Board Media Persistence**: Audio playback continues independently when switching between boards, maintaining global media state
- **Improved User Experience**: Fixed text readability in link components, enhanced click event handling, and streamlined media controls for better workflow efficiency

### Latest UI/UX Improvements (January 2025)
- **Minimal Audio Interface**: Redesigned audio bars with clean, polished interface using dark theme and subtle highlights
- **Enhanced Editing Behavior**: Clicking canvas now properly exits editing mode for any object being edited
- **Comprehensive Audio Manager**: Minimal floating audio manager that persists across board navigation with clean progress bars
- **Improved Text Rendering**: Ensured proper white text rendering in document file titles and content areas
- **Streamlined Media Controls**: Compact play/pause buttons and progress bars with professional appearance

### Technical Improvements (January 2025)
- **Robust Media Handling**: Independent audio element management with proper cleanup and state synchronization
- **Enhanced Event Handling**: Improved click event propagation and editing mode detection for link components
- **Persistent State Management**: Media timeline and audio playback state maintained across board navigation
- **Color System Integration**: Tag color updates with immediate localStorage persistence and visual feedback
- **Keyboard Shortcut Management**: Dynamic shortcut editing with conflict prevention and instant application
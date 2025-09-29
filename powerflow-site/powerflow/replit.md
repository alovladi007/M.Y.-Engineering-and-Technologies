# Overview

PowerFlow is a modern full-stack platform for power electronics control, simulation, and hardware-in-the-loop testing. It provides a comprehensive solution for managing power conversion systems with real-time monitoring, simulation capabilities, and direct hardware integration. The platform enables engineers to design, test, and deploy power electronics control systems through an intuitive web interface backed by robust APIs and real-time data streaming.

The platform now includes advanced Solid-State Transformer (SST) capabilities for medium-frequency conversion chains in EV charging and renewable applications, along with a comprehensive billing and subscription management system.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## September 8, 2025
- **SST (Solid-State Transformer) Module**: Added comprehensive SST functionality including:
  - 3-stage cascade architecture support (NPC3L → DAB → INV/DC)
  - Medium-frequency transformer (MFT) designer with core selection and loss analysis
  - SiC/GaN device comparison tool with characteristic curves
  - SST chain builder with drag-and-drop interface
  - Simulation and optimization capabilities for ZVS operation
  - Backend API with endpoints for designs, cores, materials, devices, simulation, and optimization

- **Billing & Subscription System**: Implemented multi-tier billing with:
  - Free, Pro, and Enterprise plans with different feature limits
  - Usage tracking for simulation minutes, devices, projects, telemetry storage, and SST designs
  - Progress bars showing current usage vs. plan limits
  - Invoice history and payment management interface
  - Quota enforcement and upgrade flow
  - Stripe integration preparation for payment processing

- **Navigation Enhancement**: Added SST and Billing tabs to the main navigation for easy access to new features

- **API Extensions**: Extended NestJS backend with new modules:
  - SST module with comprehensive device and material databases
  - Billing module with plan management and usage tracking
  - All endpoints documented with OpenAPI/Swagger specifications

# System Architecture

## Monorepo Structure
The project uses a Turborepo-based monorepo architecture with pnpm workspaces, organizing code into distinct applications, packages, and services. The structure separates frontend applications, backend services, shared packages, and infrastructure components for scalable development and deployment.

## Frontend Architecture
Built with Next.js 14 using React 18 and TypeScript, the web application leverages server-side rendering and static generation for optimal performance. The UI is constructed using Radix UI components with Tailwind CSS for styling, providing a modern and accessible interface. State management is handled through Zustand for client-side state and TanStack Query for server state and caching.

## Backend Architecture
The API gateway is implemented using NestJS with TypeScript, providing a modular architecture through decorators and dependency injection. The system uses WebSocket connections via Socket.IO for real-time data streaming, enabling live monitoring of hardware devices and simulation results. Controllers are organized by domain (simulation, hardware, websocket, SST, billing) with standardized DTOs for data validation.

## Real-time Communication
WebSocket connections facilitate bidirectional communication between the frontend and backend, enabling real-time data streaming for simulation results, hardware monitoring, and system status updates. The gateway handles connection management, data broadcasting, and client session management.

## API Design
RESTful API endpoints follow OpenAPI/Swagger specifications with automatic documentation generation. The API provides CRUD operations for simulations, hardware device management, SST designs, billing plans, and real-time data access. Global validation pipes ensure data integrity, while CORS configuration enables cross-origin requests from the frontend.

## Development Environment
The system supports multiple development modes including individual service development, Docker containerization, and integrated development through concurrent script execution. Hot-reload capabilities are enabled for both frontend and backend services during development.

## Data Management
Mock data stores are used for hardware devices, simulation states, SST components, and billing information, simulating real-world device connections and service integration. The architecture supports easy integration with persistent storage solutions when needed.

# External Dependencies

## Core Framework Dependencies
- **Next.js 14**: React framework for the frontend application with server-side rendering capabilities
- **NestJS**: Node.js framework for building the API gateway with TypeScript and decorators
- **React 18**: JavaScript library for building user interfaces with modern hooks and concurrent features
- **TypeScript**: Type-safe JavaScript for both frontend and backend development

## UI and Styling
- **Radix UI**: Headless UI components providing accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library for consistent iconography
- **Chart.js & React-Chartjs-2**: Charting library for data visualization

## State Management and Data Fetching
- **TanStack Query**: Server state management and caching for API interactions
- **Zustand**: Lightweight state management for client-side state
- **React Hook Form**: Form management with validation support
- **Zod**: Schema validation for TypeScript

## Real-time Communication
- **Socket.IO**: Real-time bidirectional event-based communication between client and server
- **WebSockets**: Protocol for real-time data streaming and live updates

## Development and Build Tools
- **Turborepo**: Monorepo build system for managing multiple packages and applications
- **pnpm**: Fast, disk space efficient package manager with workspace support
- **Concurrently**: Utility for running multiple npm scripts simultaneously
- **Docker**: Containerization platform for development and deployment environments

## API and Documentation
- **Swagger/OpenAPI**: API documentation and specification with NestJS integration
- **Class Validator**: Decorator-based validation for DTOs and request/response objects
- **Class Transformer**: Object transformation for API data serialization

## Validation and Security
- **Passport**: Authentication middleware with JWT and local strategies
- **bcrypt**: Password hashing for secure user authentication
- **CORS**: Cross-origin resource sharing configuration for API access

# Project Architecture

## Current Features
- **Dashboard**: System overview with status cards and quick actions
- **Simulations**: Power electronics simulation interface with live charting
- **Hardware**: Device management and monitoring for HIL setups
- **Analytics**: Performance metrics and insights dashboard
- **SST (Solid-State Transformer)**: Advanced medium-frequency conversion design tools
- **Billing**: Subscription management with usage tracking and payment processing
- **Settings**: System configuration and user preferences

## API Endpoints
- `/api/simulations/*` - Simulation management and execution
- `/api/hardware/*` - Hardware device control and monitoring
- `/api/sst/*` - SST design, simulation, and optimization
- `/api/billing/*` - Billing plans, usage, invoices, and payments
- WebSocket connections for real-time data streaming

## Navigation Structure
The platform provides intuitive navigation between all major features through a persistent header navigation bar, with active state highlighting and responsive design for various screen sizes.
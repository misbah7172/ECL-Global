# Mentors Learning Platform

## Overview

This is a full-stack educational platform for Mentors, a test preparation and study abroad consulting company. The application is built as a modern web platform that allows students to enroll in courses, take mock tests, register for events, and access study materials.

## System Architecture

The application follows a monorepo structure with a clear separation between frontend and backend:

- **Frontend**: React-based single-page application built with Vite
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Payment Processing**: Stripe integration for course payments

## Key Components

### Frontend Architecture (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture (Server)
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **Payment Integration**: Stripe for handling course enrollments
- **Session Management**: Express sessions with PostgreSQL storage
- **File Structure**: Modular route handlers and storage abstraction

### Database Schema
The application uses a comprehensive PostgreSQL schema including:
- **Users**: Student/instructor/admin accounts with role-based access
- **Courses**: Course catalog with categories, pricing, and enrollment tracking
- **Enrollments**: Student-course relationships with payment status
- **Mock Tests**: Testing system with attempts and scoring
- **Events**: Educational events and seminars with registration
- **Branches**: Physical location management
- **Leads**: Contact form submissions and inquiries

## Data Flow

1. **Authentication Flow**: Users register/login through JWT-based authentication
2. **Course Discovery**: Students browse courses filtered by category and search terms
3. **Enrollment Process**: Payment processing through Stripe for course access
4. **Content Delivery**: Authenticated users access course materials and mock tests
5. **Progress Tracking**: System tracks enrollment status, test attempts, and completion
6. **Event Management**: Users can view and register for upcoming events
7. **Lead Generation**: Contact forms capture potential student inquiries

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection via Neon
- **Stripe**: Payment processing for course enrollments
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing and verification

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hook Form**: Form handling and validation

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

The application is configured for Replit deployment with:

- **Development**: `npm run dev` runs the Express server with Vite middleware
- **Production Build**: `npm run build` creates optimized client bundle and server build
- **Database**: Uses environment variable `DATABASE_URL` for PostgreSQL connection
- **Environment Variables**: Stripe keys, JWT secrets, and database credentials

The server serves both API routes and static files in production, with Vite handling hot reloading in development.

## Changelog
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
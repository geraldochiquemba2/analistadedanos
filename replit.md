# Agente de Análise de Danos com Groq API

## Overview

This is an AI-powered damage analysis application that allows users to upload images and receive detailed reports identifying all visible damages. The system uses Groq's Vision API to analyze images and generate comprehensive damage assessments with severity classifications and repair recommendations.

The application serves as an enterprise-grade damage assessment tool requiring professional presentation, clear data hierarchy, and trustworthy design to inspire confidence in automated damage analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 20, 2025 - Model Updates**
- Updated vision model from deprecated `llama-3.2-11b-vision-preview` to `meta-llama/llama-4-scout-17b-16e-instruct`
- Updated reasoning model from deprecated `deepseek-r1-distill-llama-70b` to `llama-3.3-70b-versatile`
- Implemented Groq API constraints: 5 image maximum, 3MB per raw image (≤4MB after base64 encoding)
- Added MIME type validation for image uploads
- Optimized token limits for better API compatibility (vision: 2048, reasoning: 8192)
- Two-stage analysis pipeline now uses Llama 4 Scout for vision and Llama 3.3 70B for reasoning

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server

**Routing**: Wouter for lightweight client-side routing

**State Management**: 
- TanStack Query (React Query) for server state management and data fetching
- Local React state for UI state management

**UI Component Library**: 
- Shadcn/ui components based on Radix UI primitives
- Material Design 3 design system with professional customization
- Tailwind CSS for styling with custom design tokens
- Inter font family for clarity and professionalism
- JetBrains Mono for technical details and IDs

**Form Handling**: 
- React Hook Form with Zod resolvers for validation
- React Dropzone for file upload functionality

**Design System**:
- Light and dark mode support via ThemeProvider context
- Professional blue primary color (HSL: 210 85% 45%) for trust and authority
- Severity-based color coding: green (low), yellow (moderate), red (high)
- Consistent spacing using Tailwind units (4, 6, 8, 12, 16, 24)
- Custom CSS variables for theming and hover/active states

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Design**: RESTful API with the following endpoints:
- `POST /api/analyze` - Upload images and receive damage analysis
- `GET /api/analyses` - Retrieve all historical analyses
- `GET /api/analyses/:id` - Retrieve specific analysis
- `DELETE /api/analyses/:id` - Delete specific analysis

**File Upload**: Multer middleware for handling multipart/form-data with:
- In-memory storage
- 3MB file size limit per image (ensures <4MB after base64 encoding for Groq API)
- Maximum 5 images per request (Groq API constraint)
- Image-only file type restriction (MIME type validation)

**Development Features**:
- Hot Module Replacement (HMR) via Vite
- Request logging middleware with timing and response capture
- Error handling middleware with status code and message formatting

### Data Storage Solutions

**Primary Storage**: In-memory storage (MemStorage class) for development/testing
- User management (username/password authentication ready)
- Analysis history with CRUD operations

**Database Ready**: 
- Drizzle ORM configured for PostgreSQL
- Schema defined with migration support
- Neon Database serverless driver integration
- Database schema includes:
  - Users table (id, username, password)
  - Potential for analyses table migration from in-memory to persistent storage

**Data Models**:
- Analysis: Contains summary, damage items array, severity counts, timestamps
- DamageItem: Item name, type, severity level, description, estimated impact
- User: ID, username, hashed password

### Authentication and Authorization

**Current State**: Infrastructure prepared but not actively enforced
- User schema and storage methods defined
- Password storage capability (hashing should be implemented before production)
- Session management scaffolding via connect-pg-simple

**Recommendation**: Implement proper authentication before production deployment using bcrypt for password hashing and express-session for session management.

### External Dependencies

**AI/ML Service**: 
- **Groq API** - Primary AI service for image analysis
  - **Vision Model**: `meta-llama/llama-4-scout-17b-16e-instruct` (Llama 4 Scout) - Preview model for image understanding
  - **Reasoning Model**: `llama-3.3-70b-versatile` (Llama 3.3 70B) - Production model for deep analysis and structured JSON output
  - Two-stage analysis pipeline:
    1. Vision stage: Detailed visual component and damage identification using multimodal capabilities
    2. Reasoning stage: Systematic analysis with severity classification and structured output
  - API constraints enforced: ≤5 images per request, ≤3MB per raw image (≤4MB after base64 encoding)
  - JSON mode support for structured damage items array
  - API key authentication via GROQ_API_KEY environment variable

**Design Rationale**: Groq was chosen for its vision capabilities and ability to return structured JSON responses, enabling consistent damage classification with severity levels (low/moderate/high) and detailed descriptions. The two-stage pipeline leverages specialized models for optimal accuracy, combining Llama 4 Scout's multimodal vision with Llama 3.3 70B's advanced reasoning.

**Database Service**:
- **Neon Database** - Serverless PostgreSQL
  - Connection via `@neondatabase/serverless` driver
  - Configured in drizzle.config.ts
  - DATABASE_URL environment variable required

**Development Tools**:
- **Replit Plugins** - Development experience enhancement
  - Vite plugin for runtime error modal
  - Cartographer for code visualization
  - Dev banner for development environment indication

**UI Component Dependencies**:
- **Radix UI** - Headless UI primitives for accessibility
  - 20+ component primitives (Dialog, Dropdown, Toast, etc.)
  - ARIA-compliant and keyboard navigable
- **Lucide React** - Icon library for consistent iconography

**Utility Libraries**:
- **Zod** - Runtime schema validation and TypeScript type inference
- **date-fns** - Date formatting and manipulation
- **clsx & tailwind-merge** - Conditional className utilities

### Key Architectural Decisions

**Monorepo Structure**: 
- Single repository with client, server, and shared code
- Shared schema between frontend and backend via `shared/schema.ts`
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**Type Safety**:
- End-to-end TypeScript for type safety
- Zod schemas generate both runtime validation and TypeScript types
- Drizzle-zod integration for database schema validation

**Build & Deployment**:
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.js`
- Production server serves static files from build output
- Environment-based configuration (NODE_ENV)

**Image Processing Flow**:
1. User uploads images via drag-and-drop or file picker
2. Optional description provides context
3. Images converted to base64 and sent to Groq API with detailed prompt
4. AI analyzes all images and returns structured JSON
5. Results parsed, validated, and stored
6. UI displays comprehensive damage report with severity indicators

**Error Handling Strategy**:
- API errors caught and displayed via toast notifications
- Form validation errors shown inline
- Server errors logged and returned with appropriate status codes
- Graceful degradation for missing environment variables

**Responsive Design**:
- Mobile-first approach with breakpoints
- useIsMobile hook for conditional rendering
- Drawer component for mobile navigation
- Flexible grid layouts for damage item cards
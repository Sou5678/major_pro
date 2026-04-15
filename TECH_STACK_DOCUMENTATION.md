# ResumeIQ - Complete Tech Stack Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Technologies](#core-technologies)
3. [Frontend Stack](#frontend-stack)
4. [Backend Stack](#backend-stack)
5. [AI & Machine Learning](#ai--machine-learning)
6. [Database & Storage](#database--storage)
7. [Authentication & Security](#authentication--security)
8. [File Processing](#file-processing)
9. [Development Tools](#development-tools)
10. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Project Overview

**ResumeIQ** is a modern, AI-powered resume analysis and optimization platform built with Next.js 15. It helps users analyze, optimize, and improve their resumes using advanced AI models, providing ATS compatibility scores, keyword analysis, and actionable recommendations.

**Key Features:**
- AI-powered resume analysis
- Multi-format resume upload (PDF, DOCX, LaTeX)
- Real-time resume editing with rich text editor
- ATS compatibility scoring
- Keyword optimization
- Visual analytics and charts
- User authentication (Email/Password + Google OAuth)
- Tiered pricing plans (Free, Pro, Enterprise)

---

## Core Technologies

### 1. **Next.js 15.2.3** (React Framework)
- **Purpose**: Full-stack React framework for building the application
- **Features Used**:
  - App Router (file-based routing)
  - Server Components & Client Components
  - API Routes for backend endpoints
  - Server Actions
  - Image Optimization
  - TypeScript support
  - Typed Routes for type-safe navigation

**Configuration** (`next.config.ts`):
```typescript
- typedRoutes: true (Type-safe routing)
- compress: true (Response compression)
- poweredByHeader: false (Security)
- optimizePackageImports (Tree-shaking for large libraries)
- Image optimization (AVIF, WebP formats)
```

### 2. **React 19.0.0**
- **Purpose**: UI library for building interactive user interfaces
- **Features Used**:
  - Hooks (useState, useEffect, useRef, etc.)
  - Context API for state management
  - Suspense for loading states
  - Error Boundaries

### 3. **TypeScript 5.8.2**
- **Purpose**: Type-safe JavaScript development
- **Configuration**:
  - Strict mode enabled
  - Path aliases (`@/*` for imports)
  - ES2022 target
  - Module resolution: bundler

---

## Frontend Stack

### UI Framework & Styling

#### 1. **Tailwind CSS 4.1.3**
- **Purpose**: Utility-first CSS framework
- **Custom Configuration**:
  - Custom color palette (dark theme optimized)
  - Custom fonts (Syne, DM Sans, JetBrains Mono)
  - Custom animations (shimmer, float, pulse-border)
  - Custom shadows (glow effects)
  - Responsive breakpoints

#### 2. **Radix UI** (Headless UI Components)
- **Components Used**:
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-progress` - Progress bars
  - `@radix-ui/react-slot` - Composition utilities
  - `@radix-ui/react-tooltip` - Tooltips
- **Purpose**: Accessible, unstyled UI primitives

#### 3. **Framer Motion 12.6.5**
- **Purpose**: Animation library
- **Use Cases**:
  - Page transitions
  - Component animations
  - Gesture-based interactions
  - Scroll animations

#### 4. **Lucide React 0.487.0**
- **Purpose**: Icon library
- **Features**: 1000+ consistent, customizable SVG icons

### UI Component Libraries

#### 5. **Class Variance Authority (CVA)**
- **Purpose**: Type-safe variant management for components
- **Use Case**: Creating reusable component variants (buttons, badges, etc.)

#### 6. **clsx & tailwind-merge**
- **Purpose**: Conditional className management
- **Use Case**: Merging Tailwind classes without conflicts

### Rich Text Editor

#### 7. **Tiptap 2.11.5** (ProseMirror-based)
- **Purpose**: WYSIWYG rich text editor for resume editing
- **Extensions Used**:
  - Bold, Italic, Underline
  - Headings (H1-H6)
  - Bullet Lists & Ordered Lists
  - Hard Break
  - Placeholder
  - Text Style
  - Starter Kit (base functionality)

### Data Visualization

#### 8. **Recharts 2.15.2**
- **Purpose**: React charting library built on D3
- **Use Cases**:
  - Score breakdown charts
  - Analytics dashboards
  - Progress visualization
- **Dependencies**:
  - D3 libraries (d3-array, d3-scale, d3-shape, d3-time)

### State Management

#### 9. **Zustand 5.0.3**
- **Purpose**: Lightweight state management
- **Use Cases**:
  - Global app state
  - User session management
  - UI state (modals, sidebars)

### Form Management

#### 10. **React Hook Form 7.55.0**
- **Purpose**: Performant form validation
- **Features**:
  - Minimal re-renders
  - Built-in validation
  - TypeScript support

#### 11. **Zod 3.24.2**
- **Purpose**: Schema validation
- **Integration**: Works with React Hook Form via `@hookform/resolvers`
- **Use Cases**:
  - Form validation
  - API request/response validation
  - Type inference

### UI Utilities

#### 12. **Sonner 2.0.1**
- **Purpose**: Toast notifications
- **Features**: Beautiful, accessible toast messages

#### 13. **Next Themes 0.4.4**
- **Purpose**: Theme management (dark/light mode)
- **Features**: System preference detection, persistent theme storage

#### 14. **Date-fns 4.1.0**
- **Purpose**: Date manipulation and formatting
- **Use Cases**: Timestamp formatting, date calculations

---

## Backend Stack

### Runtime & Framework

#### 1. **Node.js** (via Next.js)
- **Purpose**: JavaScript runtime for server-side code
- **Features Used**:
  - File system operations
  - Crypto utilities
  - Buffer handling

#### 2. **Next.js API Routes**
- **Purpose**: RESTful API endpoints
- **Structure**:
  ```
  /api/auth/*        - Authentication endpoints
  /api/resume/*      - Resume operations
  /api/user/*        - User management
  ```

### API Endpoints

**Authentication APIs:**
- `POST /api/auth/signin` - Email/password login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - Logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `GET /api/auth/session` - Get current session
- `GET /api/auth/google/start` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

**Resume APIs:**
- `POST /api/resume/upload` - Upload resume (PDF/DOCX/LaTeX)
- `POST /api/resume/analyze` - Analyze resume with AI
- `GET /api/resume/[id]` - Get resume details
- `PUT /api/resume/[id]` - Update resume
- `DELETE /api/resume/[id]` - Delete resume
- `GET /api/resume/download/[id]` - Download resume

**User APIs:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/usage` - Get usage statistics

---

## AI & Machine Learning

### AI Service Providers

#### 1. **Groq SDK 0.18.0** (Primary)
- **Purpose**: Fast AI inference
- **Model**: `llama-3.1-8b-instant`
- **Use Cases**:
  - Resume analysis
  - Keyword extraction
  - Improvement suggestions
- **Features**:
  - Low latency
  - Cost-effective
  - Streaming support

#### 2. **OpenRouter** (Fallback)
- **Purpose**: AI model aggregator
- **Use Case**: Fallback when Groq fails
- **Features**: Access to multiple AI models

### AI Analysis Pipeline

**Architecture** (`lib/ai/analyzer.ts`):
```
1. Primary: Groq API (llama-3.1-8b-instant)
   ↓ (on failure)
2. Fallback: OpenRouter API
   ↓ (on failure)
3. Mock Analysis (rule-based)
```

**Analysis Components:**
- **Overall Score** (0-100): Weighted scoring across 7 categories
- **Score Breakdown**:
  - Contact Info (0-10 points)
  - Summary (0-15 points)
  - Experience (0-25 points)
  - Skills (0-20 points)
  - Education (0-15 points)
  - Formatting (0-10 points)
  - Keywords (0-5 points)

- **Keyword Analysis**: Industry-specific keyword detection
- **Skills Analysis**: Technical & soft skills evaluation
- **Experience Analysis**: Quantifiable achievements detection
- **ATS Compatibility**: Applicant Tracking System optimization
- **Gap Analysis**: Prioritized improvement recommendations

**Prompt Engineering** (`lib/ai/prompts.ts`):
- System prompt with expert persona
- Structured JSON output
- Scoring rubric
- Industry-specific analysis

---

## Database & Storage

### Primary Database

#### 1. **MongoDB 6.16.0**
- **Purpose**: NoSQL document database
- **Connection**: MongoDB Atlas (cloud-hosted)
- **Collections**:
  - `users` - User accounts
  - `resumes` - Resume documents and analysis

**User Schema:**
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  name: string,
  password: string (hashed),
  plan: "FREE" | "PRO" | "ENTERPRISE",
  analysisCount: number,
  resetPasswordTokenHash: string,
  resetPasswordExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Resume Schema:**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  fileName: string,
  fileType: string,
  fileUrl: string,
  fileBase64: string,
  parsedText: string,
  parsedSections: object,
  analysisResult: object,
  overallScore: number,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
  jobTitle: string,
  editedContent: object,
  createdAt: Date,
  updatedAt: Date (indexed)
}
```

**Indexes:**
- `users.email` (unique)
- `resumes.userId + updatedAt` (compound, for pagination)

### Fallback Storage

#### 2. **JSON File Storage**
- **Purpose**: Fallback when MongoDB is unavailable
- **Location**: `.data/resumeiq.json`
- **Use Case**: Development, testing, or MongoDB downtime

### File Storage

#### 3. **Supabase Storage**
- **Purpose**: Cloud file storage for resume files
- **SDK**: `@supabase/supabase-js 2.49.4`
- **Bucket**: `resumes`
- **Features**:
  - Secure file upload
  - CDN delivery
  - Access control

**Storage Strategy:**
- Small files (<10MB): Base64 in database
- Large files: Supabase Storage with URL reference
- Parsed text: Always in database for fast access

---

## Authentication & Security

### Authentication Methods

#### 1. **JWT (JSON Web Tokens)**
- **Library**: `jsonwebtoken 9.0.2`
- **Purpose**: Stateless authentication
- **Storage**: HTTP-only cookies
- **Expiration**: Configurable (default: 7 days)

#### 2. **Password Hashing**
- **Library**: `bcryptjs 3.0.2`
- **Purpose**: Secure password storage
- **Rounds**: 10 (default)

#### 3. **Google OAuth 2.0**
- **Flow**: Authorization Code Flow
- **Endpoints**:
  - `/api/auth/google/start` - Initiate OAuth
  - `/api/auth/google/callback` - Handle callback
- **Scopes**: `openid`, `profile`, `email`

### Security Features

1. **Password Reset Flow**:
   - Token-based reset
   - Time-limited tokens (1 hour)
   - Secure token hashing

2. **Rate Limiting** (`lib/rate-limit.ts`):
   - Prevents brute force attacks
   - Per-IP and per-user limits

3. **Input Validation**:
   - Zod schemas for all inputs
   - XSS prevention
   - SQL injection prevention (NoSQL)

4. **CORS & Headers**:
   - Secure headers configuration
   - CORS policy enforcement

---

## File Processing

### Document Parsers

#### 1. **PDF Parser**
- **Library**: `pdf-parse 1.1.1` + `pdfjs-dist 4.10.38`
- **Purpose**: Extract text from PDF files
- **Features**:
  - Text extraction
  - Metadata extraction
  - Multi-page support

**Implementation** (`lib/parsers/pdf-parser.ts`):
```typescript
- Uses pdfjs-dist for rendering
- Extracts raw text
- Identifies sections (experience, education, etc.)
- Handles complex layouts
```

#### 2. **DOCX Parser**
- **Library**: `mammoth 1.9.1` + `docx 9.5.1`
- **Purpose**: Extract text from Word documents
- **Features**:
  - Text extraction
  - Style preservation
  - Table handling

**Implementation** (`lib/parsers/docx-parser.ts`):
```typescript
- Converts DOCX to HTML
- Extracts plain text
- Preserves formatting information
```

#### 3. **LaTeX Parser** (Custom)
- **Purpose**: Parse LaTeX resume files
- **Features**:
  - Command stripping
  - Section extraction
  - Text normalization

**Implementation** (`lib/parsers/latex-parser.ts`):
```typescript
- Removes LaTeX commands
- Converts sections to plain text
- Handles common LaTeX structures
- Supports itemize, enumerate, etc.
```

### Section Extraction

**Common Sections Detected:**
- Contact Information
- Summary/Objective
- Experience/Work History
- Education
- Skills (Technical & Soft)
- Certifications
- Projects
- Volunteer Work
- Languages
- References

---

## Development Tools

### Code Quality

#### 1. **ESLint 9.23.0**
- **Purpose**: JavaScript/TypeScript linting
- **Config**: `eslint-config-next 15.2.3`
- **Rules**: Next.js recommended + custom rules

#### 2. **TypeScript Compiler**
- **Purpose**: Type checking
- **Script**: `npm run typecheck`
- **Config**: Strict mode enabled

### Build Tools

#### 3. **PostCSS 8.5.3**
- **Purpose**: CSS processing
- **Plugins**:
  - Autoprefixer (browser compatibility)
  - Tailwind CSS processor

#### 4. **Autoprefixer 10.4.21**
- **Purpose**: Add vendor prefixes automatically
- **Target**: Modern browsers

### Package Management

#### 5. **npm**
- **Purpose**: Dependency management
- **Lock File**: `package-lock.json`

---

## Deployment & Infrastructure

### Hosting Platform

#### 1. **Vercel** (Recommended)
- **Purpose**: Next.js hosting and deployment
- **Features**:
  - Automatic deployments from Git
  - Edge network (CDN)
  - Serverless functions
  - Environment variables
  - Preview deployments

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

### Environment Variables

**Required Variables** (`.env.local.example`):

**Database:**
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=resumeiq
```

**Authentication:**
```
JWT_SECRET=your-jwt-secret
```

**AI Services:**
```
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
GROQ_ENABLED=true
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

**File Storage:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=resumes
```

**App Configuration:**
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ResumeIQ
FREE_PLAN_ANALYSIS_LIMIT=3
NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT=3
```

### Build & Deployment Scripts

```json
{
  "dev": "next dev",                    // Development server
  "build": "next build",                // Production build
  "start": "next start",                // Production server
  "lint": "next lint",                  // Lint code
  "typecheck": "tsc --noEmit",          // Type check
  "pre-deploy": "node scripts/pre-deploy-check.js",  // Pre-deployment checks
  "deploy": "npm run pre-deploy && vercel --prod",   // Deploy to production
  "deploy:preview": "npm run pre-deploy && vercel"   // Deploy preview
}
```

---

## Performance Optimizations

### 1. **Code Splitting**
- Automatic route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### 2. **Image Optimization**
- Next.js Image component
- AVIF and WebP formats
- Responsive images
- Lazy loading

### 3. **Package Optimization**
- `optimizePackageImports` for large libraries:
  - lucide-react
  - recharts
  - framer-motion
  - date-fns

### 4. **Caching Strategy**
- Static page generation where possible
- API response caching
- Browser caching headers

### 5. **Database Optimization**
- Compound indexes for common queries
- Projection to exclude heavy fields
- Pagination for large datasets
- Aggregation pipelines for analytics

---

## Architecture Patterns

### 1. **Layered Architecture**
```
Presentation Layer (React Components)
    ↓
Business Logic Layer (Hooks, Utils)
    ↓
Data Access Layer (API Routes, Database Queries)
    ↓
External Services (AI, Storage, Auth)
```

### 2. **Component Structure**
```
/components
  /ui          - Reusable UI primitives
  /shared      - Shared components (Navbar, Footer)
  /auth        - Authentication components
  /dashboard   - Dashboard-specific components
  /resume      - Resume-related components
  /landing     - Landing page components
```

### 3. **API Design**
- RESTful principles
- Consistent error handling
- Standard response format:
  ```typescript
  {
    success: boolean,
    data?: any,
    error?: { message: string, code: string }
  }
  ```

### 4. **Error Handling**
- Try-catch blocks for async operations
- Fallback mechanisms (AI, database)
- User-friendly error messages
- Error boundaries for React components

---

## Testing Strategy (Recommended)

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, utilities, parsers

### Integration Testing
- **Framework**: Playwright or Cypress
- **Coverage**: API routes, user flows

### E2E Testing
- **Framework**: Playwright
- **Coverage**: Critical user journeys

---

## Monitoring & Analytics (Recommended)

### Application Monitoring
- **Vercel Analytics**: Performance metrics
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Business Analytics
- **Google Analytics**: User behavior
- **Mixpanel**: Product analytics
- **PostHog**: Feature flags & A/B testing

---

## Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **Input Validation**: Validate all user inputs
3. **SQL Injection**: Use parameterized queries (MongoDB)
4. **XSS Prevention**: Sanitize user-generated content
5. **CSRF Protection**: Use SameSite cookies
6. **Rate Limiting**: Prevent abuse
7. **HTTPS Only**: Enforce secure connections
8. **Dependency Updates**: Regular security patches

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in database
- CDN for static assets

### Vertical Scaling
- Database connection pooling
- Caching layer (Redis recommended)
- Background job processing (Bull/BullMQ)

### Performance Monitoring
- Response time tracking
- Database query optimization
- AI API latency monitoring

---

## Future Enhancements

### Planned Features
1. **Real-time Collaboration**: Multiple users editing same resume
2. **Template Library**: Pre-built resume templates
3. **Cover Letter Generator**: AI-powered cover letters
4. **LinkedIn Integration**: Import from LinkedIn
5. **Job Matching**: Match resumes to job postings
6. **Interview Prep**: AI-powered interview questions
7. **Mobile App**: React Native mobile application

### Technical Improvements
1. **GraphQL API**: Replace REST with GraphQL
2. **WebSockets**: Real-time updates
3. **Microservices**: Split into smaller services
4. **Kubernetes**: Container orchestration
5. **Redis Caching**: Improve performance
6. **Elasticsearch**: Advanced search capabilities

---

## Conclusion

ResumeIQ is built with a modern, scalable tech stack that prioritizes:
- **Performance**: Fast load times, optimized builds
- **Developer Experience**: TypeScript, modern tooling
- **User Experience**: Smooth animations, responsive design
- **Reliability**: Fallback mechanisms, error handling
- **Security**: Authentication, input validation, secure storage
- **Maintainability**: Clean architecture, modular code

The stack is production-ready and can scale to handle thousands of users while maintaining excellent performance and user experience.

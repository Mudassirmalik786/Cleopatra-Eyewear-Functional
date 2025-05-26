# Cleopatra Eyewear Collection Web Application

## Overview
This is a full-stack web application for an eyewear retail business called Cleopatra Eyewear Collection. The application includes customer-facing e-commerce functionality as well as administrative features for managing products, bookings, and users. It uses a React frontend with a Node.js Express backend and Drizzle ORM for database interactions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a modern web architecture pattern with clear separation of concerns:

### Frontend
- React-based SPA built with Vite
- Wouter for client-side routing
- TanStack React Query for data fetching and state management
- Shadcn UI component library (based on Radix UI primitives)
- Tailwind CSS for styling with a custom theming system

### Backend
- Express.js REST API server
- Session-based authentication system
- Role-based access control (customer, staff, admin)
- API routes organized by resource

### Database
- PostgreSQL database (through Replit's PostgreSQL module)
- Drizzle ORM for database interactions and schema management
- Schema-first approach with entities for users, products, categories, bookings, and feedback

## Key Components

### Frontend Components
1. **Layout Components**
   - Header and Footer for consistent navigation
   - Responsive design with mobile adaptations

2. **Page Components**
   - Customer pages: Home, Shop, ProductDetail, BookCaravan, Profile
   - Admin pages: Dashboard, Products, Bookings, Users
   - Staff pages: Dashboard, Bookings, Feedback

3. **UI Components**
   - Complete set of Shadcn UI components with customized theming
   - Custom icons and shared UI utilities

4. **Data and State Management**
   - React Query for server state
   - Authentication state via Context API
   - Form handling with React Hook Form and Zod validation

### Backend Components
1. **API Routes**
   - RESTful endpoints organized by resource
   - Authentication and authorization middleware
   - Input validation with Zod

2. **Data Access Layer**
   - Storage interface for database operations
   - Drizzle ORM for type-safe database queries
   - Model definitions with relationships

3. **Middleware**
   - Session management
   - Request logging
   - Error handling

## Data Flow

### Authentication Flow
1. User registers or logs in through the frontend
2. Server validates credentials and creates a session
3. Session is stored server-side with a cookie reference
4. Subsequent requests include the session cookie
5. Server middleware validates session for protected routes

### Data Fetching Flow
1. React components use useQuery hooks to request data
2. Requests are sent to the Express backend
3. Express routes validate permissions and process the request
4. Data is fetched from the database using Drizzle ORM
5. Response is returned to the client and cached by React Query

### Form Submission Flow
1. User interacts with forms built with React Hook Form
2. Data is validated client-side using Zod schemas
3. On submission, data is sent to the API
4. Server validates the input again
5. Database is updated and response returned
6. UI updates to reflect the changes

## External Dependencies

### Frontend
- React ecosystem: React, React DOM, Wouter (for routing)
- Data management: TanStack React Query
- UI: Radix UI components, Tailwind CSS
- Forms: React Hook Form with Zod validation
- Utilities: date-fns, clsx, class-variance-authority

### Backend
- Express.js for API server
- Drizzle ORM and drizzle-zod for database access
- Session management with express-session
- Neon Serverless PostgreSQL client

## Deployment Strategy
The application is configured for deployment on Replit:

1. **Development Mode**
   - Run with `npm run dev`
   - Vite serves the frontend with HMR
   - Backend runs concurrently for API access

2. **Production Build**
   - Frontend built with Vite
   - Backend bundled with esbuild
   - Static assets served by Express from the dist directory

3. **Database**
   - Uses Replit's PostgreSQL module
   - Connection string provided via environment variables
   - Schema changes managed through Drizzle migrations

## Key Features

### Customer Features
- Browse and search eyewear products
- View product details and categories
- Book mobile eyewear caravan services
- User profile management

### Admin Features
- Dashboard with business analytics
- Product and category management
- User management with role assignment
- Booking management and reporting

### Staff Features
- View and manage assigned bookings
- Process customer requests
- Collect and review customer feedback

## Database Schema

### Core Entities
1. **Users**: Customer, staff, and admin accounts
2. **Products**: Eyewear items for sale
3. **Categories**: Product categorization
4. **Bookings**: Mobile caravan service reservations
5. **Feedback**: Customer reviews and ratings

### Key Relationships
- Products belong to Categories
- Bookings belong to Users (customers)
- Bookings can be assigned to staff
- Feedback is associated with Bookings

## Development Workflow
1. Local development with `npm run dev`
2. Schema changes managed with Drizzle ORM
3. Apply schema changes with `npm run db:push`
4. Build for production with `npm run build`
5. Start production server with `npm run start`

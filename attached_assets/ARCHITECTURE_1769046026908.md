# Architecture Documentation

## System Architecture Overview

FlashFusion v2.1 follows a modern single-page application (SPA) architecture with clear separation of concerns and modular design principles.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Pages    │  │ Components │  │   Hooks    │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Base44 SDK Client                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Auth     │  │  Entities  │  │    API     │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Base44 Platform                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │    API     │  │    Auth    │  │  Database  │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Architecture Patterns

### 1. Component-Based Architecture

The application uses a hierarchical component structure:

```
App (Root)
├── AuthProvider (Context)
├── QueryClientProvider (State)
├── Router
│   └── Routes
│       ├── Layout (Wrapper)
│       │   ├── Sidebar Navigation
│       │   └── Page Content
│       └── Pages
│           ├── Dashboard
│           ├── Projects
│           ├── Generators
│           └── ...
```

### 2. State Management

**Local State**: React hooks (useState, useReducer)
**Server State**: TanStack React Query
**Global State**: React Context API
- AuthContext: User authentication state
- Theme/Settings: Via Context

### 3. Data Flow

```
User Interaction
    ↓
Event Handler
    ↓
API Call (via Base44 SDK)
    ↓
React Query Cache Update
    ↓
Component Re-render
    ↓
UI Update
```

## Layer-by-Layer Breakdown

### Presentation Layer (src/components, src/pages)

**Responsibilities:**
- Render UI components
- Handle user interactions
- Display data from state
- Navigate between pages

**Key Components:**

1. **Pages** (`src/pages/`): Top-level route components
   - Dashboard.jsx
   - Projects.jsx
   - AgentOrchestration.jsx
   - UniversalGenerator.jsx
   - etc.

2. **Feature Components** (`src/components/[feature]/`): Domain-specific components
   - agents/: Agent management UI
   - analytics/: Charts and metrics
   - dashboard/: Dashboard widgets
   - ecommerce/: E-commerce interfaces
   - generators/: Generator UIs

3. **Shared Components** (`src/components/shared/`): Reusable components
   - CreditMeter: Display credit usage
   - FeatureCard: Feature showcase cards
   - Common UI patterns

4. **Base UI Components** (`src/components/ui/`): Radix UI wrappers
   - Button, Card, Dialog, etc.
   - Consistent styling and behavior
   - Accessibility built-in

### Business Logic Layer (src/lib, src/hooks)

**Responsibilities:**
- Application logic
- Business rules
- Computed values
- Side effects

**Key Modules:**

1. **Context Providers** (`src/lib/`)
   - `AuthContext.jsx`: Authentication state and methods
   - `NavigationTracker.jsx`: Route tracking
   - `VisualEditAgent.jsx`: Visual editing features

2. **Custom Hooks** (`src/hooks/`)
   - `use-mobile.jsx`: Responsive design helper
   - Additional hooks for shared logic

3. **Utilities** (`src/lib/`, `src/utils/`)
   - `utils.js`: General utility functions
   - `app-params.js`: Application configuration
   - `query-client.js`: React Query setup

### Data Access Layer (src/api)

**Responsibilities:**
- API communication
- Data fetching
- Entity management
- Authentication

**Key Files:**

1. **Base44 Client** (`src/api/base44Client.js`)
   - Configured SDK instance
   - Authentication setup
   - API base configuration

2. **Entity Definitions** (`src/api/entities.js`)
   - Data models
   - Entity relationships
   - CRUD operations

3. **Integration Modules** (`src/api/integrations.js`)
   - Third-party API integrations
   - Custom integration logic

## Authentication Flow

```
1. App Initialization
   ↓
2. AuthProvider.checkAppState()
   ↓
3. Fetch App Public Settings
   ↓
4. Check Token Availability
   ├── Token Present
   │   ↓
   │   5a. Verify User Authentication
   │   ↓
   │   6a. Set User State
   │   ↓
   │   7a. Render Authenticated App
   │
   └── No Token
       ↓
       5b. Check Auth Requirements
       ↓
       6b. Navigate to Login / Show Error
```

**Authentication States:**
- `isLoadingAuth`: Checking authentication
- `isLoadingPublicSettings`: Loading app configuration
- `authError`: Authentication error details
  - `user_not_registered`: User needs registration
  - `auth_required`: Login required
- `isAuthenticated`: Successfully authenticated

## Routing Architecture

**Router Type**: React Router v6 (Browser Router)

**Route Configuration:**
- Dynamic route generation from `pages.config.js`
- Layout wrapper for consistent UI
- 404 handling via PageNotFound component

```javascript
// Simplified routing structure
<Router>
  <Routes>
    <Route path="/" element={<Layout><MainPage /></Layout>} />
    {Object.entries(Pages).map(([name, Component]) => (
      <Route 
        path={`/${name}`} 
        element={<Layout><Component /></Layout>} 
      />
    ))}
    <Route path="*" element={<PageNotFound />} />
  </Routes>
</Router>
```

## Data Fetching Strategy

### React Query Implementation

**Configuration** (`src/lib/query-client.js`):
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

**Usage Patterns:**

1. **Data Fetching**:
   ```javascript
   const { data, isLoading, error } = useQuery({
     queryKey: ['entity', id],
     queryFn: () => Entity.get(id),
   });
   ```

2. **Mutations**:
   ```javascript
   const mutation = useMutation({
     mutationFn: (data) => Entity.create(data),
     onSuccess: () => {
       queryClient.invalidateQueries(['entities']);
     },
   });
   ```

## Styling Architecture

### Tailwind CSS Configuration

**Approach**: Utility-first CSS
**Theme**: Dark mode optimized
**Components**: Radix UI + Custom styles

**Key Features:**
- Design tokens in `tailwind.config.js`
- Component variants via `class-variance-authority`
- Animations via `tailwindcss-animate`
- Utility merging via `tailwind-merge`

### Component Styling Patterns

1. **Base UI Components**: Reusable with variants
2. **Feature Components**: Composed from base components
3. **Page Components**: Layout and composition

## Build Architecture

### Vite Configuration

**Features:**
- Fast HMR (Hot Module Replacement)
- Optimized builds
- Plugin system
- Base44 plugin integration

**Build Process:**
```
Development: vite dev
  ↓
  - Fast refresh
  - Source maps
  - Dev server
  
Production: vite build
  ↓
  - Tree shaking
  - Code splitting
  - Minification
  - Asset optimization
```

## Security Architecture

### Authentication Security
- Token-based authentication
- Secure token storage
- HTTP-only cookies (via Base44)
- CSRF protection

### API Security
- HTTPS enforcement
- Request signing
- Rate limiting (Base44 platform)
- Input validation (Zod schemas)

### Client-Side Security
- XSS prevention via React
- Content Security Policy headers
- Dependency vulnerability scanning
- Regular security updates

## Performance Optimization

### Code Splitting
- Route-based splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features

### Caching Strategy
- React Query caching
- Browser caching
- CDN for static assets

### Bundle Optimization
- Tree shaking
- Dead code elimination
- Dependency analysis
- Chunk optimization

## Scalability Considerations

### Frontend Scalability
- Component reusability
- Code organization by feature
- Modular architecture
- Plugin system for extensions

### Performance Scalability
- Virtual scrolling for large lists
- Debouncing and throttling
- Memoization strategies
- Web workers for heavy computations

## Error Handling

### Error Boundary Strategy
- Global error boundary
- Feature-level error boundaries
- Fallback UI components
- Error reporting

### API Error Handling
- Centralized error interceptors
- User-friendly error messages
- Retry logic
- Offline handling

## Monitoring and Logging

### Development
- Console logging
- React DevTools
- Network inspection
- Performance profiling

### Production
- Error tracking
- Performance monitoring
- User analytics
- Usage metrics

## Deployment Architecture

### Build Artifacts
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── index.html
```

### Deployment Targets
- Static hosting (Vercel, Netlify, etc.)
- CDN distribution
- Environment-specific builds
- Continuous deployment pipeline

## Future Architecture Considerations

### Potential Enhancements
1. **Micro-frontends**: Module federation for larger scale
2. **Progressive Web App**: Offline capabilities
3. **Server-Side Rendering**: Better SEO and performance
4. **Edge Computing**: Reduced latency
5. **GraphQL**: More flexible data fetching
6. **WebSockets**: Real-time collaboration features

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Reviewers**: Technical Architecture Team

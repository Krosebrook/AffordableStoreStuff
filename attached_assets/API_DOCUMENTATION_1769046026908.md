# API Documentation

## Overview

FlashFusion v2.1 uses the Base44 SDK for backend communication. This document covers API integration patterns, available endpoints, and usage examples.

## Base44 SDK Setup

### Client Configuration

Located in `src/api/base44Client.js`:

```javascript
import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44 = createClient({
  appId: appParams.appId,
  serverUrl: appParams.serverUrl,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  requiresAuth: false
});
```

### Application Parameters

Configuration is managed in `src/lib/app-params.js`:

```javascript
export const appParams = {
  appId: import.meta.env.VITE_BASE44_APP_ID,
  serverUrl: import.meta.env.VITE_BASE44_SERVER_URL,
  token: import.meta.env.VITE_BASE44_TOKEN,
  functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'prod'
};
```

## Authentication

### Authentication Context

The `AuthContext` provides authentication state and methods throughout the application.

#### AuthContext API

```javascript
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const {
    user,                    // Current user object
    isAuthenticated,         // Boolean authentication status
    isLoadingAuth,          // Loading state for auth check
    isLoadingPublicSettings, // Loading state for app settings
    authError,              // Authentication error object
    appPublicSettings,      // Public app settings
    navigateToLogin,        // Method to redirect to login
    logout                  // Method to logout user
  } = useAuth();
}
```

#### Authentication States

1. **Loading States**
   - `isLoadingPublicSettings`: Fetching app configuration
   - `isLoadingAuth`: Verifying user authentication

2. **Error States**
   - `user_not_registered`: User needs to complete registration
   - `auth_required`: User must log in to access the app

3. **Success State**
   - `isAuthenticated`: User successfully authenticated
   - `user`: User object with profile information

### Authentication Flow

```javascript
// 1. Check if app requires authentication
checkAppState() {
  // Fetch public settings
  // Verify token if present
  // Set authentication state
}

// 2. Navigate to login if required
navigateToLogin() {
  // Redirect to Base44 login page
}

// 3. Handle authentication callback
// User is redirected back with token
// Token is stored and used for subsequent requests
```

## Entity Management

### User Entity

```javascript
import { User } from '@/entities/User';

// Get current user
const currentUser = await User.me();

// User object structure
{
  id: 'user-id',
  email: 'user@example.com',
  name: 'User Name',
  avatar_url: 'https://...',
  credits: 1000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}
```

### Custom Entities

Define custom entities in `src/api/entities.js`:

```javascript
import { base44 } from './base44Client';

// Example: Project entity
export const Project = {
  // List all projects
  async list() {
    return await base44.entities('projects').list();
  },
  
  // Get single project
  async get(id) {
    return await base44.entities('projects').get(id);
  },
  
  // Create project
  async create(data) {
    return await base44.entities('projects').create(data);
  },
  
  // Update project
  async update(id, data) {
    return await base44.entities('projects').update(id, data);
  },
  
  // Delete project
  async delete(id) {
    return await base44.entities('projects').delete(id);
  }
};
```

## Data Fetching with React Query

### Setup

React Query is configured in `src/lib/query-client.js`:

```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
```

### Query Patterns

#### Fetching Data

```javascript
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/api/entities';

function ProjectList() {
  const { 
    data: projects, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list()
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

#### Fetching Single Item

```javascript
function ProjectDetail({ projectId }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => Project.get(projectId),
    enabled: !!projectId  // Only fetch if projectId exists
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{project.name}</div>;
}
```

### Mutation Patterns

#### Creating Data

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateProject() {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (newProject) => Project.create(newProject),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate({
      name: formData.name,
      description: formData.description
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createMutation.isLoading}
      >
        {createMutation.isLoading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

#### Updating Data

```javascript
function UpdateProject({ projectId }) {
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Project.update(id, data),
    onSuccess: (updatedProject) => {
      // Update cache with new data
      queryClient.setQueryData(
        ['projects', projectId], 
        updatedProject
      );
      // Invalidate list
      queryClient.invalidateQueries(['projects']);
    }
  });

  const handleUpdate = (updates) => {
    updateMutation.mutate({
      id: projectId,
      data: updates
    });
  };

  return (
    <button onClick={() => handleUpdate({ name: 'New Name' })}>
      Update
    </button>
  );
}
```

#### Deleting Data

```javascript
function DeleteProject({ projectId }) {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: (id) => Project.delete(id),
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries(['projects', projectId]);
      // Invalidate list
      queryClient.invalidateQueries(['projects']);
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(projectId);
    }
  };

  return (
    <button onClick={handleDelete}>
      Delete
    </button>
  );
}
```

## Base44 Functions

### Calling Cloud Functions

```javascript
import { base44 } from '@/api/base44Client';

// Call a cloud function
const result = await base44.functions.call('functionName', {
  param1: 'value1',
  param2: 'value2'
});

// With error handling
try {
  const result = await base44.functions.call('generateContent', {
    template: 'blog-post',
    topic: 'AI Development'
  });
  console.log('Generated content:', result);
} catch (error) {
  console.error('Function call failed:', error);
}
```

### Common Function Patterns

#### AI Content Generation

```javascript
async function generateAIContent(prompt, options = {}) {
  return await base44.functions.call('ai.generate', {
    prompt,
    model: options.model || 'gpt-4',
    maxTokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7
  });
}

// Usage
const content = await generateAIContent(
  'Write a product description for a smart watch',
  { maxTokens: 500 }
);
```

#### Analytics Function

```javascript
async function getAnalytics(dateRange) {
  return await base44.functions.call('analytics.get', {
    startDate: dateRange.start,
    endDate: dateRange.end,
    metrics: ['usage', 'credits', 'activities']
  });
}
```

## Error Handling

### API Error Structure

```javascript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable error message',
    details: {
      field: 'Specific field error'
    }
  }
}
```

### Error Handling Pattern

```javascript
import { toast } from 'react-hot-toast';

async function handleApiCall() {
  try {
    const result = await Project.create(data);
    toast.success('Project created successfully');
    return result;
  } catch (error) {
    // Handle specific error types
    if (error.code === 'VALIDATION_ERROR') {
      toast.error('Please check your input');
    } else if (error.code === 'UNAUTHORIZED') {
      toast.error('Please log in to continue');
      // Redirect to login
    } else {
      toast.error('An unexpected error occurred');
    }
    console.error('API Error:', error);
    throw error;
  }
}
```

### Global Error Interceptor

```javascript
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const apiClient = createAxiosClient({
  baseURL: serverUrl,
  interceptResponses: true
});

// Add response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized
    } else if (error.response?.status === 429) {
      // Handle rate limiting
    }
    return Promise.reject(error);
  }
);
```

## Rate Limiting

### Credit System

FlashFusion uses a credit-based system for API calls:

```javascript
// Check user credits
const user = await User.me();
const availableCredits = user.credits;

// Credits are automatically deducted on API calls
// Monitor usage in the dashboard
```

### Handling Rate Limits

```javascript
// Implement exponential backoff
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Integrations

### Third-Party API Integrations

Defined in `src/api/integrations.js`:

```javascript
// Example: External service integration
export const ExternalService = {
  async connect(credentials) {
    return await base44.functions.call('integrations.connect', {
      service: 'external-service',
      credentials
    });
  },
  
  async sync(dataType) {
    return await base44.functions.call('integrations.sync', {
      service: 'external-service',
      dataType
    });
  }
};
```

## WebSocket Support (Future)

```javascript
// Placeholder for real-time features
import { base44 } from '@/api/base44Client';

// Subscribe to real-time updates
const subscription = base44.realtime.subscribe('projects', {
  onCreate: (project) => {
    console.log('New project created:', project);
  },
  onUpdate: (project) => {
    console.log('Project updated:', project);
  },
  onDelete: (projectId) => {
    console.log('Project deleted:', projectId);
  }
});

// Unsubscribe when component unmounts
subscription.unsubscribe();
```

## Best Practices

### 1. Query Key Naming

```javascript
// ✅ Good - Hierarchical and descriptive
['projects']
['projects', projectId]
['projects', projectId, 'tasks']
['projects', projectId, 'tasks', taskId]

// ❌ Avoid - Non-descriptive or inconsistent
['data']
['project', projectId]
```

### 2. Mutation Success Handling

```javascript
// ✅ Good - Update cache optimistically
onSuccess: (newData) => {
  queryClient.setQueryData(['item', id], newData);
  queryClient.invalidateQueries(['items']);
}

// ❌ Avoid - Unnecessary full refetch
onSuccess: () => {
  queryClient.invalidateQueries();
}
```

### 3. Loading States

```javascript
// ✅ Good - Specific loading indicators
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

// ❌ Avoid - Generic or missing loading states
if (!data) return null;
```

### 4. Error Boundaries

```javascript
// Wrap components with error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <DataFetchingComponent />
</ErrorBoundary>
```

## Testing API Calls

### Manual Testing

Use browser DevTools Network tab to inspect:
- Request/response payloads
- Status codes
- Response times
- Error messages

### Debug Mode

Enable debug logging:

```javascript
// In development
if (import.meta.env.DEV) {
  console.log('API Call:', endpoint, params);
  console.log('API Response:', response);
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team

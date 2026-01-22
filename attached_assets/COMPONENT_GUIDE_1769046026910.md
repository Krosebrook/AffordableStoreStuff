# Component Guide

## Overview

This guide provides detailed information about the component architecture, UI component library, and best practices for creating and using components in FlashFusion v2.1.

## Component Structure

### Component Hierarchy

```
Components/
├── ui/                   # Base UI components (Radix UI wrappers)
├── shared/               # Shared reusable components
└── [feature]/            # Feature-specific components
    ├── agents/
    ├── analytics/
    ├── brandkit/
    ├── collaboration/
    ├── content/
    ├── dashboard/
    ├── ecommerce/
    ├── generators/
    ├── marketplace/
    ├── plugins/
    ├── scheduling/
    └── wsjf/
```

## Base UI Components (`src/components/ui/`)

Built on Radix UI primitives with custom styling using Tailwind CSS.

### Button Component

**Location**: `src/components/ui/button.jsx`

```jsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### Card Component

```jsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### Dialog Component

```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components

#### Input

```jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email" 
  />
</div>
```

#### Select

```jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox

```jsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">Accept terms and conditions</label>
</div>
```

#### Switch

```jsx
import { Switch } from '@/components/ui/switch';

<Switch 
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

### Tabs Component

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>
</Tabs>
```

### Toast Notifications

```jsx
import { toast } from 'react-hot-toast';

// Success
toast.success('Operation completed successfully');

// Error
toast.error('Something went wrong');

// Info
toast('Information message');

// Custom
toast.custom((t) => (
  <div className="bg-white p-4 rounded shadow">
    Custom toast content
  </div>
));

// With duration
toast.success('Message', { duration: 5000 });
```

### Skeleton Loader

```jsx
import { Skeleton } from '@/components/ui/skeleton';

<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Badge Component

```jsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Tooltip Component

```jsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Dropdown Menu

```jsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Shared Components (`src/components/shared/`)

### CreditMeter Component

Displays user credit balance with visual indicator.

```jsx
import CreditMeter from '@/components/shared/CreditMeter';

<CreditMeter 
  credits={user.credits}
  maxCredits={10000}
  showPercentage={true}
/>
```

**Props:**
- `credits` (number): Current credit balance
- `maxCredits` (number): Maximum credits (for percentage calculation)
- `showPercentage` (boolean): Display percentage indicator

### FeatureCard Component

Card component for showcasing features on the dashboard.

```jsx
import FeatureCard from '@/components/shared/FeatureCard';

<FeatureCard
  title="Feature Title"
  description="Feature description"
  icon={FeatureIcon}
  href="/feature-page"
  badge="New"
/>
```

**Props:**
- `title` (string): Feature title
- `description` (string): Feature description
- `icon` (Component): Lucide icon component
- `href` (string): Link destination
- `badge` (string, optional): Badge text (e.g., "New", "Beta")

## Feature-Specific Components

### Dashboard Components (`src/components/dashboard/`)

#### UsageChart

Displays usage statistics over time.

```jsx
import UsageChart from '@/components/dashboard/UsageChart';

<UsageChart 
  data={usageData}
  period="week"
/>
```

**Props:**
- `data` (array): Usage data points
- `period` (string): Time period ('day', 'week', 'month')

**Data Format:**
```javascript
[
  { date: '2024-01-01', usage: 150, credits: 50 },
  { date: '2024-01-02', usage: 200, credits: 75 },
  // ...
]
```

### Analytics Components (`src/components/analytics/`)

Components for displaying charts, metrics, and analytics data.

### Agent Components (`src/components/agents/`)

Components related to AI agent management and orchestration.

### Content Components (`src/components/content/`)

Rich text editors, content creation tools, and media management components.

## Creating Custom Components

### Component Template

```jsx
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ComponentName - Brief description
 * 
 * @param {Object} props - Component props
 * @param {string} props.propName - Prop description
 * @returns {JSX.Element}
 */
export default function ComponentName({ 
  propName,
  className,
  ...props 
}) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* Component content */}
    </div>
  );
}

// PropTypes (optional)
ComponentName.propTypes = {
  propName: PropTypes.string.required,
  className: PropTypes.string,
};

// Default props (optional)
ComponentName.defaultProps = {
  propName: 'default value',
};
```

### Compound Component Pattern

```jsx
// Parent component
export function ParentComponent({ children }) {
  return (
    <div className="parent-container">
      {children}
    </div>
  );
}

// Child components
ParentComponent.Header = function Header({ children }) {
  return <div className="header">{children}</div>;
};

ParentComponent.Body = function Body({ children }) {
  return <div className="body">{children}</div>;
};

ParentComponent.Footer = function Footer({ children }) {
  return <div className="footer">{children}</div>;
};

// Usage
<ParentComponent>
  <ParentComponent.Header>Header</ParentComponent.Header>
  <ParentComponent.Body>Body</ParentComponent.Body>
  <ParentComponent.Footer>Footer</ParentComponent.Footer>
</ParentComponent>
```

### Render Props Pattern

```jsx
function DataProvider({ render, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  return render ? render({ data, loading }) : children({ data, loading });
}

// Usage
<DataProvider render={({ data, loading }) => (
  loading ? <Skeleton /> : <DataDisplay data={data} />
)} />
```

### Custom Hooks for Component Logic

```jsx
// useComponentLogic.js
export function useComponentLogic(initialValue) {
  const [state, setState] = useState(initialValue);
  
  const handleAction = useCallback(() => {
    // Logic here
    setState(newValue);
  }, []);

  return {
    state,
    handleAction
  };
}

// In component
function MyComponent() {
  const { state, handleAction } = useComponentLogic(initialValue);
  
  return (
    <button onClick={handleAction}>
      {state}
    </button>
  );
}
```

## Styling Components

### Using Tailwind CSS

```jsx
// Basic styling
<div className="bg-gray-800 p-6 rounded-lg">
  Content
</div>

// Responsive styling
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

// Hover and focus states
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
  Interactive button
</button>

// Dark mode (if enabled)
<div className="bg-white dark:bg-gray-800">
  Themed content
</div>
```

### Using Class Variance Authority

```jsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  'base-classes', // Base styles
  {
    variants: {
      variant: {
        default: 'variant-default-classes',
        primary: 'variant-primary-classes',
        secondary: 'variant-secondary-classes',
      },
      size: {
        sm: 'size-sm-classes',
        md: 'size-md-classes',
        lg: 'size-lg-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export function Component({ variant, size, className, ...props }) {
  return (
    <div 
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Component Best Practices

### 1. Keep Components Small and Focused

```jsx
// ✅ Good - Single responsibility
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}

function UserName({ user }) {
  return <span>{user.name}</span>;
}

// ❌ Avoid - Too many responsibilities
function UserEverything({ user }) {
  return (
    <div>
      <img src={user.avatar} />
      <span>{user.name}</span>
      <span>{user.email}</span>
      <button>Edit</button>
      {/* ... many more things */}
    </div>
  );
}
```

### 2. Use Composition Over Inheritance

```jsx
// ✅ Good - Composable
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function UserCard({ user }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </Card>
  );
}

// ❌ Avoid - Class inheritance
class BaseCard extends React.Component {
  // ...
}
class UserCard extends BaseCard {
  // ...
}
```

### 3. Provide Clear PropTypes or TypeScript Types

```jsx
// With PropTypes
import PropTypes from 'prop-types';

function MyComponent({ title, count, onAction }) {
  return <div>{title}: {count}</div>;
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  onAction: PropTypes.func.isRequired,
};

// With JSDoc (for TypeScript checking)
/**
 * @typedef {Object} MyComponentProps
 * @property {string} title
 * @property {number} [count]
 * @property {() => void} onAction
 */

/** @param {MyComponentProps} props */
function MyComponent({ title, count, onAction }) {
  return <div>{title}: {count}</div>;
}
```

### 4. Handle Loading and Error States

```jsx
function DataComponent() {
  const { data, isLoading, error } = useQuery(['data'], fetchData);

  if (isLoading) {
    return <Skeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return <DataDisplay data={data} />;
}
```

### 5. Memoize Expensive Calculations

```jsx
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    // Expensive calculation
    return data.map(item => processItem(item));
  }, [data]);

  return <div>{processedData}</div>;
}
```

### 6. Use Callback Memoization

```jsx
import { useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}
```

## Accessibility

### Semantic HTML

```jsx
// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav>
  <ul>
    <li><a href="/page1">Page 1</a></li>
  </ul>
</nav>

// ❌ Avoid
<div onClick={handleClick}>Click me</div>
<div>
  <div>
    <div><div onClick={goTo}>Page 1</div></div>
  </div>
</div>
```

### ARIA Attributes

```jsx
<button 
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <X />
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### Keyboard Navigation

```jsx
function InteractiveList({ items }) {
  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect(item);
    }
  };

  return (
    <div role="list">
      {items.map(item => (
        <div
          key={item.id}
          role="listitem"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, item)}
          onClick={() => handleSelect(item)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

## Testing Components

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] Props are properly passed and used
- [ ] Event handlers work correctly
- [ ] Loading states display properly
- [ ] Error states are handled gracefully
- [ ] Responsive design works on all screen sizes
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] No console errors or warnings

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team

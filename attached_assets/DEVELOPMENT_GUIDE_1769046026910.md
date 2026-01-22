# Development Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Building](#building)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) or your preferred IDE

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense"
  ]
}
```

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Krosebrook/flashfusionv2.1.git
cd flashfusionv2.1
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If example exists
# OR
touch .env
```

Add the following environment variables:

```env
# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_SERVER_URL=https://api.base44.com
VITE_BASE44_TOKEN=your_token_here
VITE_BASE44_FUNCTIONS_VERSION=prod

# Optional: Enable legacy SDK imports
BASE44_LEGACY_SDK_IMPORTS=false

# Development
NODE_ENV=development
```

**Important**: Never commit your `.env` file to version control. It's already listed in `.gitignore`.

### 3. Base44 Platform Setup

1. Sign up for a Base44 account at [base44.com](https://base44.com)
2. Create a new application
3. Copy your App ID and API Token
4. Add them to your `.env` file

## Installation

Install all project dependencies:

```bash
npm install
```

This will install:
- React and React DOM
- Vite build tools
- Base44 SDK
- UI component libraries (Radix UI)
- Utility libraries (date-fns, lodash, etc.)
- Development dependencies (ESLint, TypeScript, etc.)

### Verify Installation

```bash
npm list --depth=0
```

You should see all dependencies listed without errors.

## Running the Application

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

**Features:**
- ⚡ Fast Hot Module Replacement (HMR)
- 🔄 Automatic browser reload
- 📦 On-demand compilation
- 🐛 Source maps for debugging

### Preview Production Build

Test the production build locally:

```bash
npm run build
npm run preview
```

This serves the built application at `http://localhost:4173`

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in the `src/` directory following our [coding standards](#coding-standards).

### 3. Lint Your Code

Run the linter to check for issues:

```bash
npm run lint
```

Fix issues automatically:

```bash
npm run lint:fix
```

### 4. Format Your Code

Format your code with Prettier:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

**Note:** Pre-commit hooks will automatically run ESLint before each commit and block commits with errors.

### 5. Type Check

Verify type correctness:

```bash
npm run typecheck
```

### 6. Test Your Changes

Test your changes manually in the browser at `http://localhost:5173`

### 7. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

**Pre-commit Hooks:**
- ESLint will automatically run before each commit
- Commits will be blocked if there are ESLint errors
- Warnings will not block commits
- You can fix errors with `npm run lint:fix`

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or tool changes

### 8. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Project Structure

```
flashfusionv2.1/
├── src/
│   ├── api/              # API integration layer
│   │   ├── base44Client.js      # Base44 SDK client
│   │   ├── entities.js          # Entity definitions
│   │   └── integrations.js      # Third-party integrations
│   │
│   ├── assets/           # Static assets (images, fonts)
│   │
│   ├── components/       # React components
│   │   ├── agents/              # Agent-related components
│   │   ├── analytics/           # Analytics components
│   │   ├── brandkit/            # Brand kit components
│   │   ├── collaboration/       # Collaboration components
│   │   ├── content/             # Content creation components
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── ecommerce/           # E-commerce components
│   │   ├── generators/          # Generator components
│   │   ├── marketplace/         # Marketplace components
│   │   ├── plugins/             # Plugin components
│   │   ├── scheduling/          # Scheduling components
│   │   ├── shared/              # Shared components
│   │   ├── ui/                  # Base UI components (Radix)
│   │   └── wsjf/                # WSJF prioritization
│   │
│   ├── hooks/            # Custom React hooks
│   │   └── use-mobile.jsx       # Mobile detection hook
│   │
│   ├── lib/              # Utility libraries and context
│   │   ├── AuthContext.jsx      # Authentication context
│   │   ├── NavigationTracker.jsx # Route tracking
│   │   ├── VisualEditAgent.jsx  # Visual editing
│   │   ├── app-params.js        # App configuration
│   │   ├── query-client.js      # React Query setup
│   │   └── utils.js             # Utility functions
│   │
│   ├── pages/            # Page-level components
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── AgentOrchestration.jsx
│   │   └── [other pages]
│   │
│   ├── utils/            # Utility functions
│   │   └── index.ts
│   │
│   ├── App.jsx           # Root application component
│   ├── Layout.jsx        # Main layout component
│   ├── main.jsx          # Application entry point
│   ├── pages.config.js   # Page routing configuration
│   ├── App.css           # Global styles
│   └── index.css         # Base styles
│
├── public/               # Public static files
├── docs/                 # Documentation
├── .gitignore           # Git ignore rules
├── .husky/              # Git hooks (Husky)
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore rules
├── components.json      # UI component configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML entry point
├── jsconfig.json        # JavaScript configuration
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite build configuration
```

## Coding Standards

### Code Formatting with Prettier

This project uses **Prettier** for consistent code formatting across the codebase.

**Configuration:**
- Semi-colons: Yes
- Quotes: Double quotes
- Line width: 80 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style

**Usage:**
```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

**Editor Integration:**
- Install the Prettier extension for your editor
- Enable "Format on Save" for automatic formatting
- VS Code: `"editor.formatOnSave": true`

**Pre-commit Hooks:**
- ESLint runs automatically before each commit
- Commits are blocked if there are errors
- Run `npm run lint:fix` to auto-fix issues

### JavaScript/React Guidelines

1. **Use Functional Components**
   ```jsx
   // ✅ Good
   export default function MyComponent() {
     return <div>Content</div>;
   }
   
   // ❌ Avoid
   class MyComponent extends React.Component {
     render() { return <div>Content</div>; }
   }
   ```

2. **Use Hooks for State and Side Effects**
   ```jsx
   import { useState, useEffect } from 'react';
   
   function MyComponent() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       fetchData();
     }, []);
   }
   ```

3. **Component Organization**
   ```jsx
   // 1. Imports
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   
   // 2. Component definition
   export default function MyComponent({ prop1, prop2 }) {
     // 3. Hooks
     const [state, setState] = useState();
     
     // 4. Event handlers
     const handleClick = () => {};
     
     // 5. Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   }
   ```

4. **Props Destructuring**
   ```jsx
   // ✅ Good
   function MyComponent({ title, description, onClick }) {
     return <div onClick={onClick}>{title}</div>;
   }
   ```

5. **Use Path Aliases**
   ```jsx
   // ✅ Good
   import { Button } from '@/components/ui/button';
   import { base44 } from '@/api/base44Client';
   
   // ❌ Avoid
   import { Button } from '../../components/ui/button';
   ```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.jsx`)
- **Files**: camelCase or kebab-case (`use-mobile.jsx`, `base44Client.js`)
- **Variables**: camelCase (`userData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`, `API_URL`)
- **CSS Classes**: kebab-case (`btn-primary`, `card-header`)

### File Organization

- Group related files by feature, not by type
- Keep components small and focused (< 300 lines)
- Extract reusable logic into custom hooks
- Share common components in `components/shared/`

### Styling Guidelines

1. **Use Tailwind Utility Classes**
   ```jsx
   <div className="flex items-center gap-4 p-6 bg-gray-800 rounded-lg">
     {/* Content */}
   </div>
   ```

2. **Complex Styles: Use Component Variants**
   ```jsx
   import { cva } from 'class-variance-authority';
   
   const buttonVariants = cva('btn-base', {
     variants: {
       variant: {
         primary: 'bg-blue-500',
         secondary: 'bg-gray-500'
       }
     }
   });
   ```

3. **Consistent Spacing**
   - Use Tailwind spacing scale (p-4, m-6, gap-2)
   - Follow 4px/8px base grid

### Code Comments

Add comments for:
- Complex business logic
- Non-obvious algorithms
- API integration specifics
- TODO items

```jsx
// Fetch user data with retry logic for network errors
const fetchUserData = async () => {
  // Implementation
};

// TODO: Add pagination support
```

## Testing

### Manual Testing

1. Start the development server
2. Navigate to relevant pages
3. Test user interactions
4. Verify API calls in Network tab
5. Check console for errors

### Browser Testing

Test in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing

- Use browser DevTools device emulation
- Test responsive layouts
- Verify touch interactions

## Building

### Production Build

Create an optimized production build:

```bash
npm run build
```

**Output:**
- `dist/` directory with optimized assets
- Minified JavaScript
- Optimized CSS
- Compressed assets

**Build Statistics:**
```bash
vite v6.1.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-a1b2c3d4.css   123.45 kB
dist/assets/index-e5f6g7h8.js    567.89 kB
```

### Build Analysis

Analyze bundle size:

```bash
npm run build -- --mode production
```

Check the output for:
- Large dependencies
- Unused code
- Optimization opportunities

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Module Not Found

```bash
Error: Cannot find module '@/components/ui/button'
```

**Solution:**
1. Check path alias in `vite.config.js`
2. Verify file exists
3. Restart dev server

#### Environment Variables Not Loading

**Solution:**
1. Ensure `.env` file is in root directory
2. Restart dev server
3. Verify variable names start with `VITE_`

#### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

#### ESLint Errors

```bash
# Fix automatically
npm run lint:fix

# If errors persist, check eslint.config.js
```

### Getting Help

1. Check documentation in `docs/` directory
2. Review GitHub issues
3. Contact the development team
4. Check Base44 documentation

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Base44 SDK Documentation](https://base44.com/docs)
- [Radix UI Documentation](https://radix-ui.com)

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team

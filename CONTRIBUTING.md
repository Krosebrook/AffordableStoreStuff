# Contributing to FlashFusion

Thank you for your interest in contributing to FlashFusion! This document provides comprehensive guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL 12+ (or use Replit's built-in database)
- Git for version control
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/AffordableStoreStuff.git
   cd AffordableStoreStuff
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Krosebrook/AffordableStoreStuff.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Error Lens
- GitLens

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports

Found a bug? Help us fix it!

**Before submitting:**
- Check existing issues to avoid duplicates
- Ensure you're using the latest version
- Test with a clean environment if possible

**What to include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or videos (if applicable)
- Environment details (OS, browser, Node version)
- Error messages or logs

**Template:**
```markdown
**Bug Description**
Brief description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120]
- Node: [e.g., v18.17.0]
- npm: [e.g., 9.6.7]

**Screenshots**
Add screenshots if applicable

**Additional Context**
Any other relevant information
```

#### 💡 Feature Requests

Have an idea for a new feature?

**Before submitting:**
- Check existing feature requests
- Ensure it aligns with project goals
- Consider implementation complexity

**What to include:**
- Problem statement (what problem does this solve?)
- Proposed solution
- Alternative solutions considered
- Use cases and examples
- Impact on existing features

#### 📖 Documentation Improvements

Documentation is crucial! Help us improve:

- Fix typos or unclear explanations
- Add examples and tutorials
- Improve API documentation
- Translate documentation
- Add diagrams or visuals

#### 🔧 Code Contributions

Ready to code? Great!

**Good first issues:**
- Look for issues labeled `good first issue`
- Bug fixes with clear reproduction steps
- Small feature additions
- Test improvements
- Performance optimizations

## Development Workflow

### Branch Strategy

We follow a modified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update your local repository
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit your changes
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes
- `ci:` - CI/CD changes

**Examples:**
```bash
feat(auth): add OAuth2 authentication
fix(cart): resolve quantity update bug
docs(api): update authentication endpoints
style(ui): improve button styling
refactor(db): optimize query performance
test(checkout): add e2e checkout tests
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature-name
git rebase main
```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Strict mode** - Follow strict TypeScript configuration
- **Type everything** - Avoid `any` types
- **Interfaces over types** - Prefer interfaces for object shapes

```typescript
// ✅ Good
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// ❌ Bad
type Product = {
  id: any;
  name: string;
  price: number;
  stock: number;
};
```

### React Best Practices

- **Functional components** - Use hooks instead of classes
- **Custom hooks** - Extract reusable logic into hooks
- **PropTypes** - Define prop types with TypeScript
- **Naming conventions** - PascalCase for components, camelCase for functions
- **Component size** - Keep components small and focused

```typescript
// ✅ Good
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Component implementation
}

// ❌ Bad
export function ProductCard(props: any) {
  // Component implementation
}
```

### File Organization

```
components/
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── product-card.tsx       # Feature-specific components
└── cart-drawer.tsx

pages/                     # Page components
├── dashboard.tsx
├── products.tsx
└── checkout.tsx

hooks/                     # Custom hooks
├── use-auth.ts
├── use-cart.ts
└── use-products.ts

lib/                       # Utilities and helpers
├── utils.ts
├── api.ts
└── constants.ts
```

### Styling Guidelines

- **Tailwind CSS** - Use utility classes
- **Component variants** - Use `class-variance-authority` for variants
- **Consistent naming** - Follow design token naming
- **Responsive design** - Mobile-first approach
- **Dark mode** - Support dark theme

```typescript
// ✅ Good - Using Tailwind utilities
<div className="flex items-center justify-between p-4 bg-card rounded-lg">

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### API Design

- **RESTful conventions** - Follow REST principles
- **Consistent naming** - Use kebab-case for URLs
- **Error handling** - Return appropriate status codes
- **Input validation** - Validate all inputs with Zod
- **Authentication** - Protect endpoints appropriately

```typescript
// ✅ Good
router.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await storage.getProduct(Number(id));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// ❌ Bad
router.get('/api/getProduct', async (req, res) => {
  const product = await storage.getProduct(req.query.id);
  res.json(product);
});
```

## Testing Guidelines

### Testing Philosophy

- **Write tests first** (TDD when possible)
- **Test behavior, not implementation**
- **Aim for high coverage** (>80%)
- **Keep tests simple and readable**

### E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should display product list', async ({ page }) => {
    await expect(page.locator('[data-testid="product-list"]'))
      .toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.click('[data-testid="add-to-cart"]:first-child');
    await expect(page.locator('[data-testid="cart-count"]'))
      .toHaveText('1');
  });
});
```

### Test Data

- Use fixtures for test data
- Don't rely on external services in tests
- Clean up after tests
- Use test database for integration tests

### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/products.spec.ts

# Run in UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Documentation

### Documentation Standards

- **Clear and concise** - Write for developers of all skill levels
- **Code examples** - Include working code examples
- **Keep updated** - Update docs with code changes
- **Use markdown** - Follow markdown best practices

### Types of Documentation

1. **Code Comments**
   ```typescript
   /**
    * Fetches a product by ID from the database
    * @param id - The product ID
    * @returns The product or null if not found
    */
   async getProduct(id: number): Promise<Product | null> {
     // Implementation
   }
   ```

2. **API Documentation**
   - Document all endpoints
   - Include request/response examples
   - Specify authentication requirements
   - List possible error codes

3. **User Guides**
   - Step-by-step instructions
   - Screenshots and videos
   - Common troubleshooting
   - FAQs

4. **Architecture Docs**
   - System diagrams
   - Design decisions
   - Technology choices
   - Performance considerations

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### Submitting a Pull Request

1. **Create a clear title**
   ```
   feat(auth): add OAuth2 authentication
   ```

2. **Write a detailed description**
   ```markdown
   ## What does this PR do?
   Adds OAuth2 authentication support for Google and GitHub.
   
   ## Why is this change needed?
   Users requested social login for faster onboarding.
   
   ## Changes made
   - Added OAuth2 provider configuration
   - Implemented callback handlers
   - Added user profile sync
   - Updated UI with social login buttons
   
   ## Testing
   - [ ] Tested Google OAuth flow
   - [ ] Tested GitHub OAuth flow
   - [ ] Tested existing login still works
   - [ ] Added E2E tests
   
   ## Screenshots
   [Add screenshots if applicable]
   
   ## Related Issues
   Closes #123
   ```

3. **Request review**
   - Tag relevant reviewers
   - Be responsive to feedback
   - Make requested changes promptly

### Review Process

- Maintainers will review within 48 hours
- Address all comments and questions
- Make requested changes
- Push updates to same branch
- Request re-review when ready

### After Merge

- Delete your feature branch
- Update your local repository
- Start on next contribution!

```bash
# After PR is merged
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

## Community

### Getting Help

- **GitHub Discussions** - Ask questions and share ideas
- **Discord** - Join our community chat (coming soon)
- **Stack Overflow** - Tag questions with `flashfusion`

### Code Reviews

**As a reviewer:**
- Be respectful and constructive
- Focus on the code, not the person
- Explain your reasoning
- Suggest improvements
- Approve when satisfied

**As an author:**
- Be open to feedback
- Ask questions if unclear
- Make requested changes
- Thank reviewers for their time

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project website (coming soon)

Thank you for your time and effort! 🙏

## Questions?

If you have any questions, feel free to:
- Open a [GitHub Discussion](https://github.com/Krosebrook/AffordableStoreStuff/discussions)
- Comment on relevant issues
- Reach out to maintainers

---

**Happy Contributing! 🚀**

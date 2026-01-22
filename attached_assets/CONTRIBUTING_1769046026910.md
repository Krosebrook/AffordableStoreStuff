# Contributing to FlashFusion v2.1

Thank you for your interest in contributing to FlashFusion! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**How to Submit a Good Bug Report:**

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Provide specific examples
4. Describe the behavior you observed
5. Explain the behavior you expected
6. Include screenshots if applicable
7. Include your environment details:
   - OS and version
   - Browser and version
   - Node.js version
   - npm version

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS 12.0]
 - Browser: [e.g. Chrome 98]
 - Node.js: [e.g. 18.0.0]
 - Version: [e.g. 2.1.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**How to Submit a Good Enhancement Suggestion:**

1. Use a clear and descriptive title
2. Provide a detailed description of the proposed enhancement
3. Explain why this enhancement would be useful
4. List any alternative solutions you've considered
5. Include mockups or examples if applicable

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Requests

**Before Submitting a Pull Request:**

1. Check if there's an existing issue
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Test your changes
6. Update documentation if needed
7. Submit a pull request

**Pull Request Process:**

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flashfusionv2.1.git
   cd flashfusionv2.1
   ```

2. **Create a Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Changes:**
   - Follow the coding standards
   - Write meaningful commit messages
   - Keep changes focused and atomic

4. **Test Your Changes:**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

5. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to Your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Submit the pull request

**Pull Request Template:**

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issue
Fixes #(issue number)

## Changes Made
- List of changes made
- Another change
- And another

## Testing
Describe how you tested your changes:
- [ ] Tested locally
- [ ] Tested in different browsers
- [ ] Tested on mobile
- [ ] Added/updated tests

## Screenshots (if applicable)
Add screenshots to demonstrate the changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes thoroughly
```

## Development Guidelines

### Coding Standards

**JavaScript/React:**
- Use functional components
- Follow ESLint rules
- Use meaningful variable names
- Keep functions small and focused
- Comment complex logic

**Example:**
```jsx
// ✅ Good
function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  );
}

// ❌ Bad
function a({ b }) {
  const [c, d] = useState(false);
  return <div onClick={() => d(true)}>{b.name}</div>;
}
```

### Commit Message Guidelines

Follow the Conventional Commits specification:

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

**Examples:**
```bash
feat(dashboard): add usage chart component

Add a new chart component to display user usage statistics
over time with weekly and monthly views.

Closes #123

---

fix(auth): resolve token refresh issue

Fixed a bug where authentication tokens were not being
refreshed properly, causing users to be logged out unexpectedly.

Fixes #456

---

docs(api): update API documentation

Added examples for all API endpoints and clarified
parameter descriptions.
```

### Code Review Process

All submissions require review before merging:

1. **Automated Checks:**
   - Linting passes
   - Type checking passes
   - Build succeeds

2. **Manual Review:**
   - Code quality
   - Adherence to standards
   - Test coverage
   - Documentation updates

3. **Approval:**
   - At least one maintainer approval required
   - All comments addressed
   - CI/CD passes

### Branch Naming

Use descriptive branch names:

```bash
# Features
feature/add-user-dashboard
feature/implement-chat

# Bug fixes
fix/login-error
fix/memory-leak-in-component

# Documentation
docs/update-readme
docs/add-api-examples

# Refactoring
refactor/simplify-auth-flow
refactor/optimize-queries
```

## Project Structure

When adding new features, follow the existing structure:

```
src/
├── components/
│   └── [feature]/         # Group by feature
│       └── Component.jsx
├── pages/
│   └── PageName.jsx       # Top-level pages
├── api/
│   └── [feature].js       # API integrations
└── hooks/
    └── use-[feature].jsx  # Custom hooks
```

## Testing

### Manual Testing

Before submitting:
1. Test in multiple browsers
2. Test on mobile devices
3. Test with different screen sizes
4. Test error scenarios
5. Test with network throttling

### Writing Tests

(When test infrastructure is added)

```javascript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });
  
  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

## Documentation

### Code Comments

Add comments for:
- Complex algorithms
- Business logic
- Non-obvious code
- API integrations

```javascript
/**
 * Calculates the weighted score for WSJF prioritization
 * 
 * @param {number} businessValue - Business value score (1-10)
 * @param {number} timeCriticality - Time criticality score (1-10)
 * @param {number} riskReduction - Risk reduction score (1-10)
 * @param {number} jobSize - Job size estimate (1-10)
 * @returns {number} Weighted WSJF score
 */
function calculateWSJF(businessValue, timeCriticality, riskReduction, jobSize) {
  const costOfDelay = businessValue + timeCriticality + riskReduction;
  return costOfDelay / jobSize;
}
```

### Documentation Updates

Update documentation when:
- Adding new features
- Changing API interfaces
- Modifying configuration
- Adding dependencies
- Changing build process

## Community

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussions
- **Discord/Slack**: For real-time chat (if available)

### Recognition

Contributors will be recognized in:
- CHANGELOG.md
- README.md contributors section
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

Feel free to reach out:
- Open a discussion on GitHub
- Contact the maintainers
- Check existing documentation

---

Thank you for contributing to FlashFusion! 🚀

**Document Version**: 1.0  
**Last Updated**: January 2026

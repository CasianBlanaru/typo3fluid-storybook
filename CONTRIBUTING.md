# Contributing to TYPO3Fluid-Storybook-JS-Integration

We welcome contributions to TYPO3Fluid-Storybook-JS-Integration! This document describes how you can contribute to the project.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/typo3fluid-to-storybook.git`
3. **Install** dependencies: `npm install`
4. **Start** the development environment: `npm run dev`

## 📋 Development Workflow

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Local Setup

```bash
# Clone repository
git clone https://github.com/CasianBlanaru/typo3fluid-to-storybook.git
cd typo3fluid-to-storybook

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Create build
npm run build
```

### Branch Strategy

- `main` - Stable release branch
- `develop` - Development branch for new features
- `feature/feature-name` - Feature branches
- `bugfix/bug-description` - Bugfix branches
- `hotfix/critical-fix` - Critical hotfixes

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(template): add caching mechanism for FluidTemplate
fix(api): handle network errors gracefully
docs(readme): update installation instructions
test(unit): add tests for error handling
```

## 🔧 Code Standards

### TypeScript Guidelines

- Use TypeScript for all new files
- Define explicit types where possible
- Use interfaces for complex object structures
- Document public APIs with JSDoc

### Code Style

```typescript
// ✅ Good
interface FluidTemplateOptions {
  templatePath: string;
  variables?: Record<string, any>;
  section?: string;
  layout?: string;
}

/**
 * Renders a TYPO3 Fluid template via API
 */
export function FluidTemplate(options: FluidTemplateOptions): string {
  // Implementation
}

// ❌ Bad
function fluidTemplate(opts: any): any {
  // Implementation
}
```

### Linting & Formatting

```bash
# Code linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Type checking
npm run type-check
```

## 🧪 Tests

### Test Structure

```
test/
├── unit/           # Unit Tests
├── integration/    # Integration Tests
└── fixtures/       # Test Fixtures
```

### Test Guidelines

- Write tests for new features
- Maintain at least 80% code coverage
- Use descriptive test names
- Group related tests in `describe` blocks

```typescript
describe('FluidTemplate', () => {
  describe('when API is available', () => {
    test('should render template successfully', () => {
      // Test implementation
    });
  });

  describe('when API returns error', () => {
    test('should handle error gracefully', () => {
      // Test implementation
    });
  });
});
```

### Test Commands

```bash
npm test                # Run all tests
npm run test:watch      # Tests in watch mode
npm run test:coverage   # Tests with coverage report
npm run test:ci         # Tests for CI/CD
```

## 📚 Documentation

### README Updates

- Keep the README up to date
- Add examples for new features
- Document breaking changes
- Use German for comments, English for code

### Code Documentation

```typescript
/**
 * Renders a TYPO3 Fluid template through the configured API endpoint
 *
 * @param options - Configuration options for template rendering
 * @param options.templatePath - Path to the Fluid template (EXT: syntax)
 * @param options.variables - Variables to pass to the template
 * @param options.section - Optional section name to render
 * @param options.layout - Optional layout name to use
 * @returns Rendered HTML string or error message
 *
 * @example
 * ```typescript
 * const html = FluidTemplate({
 *   templatePath: 'EXT:my_ext/Resources/Private/Templates/MyTemplate.html',
 *   variables: { title: 'Hello World' }
 * });
 * ```
 */
```

## 🐛 Bug Reports

### Before Reporting

1. Search for existing issues
2. Check the latest version
3. Test with minimal reproduction

### Bug Report Template

```markdown
**Description**
A brief description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. Scroll down to...
4. See error

**Expected Behavior**
What should happen?

**Actual Behavior**
What happens instead?

**Environment**
- OS: [e.g. macOS 14.0]
- Node.js: [e.g. 18.17.0]
- Package Version: [e.g. 0.0.1]
- TYPO3 Version: [e.g. 12.4]

**Additional Context**
Screenshots, logs, etc.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Problem/Use Case**
Describe the problem or use case

**Proposed Solution**
What could the solution look like?

**Alternatives**
Have you considered other solutions?

**Additional Context**
Mockups, examples, etc.
```

## 🔄 Pull Request Process

### Checklist

- [ ] Tests written and passing
- [ ] Code style followed (ESLint + Prettier)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow conventions
- [ ] PR description is complete

### PR Template

```markdown
## Changes

- [ ] Bug Fix
- [ ] Feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Tests

## Description

Describe your changes here...

## Related Issues

Fixes #123

## Test Plan

How did you test these changes?

## Screenshots

If UI changes...

## Breaking Changes

- [ ] Yes, there are breaking changes
- [ ] No, no breaking changes

## Checklist

- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## 🎯 Development Guidelines

### Performance

- Implement caching where appropriate
- Avoid unnecessary API calls
- Optimize bundle size
- Use lazy loading

### Security

- Validate all inputs
- Sanitize HTML output
- Use secure HTTP headers
- Keep dependencies up to date

### Accessibility

- Follow WCAG 2.1 Guidelines
- Test with screen readers
- Implement keyboard navigation
- Use semantic HTML

## 📞 Support

- **GitHub Issues**: [Issue Tracker](https://github.com/CasianBlanaru/typo3fluid-to-storybook/issues)
- **Email**: casianus@me.com
- **Documentation**: See README.md

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by this code.

## 🏆 Recognition

Contributors are automatically added to the [Contributors List](https://github.com/CasianBlanaru/typo3fluid-to-storybook/graphs/contributors).

---

**Thank you for your contribution! 🎉**

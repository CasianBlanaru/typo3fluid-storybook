# TYPO3 Fluid Storybook Integration Guide

This guide explains how to integrate both the **Frontend Package** and **Backend Extension** for a complete TYPO3 Fluid Storybook setup.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    HTTP POST    ┌─────────────────────┐
│   Frontend Package  │ ──────────────→ │  Backend Extension  │
│                     │                 │                     │
│ • Storybook Stories │                 │ • TYPO3 Extension   │
│ • FluidTemplate()   │                 │ • API Endpoints     │
│ • TypeScript/JS     │                 │ • Fluid Rendering   │
│ • NPM Package       │                 │ • PHP Classes       │
└─────────────────────┘                 └─────────────────────┘
```

## 📦 Repository Structure

### Frontend Package
- **Repository**: [typo3fluid-storybook](https://github.com/CasianBlanaru/typo3fluid-storybook)
- **Purpose**: Client-side Storybook integration
- **Language**: TypeScript/JavaScript
- **Distribution**: NPM Package

### Backend Extension
- **Repository**: [TYPO3 Storybook Extension](https://github.com/CasianBlanaru/Storybook)
- **Purpose**: TYPO3 API endpoints for Fluid rendering
- **Language**: PHP
- **Distribution**: TYPO3 Extension

## 🚀 Quick Start Guide

### Step 1: Backend Setup (TYPO3 Extension)

1. **Install TYPO3 Extension:**
   ```bash
   # Via Composer (Recommended)
   composer require casian/typo3-storybook-extension

   # Or clone from GitHub
   git clone https://github.com/CasianBlanaru/Storybook.git typo3conf/ext/storybook
   ```

2. **Activate Extension:**
   - Go to TYPO3 Backend → Extensions
   - Find "Storybook Fluid Integration"
   - Click "Activate"

3. **Verify Installation:**
   ```bash
   # Test API endpoint
   curl -X POST http://your-typo3-site.com/api/fluid/render \
     -H "Content-Type: application/json" \
     -d '{"templatePath":"EXT:storybook/Resources/Private/Templates/Test.html"}'
   ```

### Step 2: Frontend Setup (NPM Package)

1. **Install Frontend Package:**
   ```bash
   npm install typo3fluid-storybook-js-integration
   # or
   yarn add typo3fluid-storybook-js-integration
   ```

2. **Configure Environment:**
   ```bash
   # Create .env file
   echo "TYPO3FLUID_STORYBOOK_API_URL=http://your-typo3-site.com/api/fluid/render" > .env
   ```

3. **Import in Storybook:**
   ```typescript
   // In your .stories.ts file
   import FluidTemplate from 'typo3fluid-storybook-js-integration';

   export const MyComponent = () => {
     const html = FluidTemplate({
       templatePath: 'EXT:your_ext/Resources/Private/Templates/MyTemplate.html',
       variables: { title: 'Hello World' }
     });

     return html;
   };
   ```

## 🔧 Advanced Configuration

### Development Environment

#### Local TYPO3 Setup
```bash
# Start TYPO3 development server
cd your-typo3-project
php -S localhost:8000 -t public/

# Or using DDEV
ddev start
```

#### Storybook Configuration
```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    // Add other addons
  ],
  env: (config) => ({
    ...config,
    TYPO3FLUID_STORYBOOK_API_URL: process.env.TYPO3FLUID_STORYBOOK_API_URL,
  }),
};
```

### Production Configuration

#### CORS Setup
```php
# In TYPO3 LocalConfiguration.php
$GLOBALS['TYPO3_CONF_VARS']['HTTP']['cors'] = [
    'allowOrigin' => 'https://your-storybook.vercel.app',
    'allowMethods' => 'POST, OPTIONS',
    'allowHeaders' => 'Content-Type, Authorization',
];
```

#### Environment Variables
```env
# Production .env
TYPO3FLUID_STORYBOOK_API_URL=https://api.your-typo3.com/api/fluid/render
TYPO3FLUID_STORYBOOK_DEBUG=false
API_RATE_LIMIT=100
```

## 🧪 Testing Integration

### Manual Testing
```bash
# 1. Test Backend API
curl -X POST http://localhost:8000/api/fluid/render \
  -H "Content-Type: application/json" \
  -d '{
    "templatePath": "EXT:storybook/Resources/Private/Templates/Test.html",
    "variables": {"title": "Test Integration"}
  }'

# 2. Start Storybook
npm run storybook

# 3. Check browser console for errors
```

### Automated Testing
```typescript
// Integration test example
describe('FluidTemplate Integration', () => {
  test('renders template via API', async () => {
    const result = FluidTemplate({
      templatePath: 'EXT:test/Resources/Private/Templates/Simple.html',
      variables: { message: 'Integration Test' }
    });

    expect(result).toContain('Integration Test');
  });
});
```

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution**: Configure CORS in TYPO3 backend or use development proxy.

### Issue 2: Template Not Found
```
Error: Template file not found at EXT:...
```
**Solution**:
- Verify template path format
- Check file exists on server
- Ensure correct extension key

### Issue 3: API Endpoint Not Working
```
404 Not Found: /api/fluid/render
```
**Solution**:
- Check extension is activated
- Verify TYPO3 routing configuration
- Check server rewrite rules

### Issue 4: Environment Variables Not Loaded
```
Error: TYPO3FLUID_STORYBOOK_API_URL not set
```
**Solution**:
- Check .env file exists
- Verify Storybook loads environment variables
- Use absolute URL format

## 📊 Performance Optimization

### Frontend Caching
```typescript
// Enable caching for better performance
const FluidTemplate = require('typo3fluid-storybook-js-integration');

// Caching is automatic - no configuration needed
const result = FluidTemplate({
  templatePath: 'EXT:your_ext/Resources/Private/Templates/Heavy.html',
  variables: heavyDataObject
});
```

### Backend Optimization
```php
# In TYPO3 extension configuration
$GLOBALS['TYPO3_CONF_VARS']['STORYBOOK'] = [
    'cache' => [
        'enabled' => true,
        'lifetime' => 3600, // 1 hour
    ],
    'performance' => [
        'maxTemplateSize' => '1MB',
        'timeout' => 30,
    ],
];
```

## 🚀 Deployment Strategies

### Strategy 1: Separate Deployments
- **Backend**: Deploy TYPO3 extension to production
- **Frontend**: Deploy Storybook to static hosting
- **Pros**: Independent deployments, easier scaling
- **Cons**: Need to coordinate API changes

### Strategy 2: Integrated Deployment
- **Combined**: Single deployment pipeline
- **Pros**: Synchronized releases, easier development
- **Cons**: More complex setup

### Example CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Integration
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy TYPO3 Extension
        run: |
          # Deploy to TYPO3 instance

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Storybook
        run: |
          npm run build-storybook
          # Deploy to static hosting
```

## 📚 Additional Resources

### Documentation Links
- **Frontend Package**: [README](https://github.com/CasianBlanaru/typo3fluid-storybook/blob/main/README.md)
- **Backend Extension**: [README](https://github.com/CasianBlanaru/Storybook/blob/main/README.md)
- **Live Demo**: [typo3fluid-storybook.vercel.app](https://typo3fluid-storybook.vercel.app)

### Community & Support
- **Issues**: Create issues in respective repositories
- **Discussions**: Use GitHub Discussions for questions
- **Email**: casianus@me.com

### Version Compatibility
| Frontend | Backend | TYPO3 | Node.js | Status |
|----------|---------|-------|---------|--------|
| ^0.1.0 | ^0.1.0 | 12.4+ | 18.x+ | ✅ Stable |
| ^0.1.0 | ^0.1.0 | 11.5+ | 18.x+ | ⚠️ Beta |

---

**Need help?** Create an issue in the appropriate repository or contact the maintainer.

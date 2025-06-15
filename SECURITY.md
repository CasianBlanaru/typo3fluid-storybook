# Security Policy

## 🛡️ Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## 🔐 Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

For security vulnerabilities, please do **not** create a public GitHub issue.

### 2. Report privately

**Email**: [casianus@me.com](mailto:casianus@me.com)

**Subject**: `[SECURITY] TYPO3Fluid-Storybook - Vulnerability Report`

### 3. Information to include

In your report, please include:

- **Vulnerability type** (e.g., XSS, CSRF, injection)
- **Affected components** (FluidTemplate function, API, etc.)
- **Attack scenario** (how could this be exploited?)
- **Proof of Concept** (if possible)
- **Suggested fix** (if you have one)
- **Your contact information**

### 4. Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Status updates**: Every 14 days until resolved
- **Fix release**: Depends on severity (critical: 1-7 days, high: 7-30 days)

## 🏆 Security Hall of Fame

We recognize security researchers who help make our project safer:

<!-- Will be updated when security issues are reported and fixed -->
*Currently empty - be the first!*

## 🔒 Security best practices

### For users

1. **Keep dependencies up to date**
   ```bash
   npm audit
   npm update
   ```

2. **Secure your TYPO3 API endpoint**
   - Use HTTPS only
   - Implement authentication
   - Validate all inputs
   - Limit API access

3. **Environment variables**
   - Use `.env` files for sensitive data
   - Never commit API keys to Git
   - Use different keys for development/production

4. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' 'unsafe-inline'">
   ```

### For developers

1. **Input validation**
   ```typescript
   // Always validate API responses
   if (!response.html && response.error) {
     throw new Error(`API Error: ${response.error}`);
   }
   ```

2. **Output sanitization**
   ```typescript
   // Be careful with innerHTML - sanitize when needed
   const sanitizedHtml = DOMPurify.sanitize(response.html);
   ```

3. **Error handling**
   ```typescript
   // Don't expose internal details in error messages
   catch (error) {
     console.error('Internal error:', error);
     return 'Template rendering failed';
   }
   ```

## 🚨 Known security considerations

### 1. Cross-Site Scripting (XSS)

**Risk**: The FluidTemplate function inserts HTML directly into the DOM.

**Mitigation**:
- TYPO3 server should sanitize template output
- Consider using DOMPurify for additional client-side sanitization
- Be careful with user-generated content in templates

### 2. Server-Side Request Forgery (SSRF)

**Risk**: The API endpoint in TYPO3 could be exploited for SSRF attacks.

**Mitigation**:
- Validate and whitelist template paths on the server
- Use the `EXT:` syntax to limit path access
- Implement proper access controls

### 3. Information disclosure

**Risk**: Error messages could leak sensitive information.

**Mitigation**:
- Configure error reporting appropriately
- Don't expose internal paths or system information
- Use generic error messages in production

### 4. Denial of Service (DoS)

**Risk**: Large or complex templates could cause DoS.

**Mitigation**:
- Implement rate limiting on the API endpoint
- Set timeouts for template rendering
- Limit template complexity and size

## 🔧 Security tools

We use various tools to maintain security:

```bash
# Security audit
npm audit

# Dependency scanning
npm run security:check

# SAST scanning (if available)
npm run security:scan
```

## 📋 Security checklist

For each release, we verify:

- [ ] All dependencies are up to date
- [ ] Security audit passes
- [ ] No known vulnerabilities in dependencies
- [ ] Input validation is in place
- [ ] Error handling doesn't leak information
- [ ] Documentation includes security best practices

## 📚 Security resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TYPO3 Security Guide](https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Security/)

---

**Remember**: Security is a shared responsibility. We do our part, but you need to secure your implementation too!

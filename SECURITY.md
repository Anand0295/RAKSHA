# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

### Data Loss Prevention (DLP)
- Screenshot blocking
- Clipboard restrictions
- Developer tools disabled
- Print functionality blocked
- Right-click menu disabled

### Blockchain Security
- SHA256 hash generation
- Immutable link tracking
- Cryptographic verification
- Tamper-proof audit trail

### Authentication
- Secure session management
- 24-hour token expiry
- Role-based access control
- Encrypted local storage

## Reporting a Vulnerability

**DO NOT** create public GitHub issues for security vulnerabilities.

### For Demo/Development Issues:
1. Create a private issue or discussion
2. Include detailed reproduction steps
3. Specify affected components
4. Suggest potential fixes if known

### For Production Security Concerns:
Contact your system administrator or security team directly.

## Security Best Practices

### Development
- Never commit real credentials
- Use demo credentials only: `admin@mod.gov.in` / `demo123`
- Test DLP functionality regularly
- Maintain blockchain integrity
- Follow secure coding practices

### Deployment
- Enable HTTPS in production
- Configure proper CSP headers
- Regular security audits
- Monitor DLP violations
- Update dependencies regularly

## Compliance

This system is designed for military communication security:
- DLP compliance mandatory
- Audit trail requirements
- Access control enforcement
- Data encryption standards
- Mobile security protocols
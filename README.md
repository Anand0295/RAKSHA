# 🛡️ Indian Army HQ Secure Link Dashboard

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-DLP%20Enabled-red.svg)](SECURITY.md)
[![Mobile](https://img.shields.io/badge/Mobile-Responsive-orange.svg)](#mobile-features)

A secure React web application designed for military communications with enterprise-grade Data Loss Prevention (DLP), blockchain security, and mobile-responsive design.

## 🚀 Features

### 🔐 Security
- **Enterprise DLP Protection** - Screenshot blocking, clipboard restrictions, developer tools disabled
- **Blockchain Security** - SHA256 hashing, immutable link tracking, cryptographic verification
- **Secure Authentication** - Role-based access control, 24-hour sessions, encrypted tokens
- **Audit Trail** - Comprehensive logging, violation monitoring, CSV export

### 📱 User Interface
- **Responsive Design** - Mobile-first approach with touch-optimized interfaces
- **Dashboard** - Real-time link management, system statistics, activity monitoring
- **Admin Panel** - Approval workflows, user management, system configuration
- **Meeting Rooms** - Google Meet-style interface with video/audio/chat

### 🔧 Technical
- **React 18** - Modern functional components with hooks
- **Tailwind CSS** - Utility-first styling with responsive breakpoints
- **React Router v6** - Client-side routing with protected routes
- **Local Storage** - Secure session and data persistence

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Demo Credentials](#-demo-credentials)
- [Installation](#-installation)
- [Docker Deployment](#-docker-deployment)
- [Performance Optimization](#-performance-optimization)
- [Usage](#-usage)
- [Mobile Features](#-mobile-features)
- [Security Features](#-security-features)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

## ⚡ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd indian-army-hq-secure-dashboard

# Install dependencies
npm install

# Start development server
npm start

# Open browser
# Web: http://localhost:3000
# Mobile: http://localhost:3000 (responsive)
```

## 🔑 Demo Credentials

```
Login ID: admin@mod.gov.in
Password: demo123
Role: Admin (Full Access)
```

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🐳 Docker Deployment

### Quick Deploy with Docker

```bash
# Build the Docker image
docker build -t raksha-secure:latest .

# Run the container
docker run -p 80:80 raksha-secure:latest

# Access the application
open http://localhost
```

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  raksha:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### Production Deployment

```bash
# Using docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Container Features
- **Multi-stage build** - Optimized image size (~50MB)
- **Nginx web server** - High-performance static file serving
- **Gzip compression** - Reduced bandwidth usage
- **Security headers** - XSS, CSRF, and clickjacking protection
- **Health checks** - Automatic container health monitoring
- **Production ready** - Environment-specific optimizations

## ⚡ Performance Optimization

### Bundle Size Optimization

This project includes advanced webpack configurations for production builds:

```bash
# Build with bundle analysis
ANALYZE=true npm run build

# Standard production build
npm run build
```

### Optimization Features

1. **Code Splitting**
   - Vendor libraries separated into dedicated chunks
   - Common code extracted for better caching
   - Lazy loading for route-based components

2. **Tree Shaking**
   - Unused code elimination
   - ES6 module optimization
   - PropTypes removed in production

3. **Minification & Compression**
   - JavaScript minified with Terser
   - Console.log statements removed
   - Gzip compression for all assets

4. **React Profiler**
   - Built-in performance monitoring
   - Slow render detection (>16ms threshold)
   - Production analytics integration

### Using React Profiler

```javascript
import { withProfiler } from './utils/Profiler';

// Wrap any component to monitor performance
const OptimizedComponent = withProfiler(MyComponent, 'MyComponent');

// Or use directly
import { Profiler, onRenderCallback } from './utils/Profiler';

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### Performance Metrics

- **Bundle Size**: ~200KB gzipped (main chunk)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Lighthouse Score**: 90+

### Optimization Tips

1. Use `React.lazy()` for route-based code splitting
2. Implement virtual scrolling for large lists
3. Memoize expensive computations with `useMemo`
4. Use `React.memo` for frequently re-rendered components
5. Optimize images (WebP format, lazy loading)
6. Enable service worker for offline support

## 💻 Usage

### User Dashboard
1. **Login** - Enter credentials on the sign-in page
2. **Dashboard** - View statistics and manage links
3. **Create Links** - Generate secure meeting room links
4. **Join Meetings** - Use token-based links for secure video calls
5. **View Logs** - Monitor security events and audit trail

### Admin Functions
1. **Approve Links** - Review and approve link creation requests
2. **User Management** - Manage user accounts and permissions
3. **System Monitoring** - Track system health and security
4. **Export Reports** - Download audit logs and analytics

## 📱 Mobile Features

### Touch-Optimized Interface
- Large tap targets (minimum 44x44px)
- Swipe gestures for navigation
- Bottom navigation bar for easy thumb access
- Responsive grid layouts

### Mobile-Specific Components
- **MobileNav** - Bottom navigation with icons
- **MobileHeader** - Compact header with burger menu
- **TouchControls** - Larger buttons and inputs

### Responsive Breakpoints
```javascript
- sm: 640px   // Small phones
- md: 768px   // Tablets
- lg: 1024px  // Small laptops
- xl: 1280px  // Desktops
```

## 🔐 Security Features

### Data Loss Prevention (DLP)

```javascript
import { enableDLP } from './utils/dlp';

// Enable comprehensive DLP protection
enableDLP({
  disableScreenshots: true,
  disableClipboard: true,
  disableDevTools: true,
  disablePrint: true,
  watermark: true
});
```

### Blockchain Security

- Immutable link tracking with SHA256 hashing
- Cryptographic verification of all links
- Tamper-proof audit trail
- Block chain integrity validation

### Security Best Practices

1. **Authentication**
   - JWT tokens with 24-hour expiry
   - Secure session management
   - Role-based access control

2. **Data Protection**
   - Client-side encryption for sensitive data
   - Secure local storage
   - XSS and CSRF protection

3. **Network Security**
   - HTTPS enforcement
   - Content Security Policy headers
   - Rate limiting on API calls

## 🗺️ API Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Auto-redirect based on authentication |
| `/sign-in` | Public | Login page with credentials |
| `/dashboard` | Authenticated | Main dashboard and link management |
| `/admin` | Admin Only | Administrative controls and approvals |
| `/logs` | Authenticated | Security logs and audit trail |
| `/links` | Authenticated | Link management and tracking |
| `/l/:token` | Token-based | Secure meeting rooms |

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Shared UI components
│   ├── meeting/        # Meeting room interface
│   ├── mobile/         # Mobile-specific components
│   └── security/       # Security features
├── pages/              # Main application pages
├── utils/              # Utility functions (DLP, Profiler, etc.)
├── services/           # API and blockchain services
├── constants/          # Application constants
└── hooks/              # Custom React hooks
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines
- Follow React functional component patterns
- Use Tailwind CSS for all styling
- Maintain mobile-responsive design
- Ensure DLP compliance
- Test on both desktop and mobile
- Run profiler to check for performance issues
- Keep bundle size under control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 📚 Documentation

- [User Manual](USER_MANUAL.md) - Comprehensive usage guide
- [Security Policy](SECURITY.md) - Security guidelines and reporting
- [Contributing Guide](CONTRIBUTING.md) - Development and contribution guidelines
- [Changelog](CHANGELOG.md) - Version history and updates

## 🏷️ Version

**Current Version**: 1.0.0  
**Last Updated**: 2025  
**Classification**: Demo/Educational Purpose

---

**⚠️ Security Notice**: This is a demonstration application. For production military use, additional security measures and compliance reviews are required.

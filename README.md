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
- Node.js 16.0 or higher
- npm 8.0 or higher
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm run serve
```

## 💻 Usage

### Web Application
1. Navigate to `http://localhost:3000`
2. Login with demo credentials
3. Access dashboard, admin panel, logs, and meeting rooms
4. Generate secure links and manage approvals

### Mobile Application
1. Open same URL on mobile device or use browser dev tools
2. Experience touch-optimized interface
3. Use hamburger menu for navigation
4. Enjoy card-based layouts and mobile-specific features

## 📱 Mobile Features

- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Touch Optimization**: 44px minimum touch targets, gesture support
- **Mobile Navigation**: Hamburger menu, slide-out drawers, bottom navigation
- **Card Layouts**: Mobile-specific card designs for all data displays
- **Device Integration**: Camera/microphone access for meetings

## 🛡️ Security Features

### Data Loss Prevention (DLP)
- **Screenshot Blocking**: PrintScreen, keyboard shortcuts disabled
- **Clipboard Protection**: Copy/cut/paste restrictions
- **Developer Tools**: F12, right-click, inspect element blocked
- **Print Prevention**: Print functionality disabled
- **Violation Monitoring**: Real-time logging and admin alerts

### Blockchain Security
- **SHA256 Hashing**: Cryptographic link generation
- **Immutable Records**: Tamper-proof audit trail
- **Token Validation**: Secure meeting room access
- **Cryptographic Verification**: End-to-end security

## 🗺️ API Routes

| Route | Access | Description |
|-------|--------|--------------|
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
│   └── mobile/         # Mobile-specific components
├── pages/              # Main application pages
├── utils/              # Utility functions (DLP, etc.)
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
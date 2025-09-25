# Indian Army HQ - Secure Link Dashboard

## Project Structure

```
react-app/
├── public/
│   └── index.html                 # Main HTML template
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── auth/                # Authentication components
│   │   │   └── SignIn.js        # Login component
│   │   ├── common/              # Shared components
│   │   │   └── TopNav.js        # Navigation header
│   │   └── meeting/             # Meeting-related components
│   │       ├── LinkApproval.js  # Link access control
│   │       └── SecureMeeting.js # Discord-style meeting room
│   ├── pages/                   # Main application pages
│   │   ├── Admin.js             # Admin control panel
│   │   ├── Dashboard.js         # Main dashboard
│   │   ├── Links.js             # Link management
│   │   └── Logs.js              # Event logs
│   ├── services/                # Business logic & APIs
│   │   └── blockchain.js        # Blockchain & crypto services
│   ├── constants/               # Application constants
│   │   └── index.js             # App config & enums
│   ├── hooks/                   # Custom React hooks (future)
│   ├── App.js                   # Main app component
│   └── index.js                 # Application entry point
├── package.json                 # Dependencies & scripts
└── README.md                    # Project documentation
```

## Key Features

- **Authentication**: Role-based access control (Admin/Analyst/Operator)
- **Link Management**: Secure link generation with blockchain tracking
- **Meeting Rooms**: Discord-style video/voice chat with RBAC
- **Real-time Approval**: Admin approval system for link access
- **Device Tracking**: IP address and device information logging
- **Military Context**: Indian Army themed with proper security protocols

## Technology Stack

- **Frontend**: React.js with functional components
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Security**: SHA256 hashing, blockchain integration
- **Storage**: localStorage for persistence
- **Communication**: WebRTC for video/audio

## Professional Organization

- Clean separation of concerns
- Modular component architecture
- Centralized constants and services
- Scalable folder structure
- Professional naming conventions
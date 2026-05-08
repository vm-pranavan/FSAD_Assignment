# Architecture Documentation

## System Architecture

SkillSwap follows a **microservice-inspired monolithic architecture** with clear service boundaries for each domain entity.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    React SPA (Vite)                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   React Router                           │ │
│  │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │ │
│  │  │  Auth  │ │Dashboard │ │ Skills │ │   Sessions   │  │ │
│  │  │ Pages  │ │   Page   │ │  Hub   │ │   Manager    │  │ │
│  │  └────────┘ └──────────┘ └────────┘ └──────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              AuthContext (State Mgmt)             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │            Axios API Service (HTTP Client)        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST (JSON)
                    JWT Bearer Token
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                         SERVER                               │
│                   Node.js + Express                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                       │ │
│  │  ┌──────────┐ ┌─────────────┐ ┌──────────────────┐    │ │
│  │  │   CORS   │ │ JWT Auth    │ │  Error Handler   │    │ │
│  │  │  Config  │ │ Middleware  │ │    Middleware     │    │ │
│  │  └──────────┘ └─────────────┘ └──────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Service Layer                          │ │
│  │  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │   Auth    │ │  Users   │ │  Skills  │ │ Sessions │ │ │
│  │  │ Service   │ │ Service  │ │ Service  │ │ Service  │ │ │
│  │  │ ┌───────┐ │ │ ┌──────┐│ │ ┌──────┐│ │ ┌──────┐│ │ │
│  │  │ │Routes │ │ │ │Routes││ │ │Routes││ │ │Routes││ │ │
│  │  │ │Ctrl   │ │ │ │Ctrl  ││ │ │Ctrl  ││ │ │Ctrl  ││ │ │
│  │  │ └───────┘ │ │ │Model ││ │ │Model ││ │ │Model ││ │ │
│  │  └───────────┘ │ └──────┘│ │ └──────┘│ │ └──────┘│ │ │
│  │                └──────────┘ └──────────┘ └──────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Mongoose ODM
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       DATABASE                               │
│                    MongoDB 8.2                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────┐  │
│  │   users    │ │   skills   │ │       sessions         │  │
│  └────────────┘ └────────────┘ └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   └── ProtectedRoute
│       └── AppLayout
│           ├── Sidebar (Navigation)
│           ├── Navbar (Search, User Menu)
│           └── Routes
│               ├── /dashboard → DashboardPage
│               │   ├── StatsCards (4x)
│               │   ├── BarChart (Recharts)
│               │   ├── PieChart (Recharts)
│               │   ├── RecentSessions
│               │   └── TopMentors
│               ├── /skills → SkillsPage
│               │   ├── FilterBar
│               │   ├── SkillCard[] (Grid)
│               │   └── CreateSkillModal
│               ├── /sessions → SessionsPage
│               │   ├── StatusTabs
│               │   ├── SessionCard[]
│               │   ├── CreateSessionModal
│               │   └── ReviewModal
│               ├── /profile → ProfilePage
│               │   ├── ProfileHeader
│               │   ├── EditForm
│               │   └── SkillsList
│               └── /admin → AdminPage (Admin only)
│                   ├── UserTable
│                   └── RoleEditor
└── Toaster (Notifications)
```

### State Management
- **AuthContext** — Global authentication state (user, login, logout, register)
- **Component-level state** — useState for local UI state (modals, forms, filters)
- **API state** — useEffect + useState for server data fetching

### Design System
The application uses a custom CSS design system with:
- **CSS Custom Properties** — 60+ design tokens for colors, spacing, typography
- **Glassmorphism** — Semi-transparent cards with backdrop blur
- **Dark theme** — Curated color palette optimized for dark mode
- **Animations** — Framer Motion for page transitions, card animations, modals

## Backend Architecture

### Microservice-Style Structure
Each domain entity is organized as a self-contained service:
```
services/
├── auth/          # JWT authentication
│   ├── authController.js   (register, login, profile)
│   └── authRoutes.js
├── users/         # User management
│   ├── userController.js   (CRUD, search, pagination)
│   ├── userModel.js        (Mongoose schema)
│   └── userRoutes.js
├── skills/        # Skills marketplace
│   ├── skillController.js  (CRUD, matching, categories)
│   ├── skillModel.js
│   └── skillRoutes.js
└── sessions/      # Session scheduling
    ├── sessionController.js (CRUD, reviews, stats)
    ├── sessionModel.js
    └── sessionRoutes.js
```

### Middleware Pipeline
```
Request → CORS → JSON Parser → JWT Auth → Route Handler → Error Handler → Response
```

### Security
- **Password Hashing** — bcrypt with 10 salt rounds
- **JWT Tokens** — 7-day expiry, verified on every protected request
- **Role-based Access** — admin, mentor, student with middleware enforcement
- **Input Validation** — Mongoose schema validation
- **CORS** — Restricted to frontend origins only

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **Vite over CRA** | Faster build times, modern ESBuild, better DX |
| **Vanilla CSS over Tailwind** | Full control over design system, cleaner markup |
| **Context API over Redux** | Simpler for this scope, less boilerplate |
| **Mongoose over raw MongoDB** | Schema validation, middleware, population |
| **Framer Motion** | Smooth declarative animations, layout transitions |
| **Recharts** | React-native chart library, composable API |

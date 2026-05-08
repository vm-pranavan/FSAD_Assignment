# SkillSwap — Campus Skill Exchange Platform

![SkillSwap](https://img.shields.io/badge/SkillSwap-Campus_Platform-6c5ce7?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-47A248?style=for-the-badge&logo=mongodb)

## 📋 Problem Statement

University students have diverse skills (coding, design, music, languages, etc.) but no structured way to find peers for skill exchanges. **SkillSwap** enables peer-to-peer learning by matching students who want to teach with those who want to learn, facilitating structured mentoring sessions with reviews and ratings.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Auth Pages│ │Dashboard │ │Skills Hub│ │Sessions Mgr│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (HTTP/JSON)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               API Gateway (Express Router)               │
├─────────────┬─────────────┬──────────────┬──────────────┤
│ Auth Service│ User Service│ Skill Service│Session Service│
├─────────────┴─────────────┴──────────────┴──────────────┤
│                    MongoDB (Database)                     │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based auth with role-based access (Student, Mentor, Admin) |
| 📚 **Skills Hub** | CRUD for skill offerings with categories, search & filtering |
| 🤝 **Smart Matching** | Suggests peers based on complementary skills |
| 📅 **Session Management** | Request, accept, schedule, complete learning sessions |
| ⭐ **Reviews & Ratings** | Post-session feedback with average rating aggregation |
| 📊 **Dashboard** | Interactive charts, stats, recent activity, top mentors |
| 👥 **Admin Panel** | User management, role editing, platform analytics |
| 🎨 **Premium UI** | Dark glassmorphism design with smooth animations |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Framer Motion, Recharts, React Router |
| **Backend** | Node.js, Express.js (microservice-style architecture) |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Styling** | Vanilla CSS with custom design system |
| **Dev Tools** | Nodemon, Vite HMR |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/skillswap.git
cd skillswap

# Backend setup
cd backend
npm install
cp .env.example .env   # Configure your MongoDB URI

# Frontend setup
cd ../frontend
npm install
```

### Configuration

Create `backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Running the Application

```bash
# Terminal 1 — Start MongoDB (if local)
brew services start mongodb-community

# Terminal 2 — Start Backend
cd backend
npm run seed    # Seed demo data (first time only)
npm run dev     # Starts on http://localhost:5001

# Terminal 3 — Start Frontend
cd frontend
npm run dev     # Starts on http://localhost:5173
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillswap.com | admin123 |
| Mentor | pranavan@bits.edu | password123 |
| Student | ananya@bits.edu | password123 |

## 📁 Project Structure

```
skillswap/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT auth middleware
│   │   └── errorHandler.js          # Global error handler
│   ├── services/
│   │   ├── auth/                    # Authentication service
│   │   ├── users/                   # User management service
│   │   ├── skills/                  # Skills CRUD service
│   │   └── sessions/                # Session management service
│   ├── server.js                    # Express entry point
│   └── seed.js                      # Database seeder
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # Sidebar, Navbar
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── dashboard/           # Dashboard with charts
│   │   │   ├── skills/              # Skills Hub
│   │   │   ├── sessions/            # Session management
│   │   │   ├── profile/             # User profile
│   │   │   └── admin/               # Admin panel
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Router & layouts
│   │   └── index.css                # Design system
│   └── index.html
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DB_SCHEMA.md
    ├── ARCHITECTURE.md
    └── AI_USAGE_LOG.md
```

## 📖 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DB_SCHEMA.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [AI Usage Log & Reflection](docs/AI_USAGE_LOG.md)

## 🎥 Demo Video

[Watch the demo on Google Drive](YOUR_GOOGLE_DRIVE_LINK_HERE)

## 👤 Author

**Pranavan Kumar** — BITS Pilani (2024TM93672)

---

*Built as part of SE ZG503 Full Stack Application Development Assignment, BITS Pilani*

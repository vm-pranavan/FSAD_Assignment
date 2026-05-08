# SkillSwap API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Health Check

### `GET /api/health`
Returns API status.

**Response:**
```json
{
  "status": "ok",
  "message": "SkillSwap API is running",
  "timestamp": "2026-05-08T12:00:00.000Z"
}
```

---

## Auth Service

### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "year": "3rd Year",
  "bio": "Full-stack developer"
}
```

**Response (201):**
```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `POST /api/auth/login`
Login and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "rating": 4.5,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `GET /api/auth/profile` 🔒
Get current user profile.

**Response (200):**
```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "bio": "Full-stack developer",
  "department": "Computer Science",
  "skillsOffered": [...],
  "skillsWanted": [...],
  "rating": 4.5,
  "totalReviews": 10
}
```

### `PUT /api/auth/profile` 🔒
Update current user profile.

**Request Body:**
```json
{
  "name": "John D.",
  "bio": "Updated bio",
  "department": "CS",
  "year": "4th Year"
}
```

---

## User Service

### `GET /api/users` 🔒
Get all users (with pagination and search).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Search by name or email |
| role | string | Filter by role (student/mentor/admin) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response (200):**
```json
{
  "users": [...],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

### `GET /api/users/:id` 🔒
Get user by ID.

### `PUT /api/users/:id` 🔒
Update user (admin can change roles).

### `DELETE /api/users/:id` 🔒🛡️
Delete user (admin only).

---

## Skill Service

### `GET /api/skills` 🔒
Get all skills with filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Search in name, description, tags |
| category | string | Filter by category |
| level | string | Filter by proficiency level |
| page | number | Page number |
| limit | number | Items per page |

**Response (200):**
```json
{
  "skills": [
    {
      "_id": "64f...",
      "name": "React.js Development",
      "category": "technology",
      "description": "Learn to build modern web apps...",
      "proficiencyLevel": "advanced",
      "offeredBy": {
        "_id": "64f...",
        "name": "Pranavan",
        "avatar": "",
        "rating": 4.8
      },
      "tags": ["react", "javascript", "frontend"],
      "isActive": true
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1
}
```

### `GET /api/skills/:id` 🔒
Get skill details.

### `POST /api/skills` 🔒
Create a new skill offering.

**Request Body:**
```json
{
  "name": "React.js Development",
  "category": "technology",
  "description": "Learn to build modern web apps with React",
  "proficiencyLevel": "advanced",
  "tags": ["react", "javascript", "frontend"]
}
```

### `PUT /api/skills/:id` 🔒
Update skill (owner or admin).

### `DELETE /api/skills/:id` 🔒
Delete skill (owner or admin).

### `GET /api/skills/match` 🔒
Get skill matches based on user's wanted skills.

### `GET /api/skills/categories` 🔒
Get categories with skill counts.

**Response (200):**
```json
[
  { "_id": "technology", "count": 4 },
  { "_id": "design", "count": 2 }
]
```

### `POST /api/skills/:id/interest` 🔒
Express interest in learning a skill.

---

## Session Service

### `GET /api/sessions` 🔒
Get sessions for current user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| role | string | Filter by role in session (mentor/learner) |
| page | number | Page number |
| limit | number | Items per page |

### `POST /api/sessions` 🔒
Request a new session.

**Request Body:**
```json
{
  "skillId": "64f...",
  "mentorId": "64f...",
  "scheduledDate": "2026-05-15T14:00:00Z",
  "duration": 60,
  "location": "Library Room 3",
  "notes": "I want to learn React hooks"
}
```

### `PUT /api/sessions/:id` 🔒
Update session status (accept/complete/cancel).

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status Flow:** `pending` → `accepted` → `in-progress` → `completed` / `cancelled`

### `POST /api/sessions/:id/review` 🔒
Add review to a completed session.

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent session! Learned a lot about React hooks."
}
```

### `GET /api/sessions/stats` 🔒
Get dashboard statistics.

**Response (200):**
```json
{
  "totalSessions": 10,
  "completedSessions": 5,
  "pendingSessions": 3,
  "activeSessions": 2,
  "totalSkillsOffered": 4,
  "recentSessions": [...],
  "topMentors": [...],
  "categoryStats": [...]
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

---

🔒 = Requires Authentication  
🛡️ = Requires Admin Role

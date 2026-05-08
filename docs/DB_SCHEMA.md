# Database Schema Documentation

## Overview

SkillSwap uses **MongoDB** with **Mongoose ODM** for data modeling. The database consists of three main collections with well-defined relationships.

## Entity Relationship Diagram

```
┌─────────────────────────┐
│         User            │
├─────────────────────────┤
│ _id: ObjectId (PK)      │
│ name: String             │
│ email: String (unique)   │
│ password: String (hash)  │
│ role: Enum               │
│ avatar: String           │
│ bio: String              │
│ department: String       │
│ year: String             │
│ skillsOffered: [Skill]   │───────┐
│ skillsWanted: [Skill]    │───────┤
│ rating: Number           │       │
│ totalReviews: Number     │       │
│ createdAt: Date          │       │
│ updatedAt: Date          │       │
└───────┬─────────┬────────┘       │
        │         │                │
        │         │                │
        ▼         ▼                ▼
┌───────────────────┐    ┌─────────────────────┐
│     Session       │    │       Skill         │
├───────────────────┤    ├─────────────────────┤
│ _id: ObjectId     │    │ _id: ObjectId (PK)  │
│ mentor: User (FK) │    │ name: String        │
│ learner: User (FK)│    │ category: Enum      │
│ skill: Skill (FK) │───▶│ description: String │
│ status: Enum      │    │ proficiencyLevel    │
│ scheduledDate     │    │ offeredBy: User(FK) │
│ duration: Number  │    │ tags: [String]      │
│ location: String  │    │ isActive: Boolean   │
│ notes: String     │    │ seekers: [User]     │
│ rating: Number    │    │ createdAt: Date     │
│ review: String    │    │ updatedAt: Date     │
│ reviewedBy: User  │    └─────────────────────┘
│ createdAt: Date   │
│ updatedAt: Date   │
└───────────────────┘
```

## Collections

### 1. Users Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Required, max 50 | User's full name |
| `email` | String | Required, unique, validated | Email address |
| `password` | String | Required, min 6, select: false | Bcrypt hashed password |
| `role` | String | Enum: student, mentor, admin | Default: student |
| `avatar` | String | Optional | Profile picture URL |
| `bio` | String | Max 500 | Short biography |
| `department` | String | Optional | Academic department |
| `year` | String | Optional | Academic year |
| `skillsOffered` | [ObjectId] | Ref: Skill | Skills user can teach |
| `skillsWanted` | [ObjectId] | Ref: Skill | Skills user wants to learn |
| `rating` | Number | 0-5 | Average mentor rating |
| `totalReviews` | Number | Min 0 | Total reviews received |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Pre-save Hook:** Password is hashed using bcrypt with salt rounds = 10.

**Instance Methods:**
- `matchPassword(enteredPassword)` — Compares entered password with hash.

---

### 2. Skills Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Required, max 100 | Skill name |
| `category` | String | Required, Enum | technology, design, music, language, academic, sports, other |
| `description` | String | Required, max 1000 | Detailed description |
| `proficiencyLevel` | String | Enum | beginner, intermediate, advanced, expert |
| `offeredBy` | ObjectId | Required, Ref: User | User offering this skill |
| `tags` | [String] | Optional | Searchable tags |
| `isActive` | Boolean | Default: true | Whether skill is active |
| `seekers` | [ObjectId] | Ref: User | Users interested in this skill |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Text Index:** name, description, tags (for full-text search)

---

### 3. Sessions Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `mentor` | ObjectId | Required, Ref: User | Teaching user |
| `learner` | ObjectId | Required, Ref: User | Learning user |
| `skill` | ObjectId | Required, Ref: Skill | Skill being taught |
| `status` | String | Enum | pending, accepted, in-progress, completed, cancelled |
| `scheduledDate` | Date | Required | Session date & time |
| `duration` | Number | Required, 15-240 | Duration in minutes |
| `location` | String | Default: Online | Meeting location |
| `notes` | String | Max 500 | Session notes |
| `rating` | Number | 1-5 | Post-session rating |
| `review` | String | Max 500 | Post-session review |
| `reviewedBy` | ObjectId | Ref: User | User who wrote the review |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

**Compound Indexes:**
- `{ mentor: 1, scheduledDate: 1 }` — For overlap checking
- `{ learner: 1, scheduledDate: 1 }` — For overlap checking

**Status Flow:**
```
pending → accepted → in-progress → completed
   │                                     │
   └──────────── cancelled ──────────────┘
```

## Data Relationships

1. **User → Skill** (One-to-Many): A user can offer multiple skills
2. **User → Session** (One-to-Many): A user can be mentor or learner in multiple sessions
3. **Skill → Session** (One-to-Many): A skill can be taught in multiple sessions
4. **User ← → Skill** (Many-to-Many via seekers): Users can express interest in skills

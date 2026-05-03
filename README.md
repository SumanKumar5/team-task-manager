<div align="center">

# TeamFlow

![TeamFlow Banner](https://img.shields.io/badge/TeamFlow-Task%20Manager-6d56fa?style=for-the-badge&logo=lightning&logoColor=white)

**A modern, full-stack team task management platform with role-based access control**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.7-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.9-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-10.33-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

</div>

---

## Overview

TeamFlow is a production-grade team task management application that enables organizations to create projects, assign tasks, and track progress, all with fine-grained role-based access control at both the application and project level.

Built as a Turborepo monorepo with a Next.js 15 frontend, a Hono REST API backend, and a PostgreSQL database on Neon, sharing Zod schemas across the entire stack for end-to-end type safety.

---

## Features

### Authentication & Authorization

- Secure signup and login with JWT-based session management
- Role selection at registration - **Admin** or **Member**
- Protected routes with automatic redirect on session expiry
- Persistent auth state with Zustand + localStorage

### Project Management

- Create, view, and delete projects
- Real-time progress bar showing task completion percentage
- Project-level role assignment - each project has its own Admins and Members
- Add and remove team members by email address

### Task Management

- Full Kanban board with four columns - **To Do**, **In Progress**, **In Review**, **Done**
- Task detail side panel with inline editing for title, description, status, priority, assignee, and due date
- Priority levels - Low, Medium, High, Urgent, with color-coded badges
- Due date tracking with overdue detection and visual alerts
- Search tasks by name and filter by priority or assignee
- Keyboard shortcut `N` to quickly create a new task or project

### Dashboard

- Live stat cards - total projects, total tasks, overdue tasks, completed tasks
- Tasks by Status with animated progress bars
- Recent Tasks feed with priority badges and relative timestamps
- Time-aware greeting based on the user's local time

### Role-Based Access Control

- **App-level roles** - Admin and Member selected at signup
- **Project-level roles** - Project creators become project Admins; invited users default to Member
- Admins can manage members, delete projects, and delete any task
- Members can create and update tasks but cannot manage the project or remove members
- All RBAC enforced on both the frontend UI and backend API

---

## Tech Stack

### Monorepo

| Tool           | Purpose                                 |
| -------------- | --------------------------------------- |
| **Turborepo**  | Monorepo build system with task caching |
| **pnpm**       | Fast, disk-efficient package manager    |
| **TypeScript** | End-to-end type safety                  |

### Frontend (`apps/web`)

| Tool                  | Purpose                                 |
| --------------------- | --------------------------------------- |
| **Next.js 15**        | React framework with App Router         |
| **Tailwind CSS v3**   | Utility-first styling                   |
| **Zustand**           | Lightweight client state management     |
| **TanStack Query v5** | Server state, caching, and invalidation |
| **React Hook Form**   | Performant form handling                |
| **Zod**               | Schema validation (shared with backend) |
| **Lucide React**      | Icon library                            |
| **Sonner**            | Toast notifications                     |
| **date-fns**          | Date formatting and manipulation        |
| **Axios**             | HTTP client with interceptors           |

### Backend (`apps/api`)

| Tool              | Purpose                                      |
| ----------------- | -------------------------------------------- |
| **Hono**          | Modern, lightweight web framework            |
| **Node.js 22**    | Runtime with native TypeScript support       |
| **Prisma v6**     | Type-safe ORM                                |
| **PostgreSQL 17** | Primary relational database (hosted on Neon) |
| **bcryptjs**      | Password hashing                             |
| **jsonwebtoken**  | JWT creation and verification                |
| **Zod**           | Request validation                           |

### Shared (`packages/shared`)

| Tool    | Purpose                                          |
| ------- | ------------------------------------------------ |
| **Zod** | Single source of truth for all schemas and types |

---

## Project Structure

```
team-task-manager/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   └── (dashboard)/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── store/
│   └── api/
│       ├── src/
│       │   ├── lib/
│       │   ├── middleware/
│       │   └── routes/
│       └── prisma/
│           └── schema.prisma
└── packages/
    └── shared/
        └── src/
            └── schemas/
```

---

## Database Schema

```
User ──────────┬── Session (JWT sessions)
               ├── Project (owner)
               ├── ProjectMember (role per project)
               ├── Task (created by)
               └── Task (assigned to)

Project ───────┬── ProjectMember
               └── Task

Task ──────────┬── Project
               ├── User (assignedTo)
               └── User (createdBy)
```

---

## API Endpoints

### Auth

```
POST   /api/auth/signup       Create account
POST   /api/auth/login        Login
POST   /api/auth/logout       Logout
```

### Projects

```
GET    /api/projects          List user's projects
POST   /api/projects          Create project
GET    /api/projects/:id      Get project with tasks & members
PUT    /api/projects/:id      Update project (Admin only)
DELETE /api/projects/:id      Delete project (Owner only)
POST   /api/projects/:id/members        Add member (Admin only)
DELETE /api/projects/:id/members/:uid   Remove member (Admin only)
```

### Tasks

```
GET    /api/projects/:id/tasks    List tasks for a project
POST   /api/projects/:id/tasks    Create task
PUT    /api/tasks/:id             Update task
DELETE /api/tasks/:id             Delete task
```

### Dashboard

```
GET    /api/dashboard         Aggregated stats for current user
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [Neon](https://neon.tech) PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/SumanKumar5/team-task-manager.git
cd team-task-manager

# Install dependencies
pnpm install

# Approve Prisma build scripts
pnpm approve-builds
```

### Environment Setup

Create `apps/api/.env`:

```env
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Setup

```bash
cd apps/api
pnpm exec prisma db push
pnpm exec prisma generate
```

### Development

```bash
# Run both frontend and backend
pnpm dev

# Or run individually
pnpm --filter web dev     # Frontend on http://localhost:3000
pnpm --filter api dev     # Backend on http://localhost:3001
```

---

## Deployment

The application is deployed on **Railway** with the following services:

- **API** - Node.js service running the Hono backend
- **Web** - Node.js service running the Next.js frontend
- **Database** - PostgreSQL on [Neon](https://neon.tech) (serverless, Singapore region)

### Environment Variables (Production)

**API service:**

```env
DATABASE_URL=<neon-connection-string>
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=<your-frontend-railway-url>
PORT=3001
NODE_ENV=production
```

**Web service:**

```env
NEXT_PUBLIC_API_URL=<your-api-railway-url>
NODE_ENV=production
```

---

<div align="center">
  Built with ❤️ using Next.js, Hono, Prisma, and PostgreSQL
</div>

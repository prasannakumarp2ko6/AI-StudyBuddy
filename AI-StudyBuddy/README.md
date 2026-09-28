# AI StudyBuddy

An AI-powered study assistant. Students upload notes or paste text, and Google Gemini
generates summaries, flashcards, multiple-choice quizzes, and personalized study plans.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [MongoDB Setup](#mongodb-setup)
- [Gemini API Setup](#gemini-api-setup)
- [Environment Variables](#environment-variables)
- [Backend Installation & Running](#backend-installation--running)
- [Frontend Installation & Running](#frontend-installation--running)
- [Demo Flow](#demo-flow)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Admin Setup](#admin-setup)
- [Troubleshooting](#troubleshooting)

## Overview

AI StudyBuddy is a full-stack MERN application (MongoDB, Express, React, Node) with a
dedicated Gemini AI service layer. Students manage study materials in their own private
workspace, and every AI-generated resource (summary, flashcards, quiz, study plan) is
generated dynamically from the material's actual content — nothing is hard-coded.

## Features

- Student registration/login with JWT auth and bcrypt password hashing
- Role-based access control (Student / Admin)
- Upload study material by pasting text or uploading a `.txt`/`.md`/`.csv` file
- AI-generated summaries, flashcards, and multiple-choice quizzes per material
- AI-generated personalized study plans based on subject, exam date, and daily hours
- Student dashboard with stats, recent activity, and quick actions
- Admin panel: view all users, view usage stats, delete users (cascades their data)
- Centralized error handling with consistent JSON response shapes
- Responsive, modern UI with loading/error/empty states and confirmation dialogs

## Technologies

**Frontend:** React 18, React Router 6, Axios, Vite, plain CSS
**Backend:** Node.js, Express, Mongoose/MongoDB, JWT, bcryptjs, Multer, CORS, dotenv
**AI:** Google Gemini via `@google/genai`

## Architecture

```
React (frontend)
   |  axios (JWT attached automatically)
   v
Express REST API
   |
   v
Controllers  -->  Mongoose Models  -->  MongoDB
   |
   v
Gemini Service (backend/src/services/geminiService.js)
   |
   v
Google Gemini API
```

The frontend never calls Gemini directly and never sees the Gemini API key — all AI
calls happen server-side through the Gemini service module.

## Folder Structure

```
AI-StudyBuddy/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/  (auth, material, ai, admin)
│   │   ├── middleware/   (auth, upload, errorHandler)
│   │   ├── models/       (User, Material, Summary, Flashcard, Quiz, StudyPlan)
│   │   ├── routes/       (auth, material, ai, admin)
│   │   ├── services/geminiService.js
│   │   └── utils/        (ApiError, asyncHandler, generateToken)
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/   (Navbar, Sidebar, ProtectedRoute, AdminRoute, etc.)
│   │   ├── pages/        (Landing, Login, Register, Dashboard, Materials, ...)
│   │   ├── services/api.js
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- A MongoDB connection (local install or MongoDB Atlas)
- A Google Gemini API key

## MongoDB Setup

**Option A — Local MongoDB:** install MongoDB Community Server, then run `mongod`. Use
`mongodb://127.0.0.1:27017/ai-studybuddy` as your `MONGO_URI`.

**Option B — MongoDB Atlas (recommended for quick setup):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow your IP (or `0.0.0.0/0` for local testing)
3. Copy the connection string, e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ai-studybuddy`

## Gemini API Setup

1. Go to https://aistudio.google.com/apikey and create an API key
2. Copy it into `backend/.env` as `GEMINI_API_KEY`

## Environment Variables

Backend (`backend/.env`, copy from `backend/.env.example`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-studybuddy
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_ORIGIN=http://localhost:5173
```

Frontend (`frontend/.env`, copy from `frontend/.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Never commit real `.env` files — only `.env.example` is tracked.

## Backend Installation & Running

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your real MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
npm run dev
```

The API runs on `http://localhost:5000` by default. Check `GET /api/health` to confirm
it's up.

## Frontend Installation & Running

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Demo Flow

1. Open the app, register a Student account
2. Log in, land on the dashboard
3. Upload or paste study material
4. Generate a summary, flashcards, and a quiz for that material
5. Take the quiz, see your score and explanations
6. Generate a personalized study plan from the Study Plan page
7. Log out, register/log in as an Admin (select "Admin" at registration for demo purposes)
8. Open the Admin Dashboard to see usage stats and the Manage Users page

## API Endpoints

**Auth**
- `POST /api/auth/register` — `{ name, email, password, role? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — requires auth

**Study Materials**
- `POST /api/material/upload` — multipart file OR `{ title, subject, content }`
- `GET /api/material` — list current user's materials
- `GET /api/material/:id` — material + its summary/flashcards/quiz
- `DELETE /api/material/:id`
- `POST /api/materials/:id/summarize`

**AI**
- `POST /api/ai/flashcards` — `{ materialId, count? }`
- `POST /api/ai/quiz` — `{ materialId, count? }`
- `POST /api/ai/study-plan` — `{ subject, examDate, hoursPerDay, goals?, topics? }`
- `GET /api/ai/study-plan` — list current user's saved plans

**Admin** (Admin role required)
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`

All responses follow `{ success, message, data }` on success or `{ success: false, message }`
on error.

## Authentication

JWT is issued on register/login and stored in `localStorage` on the client. Axios attaches
`Authorization: Bearer <token>` to every request via an interceptor. A `401` response
anywhere clears the stored session and redirects to `/login`. Passwords are hashed with
bcryptjs before storage and are never returned in any API response.

## Admin Setup

For this demo, the registration form lets you pick "Admin" as the account type directly
(there's no separate invite flow). In a production system you would remove that option and
promote users to Admin through a trusted internal process instead.

## Troubleshooting

- **"GEMINI_API_KEY is not configured"** — make sure `backend/.env` has a valid key and you
  restarted the backend after adding it.
- **CORS errors in the browser** — confirm `CLIENT_ORIGIN` in `backend/.env` matches the
  URL the frontend is actually running on.
- **401 errors right after logging in** — check that `JWT_SECRET` didn't change between
  issuing and verifying a token (e.g. after editing `.env`, log in again).
- **"Gemini returned malformed JSON"** — occasionally the model's output doesn't parse;
  just click "Regenerate" — the service already retries parsing with a fallback extractor
  before giving up.
- **MongoDB connection refused** — confirm `mongod` is running locally, or that your Atlas
  IP allowlist includes your current IP.
- **File upload rejected** — only `.txt`, `.md`, and `.csv` files are accepted (5MB max);
  paste text directly for other formats like PDF.

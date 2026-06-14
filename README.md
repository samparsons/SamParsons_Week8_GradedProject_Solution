# DevAnswers - Week 8 Graded Project Solution

Full-stack Q&A platform built for the UT Austin certificate program.
This repository contains a React frontend and an Express + MongoDB backend, with tests for both layers.

## Repository Layout

- `devanswers-frontend/` - React 19 + Vite client (Redux Toolkit, React Router, Bootstrap)
- `devanswers-backend/` - Express 5 API (MongoDB/Mongoose, JWT auth, rate limiting, helmet)
- `reference/` - Reference implementations used during development
- `SamParsons_Week8_GradedProject_Solution/` - Archived solution snapshot

## Tech Stack

- Frontend: React, Redux Toolkit, Vite, Axios, React Router, Bootstrap
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, helmet, cors
- Testing: Vitest, Supertest, Testing Library, MSW

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or hosted)

## Quick Start

### 1. Clone and install dependencies

```bash
git clone git@github.com:samparsons/SamParsons_Week8_GradedProject_Solution.git
cd SamParsons_Week8_GradedProject_Solution

cd devanswers-backend && npm install
cd ../devanswers-frontend && npm install
```

### 2. Configure backend environment

Create `devanswers-backend/.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/devanswers
PORT=3000
JWT_SECRET=replace-with-a-secure-secret
```

### 3. Run the backend

```bash
cd devanswers-backend
npm run dev
```

### 4. Run the frontend

In a second terminal:

```bash
cd devanswers-frontend
npm run dev
```

Frontend defaults to Vite local dev server and calls backend at `http://localhost:3000/api`.

## Useful Scripts

### Backend (`devanswers-backend`)

- `npm run dev` - Start API with nodemon
- `npm start` - Start API with node
- `npm test` - Run backend tests
- `npm run populate` - Populate database script

### Frontend (`devanswers-frontend`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run test` - Run frontend tests
- `npm run lint` - Lint source files

## Testing

```bash
cd devanswers-backend && npm test
cd ../devanswers-frontend && npm test
```

## Notes

- API routes are mounted under `/api`.
- If you change backend port, update frontend API base URL in `devanswers-frontend/src/api/axiosInstance.js`.

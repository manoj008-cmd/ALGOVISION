# AlgoVision

AlgoVision is an interactive learning platform for understanding algorithms through visual execution, complexity analysis, and quiz-based practice. It blends a React + TypeScript frontend with a Node.js + Express backend for authentication, quiz persistence, and AI-assisted tutoring.

The project is structured as a monorepo so the frontend and backend can run together while still keeping the app logic organized.

## Features

- Algorithm visualizer for sorting and searching
  - Quick Sort
  - Merge Sort
  - Selection Sort
  - Insertion Sort
  - Binary Search
  - Linear Search
- Complexity analysis for algorithm performance and recommendation logic
- Quiz system with randomized practice questions and score tracking
- User authentication with JWT-based protected routes
- Backend storage for quiz history and leaderboard data in MongoDB
- AI-style guidance using the Google Gemini API when configured
- Local fallback heuristics so the app remains usable while backend services are offline or not configured

## Tech stack

Frontend
- React 19
- TypeScript
- Vite
- Tailwind-like utility styling patterns used across components

Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT auth via `jsonwebtoken`
- Password hashing with `bcryptjs`
- Google Gemini integration via `@google/genai`

## Repository structure

```text
AlgoVision/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   └── quizController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── QuizResult.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   └── quizRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── components/
├── services/
│   └── apiService.ts
├── App.tsx
├── package.json
├── .env.example
├── quizQuestions.ts
├── types.ts
├── vite.config.ts
├── index.html
├── tsconfig.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection URI
- A valid Google Gemini API key if you want live AI responses

### 1. Install dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy the example environment files and fill in the values you need:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

The frontend `.env` should include:

```env
VITE_API_URL=http://localhost:5000/api
```

The backend `.env` should include:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algovision
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-google-gemini-key
```

### 3. Run the app

From the repo root:

```bash
npm run dev
```

This starts the frontend and backend together using the monorepo scripts.

You can also start the stacks individually:

```bash
npm run dev:frontend
npm run dev:backend
```

## API endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `GET /api/auth/profile`

### Quiz

- `POST /api/quiz/submit`
- `GET /api/quiz/history`
- `GET /api/quiz/leaderboard`

### AI

- `POST /api/ai/chat`
- `POST /api/ai/complexity-analysis`
- `POST /api/ai/algorithm-suggestion`

## Notes

- The frontend now tries real API requests against `VITE_API_URL` and attaches the bearer token automatically when present.
- If the backend is unavailable, the app keeps local fallback behavior so the experience still works during development.
- MongoDB and Gemini must be configured for the full-stack experience to be fully live.
- Quiz results are stored locally and can also be submitted to the backend when a valid JWT exists.

## Production build

```bash
npm run build
```

## License

This project does not currently include a repo-level open-source license file.

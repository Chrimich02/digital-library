# Digital Personal Library

A web application for managing a personal digital book collection. Built as my thesis project at the University of Piraeus (Department of Informatics).

The app lets users upload and read PDF books, take notes and highlights while reading, organize books with categories and tags, and get personalized book recommendations via the Google Books API.

## Tech Stack

**Frontend:** React 19, React Router 7, Zustand, Tailwind CSS, React-PDF

**Backend:** Node.js, Express 5, Sequelize, PostgreSQL

**Other:** JWT authentication, Multer for file uploads, Google Books API

## Main Features

- Upload PDF books (up to 50MB) with cover images
- Built-in PDF reader with text selection
- Highlights (5 colors, supports multi-line), notes, and bookmarks
- Categories and tags for organization
- Automatic reading progress tracking
- Book recommendations based on your library

## Project Structure

```
digital-library/
├── backend/
│   ├── controllers/    # 9 controllers
│   ├── models/         # 7 Sequelize models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, error handling
│   └── uploads/        # PDF and cover storage
│
└── frontend/
    ├── src/
    │   ├── components/ # Reader components, modals
    │   ├── pages/      # 8 pages
    │   ├── services/   # API calls
    │   └── store/      # Zustand auth store
    └── tailwind.config.js
```

## Database

9 tables total: users, books, categories, tags, annotations, reading_progress, user_preferences, plus two junction tables for the many-to-many relationships (book_categories, book_tags).

## Setup

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Google Books API key (optional, for recommendations)

### Installation

1. Clone the repo

```bash
git clone https://github.com/Chrimich02/digital-library.git
cd digital-library
```

2. Create the database

```bash
createdb digital_library
```

3. Set up environment variables

Create `backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PORT=5000

GOOGLE_BOOKS_API_KEY=your_api_key
```

4. Install and run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

The app runs at http://localhost:3000

## API Overview

The backend has 47 endpoints. Main ones:

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register |
| `POST /api/auth/login` | Login |
| `GET /api/books` | List books |
| `POST /api/books` | Upload book |
| `GET /api/books/:id/view` | Get PDF for reader |
| `POST /api/annotations` | Create highlight/note/bookmark |
| `GET /api/recommendations` | Get book suggestions |

Full CRUD for books, categories, tags, annotations, and reading progress.

## Screenshots

![Dashboard](screenshots/dashboard.png)

![Reader](screenshots/reader.png)

![Recommendations](screenshots/recommendations.png)

## Notes

This was built for my thesis, so there are some limitations:

- Only PDF format is supported in the reader
- Files are stored locally (no cloud storage)
- No automated tests


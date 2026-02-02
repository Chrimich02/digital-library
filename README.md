# Digital Personal Library

Web app for managing personal ebook collections. Upload PDFs, read them in the browser, take notes and highlights, organize with categories and tags, get book recommendations.

Built as my thesis project at the University of Piraeus.

![Dashboard](screenshots/dashboard.png)

## Features

- Upload and manage PDF books with metadata and cover images
- Built-in PDF reader with multi-line text highlighting in 5 colors
- Notes and bookmarks on any page, organized by page number
- Categories with custom colors and flexible tagging system
- Automatic reading progress tracking
- Book recommendations based on your library via Google Books API

## Tech Stack

**Frontend:** React 19, React Router 7, Zustand, Tailwind CSS, React-PDF

**Backend:** Node.js, Express 5, Sequelize ORM

**Database:** PostgreSQL

**Auth:** JWT with bcrypt

## Architecture

Three-tier architecture separating presentation, business logic, and data layers:

- **Frontend:** Single-page application with client-side routing and protected routes
- **API:** RESTful design with stateless JWT authentication
- **Database:** Normalized schema with junction tables for many-to-many relationships

## Screenshots

**PDF Reader**

![Reader](screenshots/reader.png)

**Recommendations**

![Recommendations](screenshots/recommendations.png)

## Running Locally

Requires Node.js 18+ and PostgreSQL 14+.

```bash
git clone https://github.com/Chrimich02/digital-library.git
cd digital-library

createdb digital_library

# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

App runs at http://localhost:3000

## Environment Variables

Create `backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

PORT=5000

GOOGLE_BOOKS_API_KEY=your-key
```

## Project Structure

```
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── uploads/
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── services/
        └── store/
```

---

University of Piraeus | Department of Informatics | Thesis 2025

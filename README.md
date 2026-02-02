# Digital Personal Library

A web app for managing your ebook collection. Upload PDFs, read them in the browser, highlight text, take notes, and get book recommendations.

Built this as my thesis project because I was tired of having PDFs scattered across folders and different apps.

![Dashboard](screenshots/dashboard.png)

## What you can do

**Manage your books** — Upload PDFs (up to 50MB) with cover images and metadata. Organize them with categories and tags.

**Read in the browser** — Built-in PDF reader with zoom, page navigation, and three color themes (light, dark, sepia).

**Take notes while reading** — Highlight text in 5 different colors (works across multiple lines), add notes to any page, create bookmarks. Everything is saved and organized by page.

**Track your progress** — The app remembers where you left off. Come back later and continue from the same page.

**Discover new books** — Get personalized recommendations based on your library. Uses Google Books API to find similar books to what you already have.

## Tech stack

**Frontend:** React 19, React Router, Zustand, Tailwind CSS, React-PDF

**Backend:** Node.js, Express 5, Sequelize

**Database:** PostgreSQL

**Auth:** JWT tokens with bcrypt password hashing

I chose this stack because I wanted JavaScript on both ends, and PostgreSQL made sense for the relational data (books belong to categories, have many tags, have many annotations, etc).

## The interesting parts

### Multi-line highlighting

This took a while to figure out. When you select text in a PDF that goes across multiple lines, you can't just save "start position to end position" — each line is a separate text element. 

So I store an array of rectangles, one per line:

```javascript
{
  text: "The selected text...",
  positions: [
    { x: 72, y: 300, width: 450, height: 14 },
    { x: 72, y: 316, width: 380, height: 14 }
  ],
  color: "#ffeb3b"
}
```

Then the reader draws a highlight box for each one.

### Recommendations

The system looks at what categories have the most books in your library, translates them from Greek to English (since my UI is in Greek), and queries Google Books API. There's retry logic with backoff for when the API rate limits you.

## Screenshots

### PDF Reader with annotations
![Reader](screenshots/reader.png)

### Book recommendations
![Recommendations](screenshots/recommendations.png)

## Running locally

Need Node.js 18+ and PostgreSQL.

```bash
git clone https://github.com/Chrimich02/digital-library.git
cd digital-library

createdb digital_library

# Backend
cd backend
cp .env.example .env  # edit with your db credentials
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

Goes to http://localhost:3000

### Environment variables

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

PORT=5000

GOOGLE_BOOKS_API_KEY=your-key  # optional
```

## Project structure

```
├── backend/
│   ├── controllers/    # route handlers
│   ├── models/         # database models (User, Book, Category, Tag, Annotation, etc)
│   ├── routes/         # API endpoints
│   ├── middleware/     # auth, error handling
│   └── uploads/        # where PDFs and covers go
│
└── frontend/
    └── src/
        ├── pages/       # Dashboard, Reader, Categories, Tags, Recommendations...
        ├── components/  # reusable stuff
        └── services/    # API calls
```

## What's missing

- Only PDFs work (no EPUB)
- Files stored locally, not in the cloud
- No tests

---

Thesis project — University of Piraeus, Department of Informatics
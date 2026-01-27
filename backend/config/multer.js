const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Δημιουργία φακέλου uploads αν δεν υπάρχει
const uploadDir = './uploads/books';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Δημιουργία φακέλου για covers
const coversDir = './uploads/covers';
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Storage configuration για βιβλία
const bookStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Δημιουργία unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration για εξώφυλλα
const coverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coversDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter για βιβλία - ΜΟΝΟ PDF!
const bookFileFilter = (req, file, cb) => {
  const isPDF = file.mimetype === 'application/pdf' && 
                path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPDF) {
    return cb(null, true);
  } else {
    cb(new Error('Μόνο αρχεία PDF επιτρέπονται! Only PDF files are allowed.'));
  }
};

// File filter για εικόνες
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

// Upload middleware για βιβλία
const uploadBook = multer({
  storage: bookStorage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024 // 50MB default
  },
  fileFilter: bookFileFilter
});

// Upload middleware για εξώφυλλα
const uploadCover = multer({
  storage: coverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFileFilter
});

// Combined middleware για βιβλία ΚΑΙ εξώφυλλα μαζί
const uploadBookWithCover = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'book') {
        cb(null, uploadDir);
      } else if (file.fieldname === 'cover') {
        cb(null, coversDir);
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      if (file.fieldname === 'book') {
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      } else if (file.fieldname === 'cover') {
        cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
      }
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB για το μεγαλύτερο αρχείο
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'book') {
      bookFileFilter(req, file, cb);
    } else if (file.fieldname === 'cover') {
      imageFileFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

module.exports = {
  uploadBook,
  uploadCover,
  uploadBookWithCover
};
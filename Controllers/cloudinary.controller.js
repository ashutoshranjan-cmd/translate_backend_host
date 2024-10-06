const express = require('express');
const upload = require('../Middleware/multer');
const cloudinary = require('../Utils/Cloudinary');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for handling JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({
      message: 'File uploaded successfully!',
      url: req.file.path, // Cloudinary URL
    });
  } else {
    res.status(400).json({ message: 'Please upload a file.' });
  }
});


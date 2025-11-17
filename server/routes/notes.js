// routes/notes.js
const express = require('express');
const Note = require('../models/notes');  // Correct variable name
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/notes  (FR4.2 – create note)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

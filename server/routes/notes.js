// routes/notes.js
const express = require('express');
const Note = require('../models/notes');
const router = express.Router();

// ---------------------------------------------
//  POST /api/v1/notes  (FR4.2 – create note)
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({
      status: 'success',
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/notes
//  FR4.3: List all notes (Read – collection)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // later you can add .find(query) with filters (FR9) and/or .populate('course')
    const notes = await Note.find();

    res.status(200).json({
      status: 'success',
      results: notes.length,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
//  GET /api/v1/notes/:id
//  FR4.3: Fetch a single note by ID (Read – detail)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    // later, for relationship endpoints, you might do: Note.findById(req.params.id).populate('course')
    const note = await Note.findById(req.params.id);

    // Valid ObjectId, but no note found
    if (!note) {
      return res.status(404).json({
        status: 'fail',
        message: 'Note not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: note,
    });
  } catch (err) {
    // Invalid ObjectId -> CastError -> handled by global error handler in app.js
    next(err);
  }
});

// ---------------------------------------------
// PATCH /api/v1/notes/:id
// FR4.4: Update note by ID
// ---------------------------------------------
router.patch('/:id', async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true, // run schema validators on update
    });

    if (!note) {
      return res.status(404).json({
        status: 'fail',
        message: 'Note not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

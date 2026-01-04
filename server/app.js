// ---------------------------------------------
//  ORIGINAL TEMPLATE IMPORTS
// ---------------------------------------------
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

// ---------------------------------------------
//  ROUTES
// ---------------------------------------------
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const noteRoutes = require('./routes/notes');
const quizRoutes = require('./routes/quizzes');
const quizCreatorRoutes = require('./routes/quizCreators');
const quizParticipationRoutes = require('./routes/quizParticipations');
const courseAttendancesRoutes = require('./routes/courseAttendances');
const teachingAssignmentRoutes = require('./routes/teachingAssignments');
const noteSummariesRoutes = require('./routes/noteSummaries');
const noteAIquizRoutes = require('./routes/noteAIquizzes');
const noteFlashcardsRoutes = require('./routes/noteFlashcards');
const authRoutes = require('./routes/auth');
const courseMaterialRoutes = require('./routes/courseMaterials');
const systemController = require('./controllers/systemController');



// ---------------------------------------------
//  ENV + CONFIG
// ---------------------------------------------
const port = process.env.PORT || 3000;

//Versioned API prefix
const API_PREFIX = '/api/v1';
// ---------------------------------------------
//  APP INIT
// ---------------------------------------------
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.options('*', cors());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------
//  HEALTH CHECK (Required for CI)
// ---------------------------------------------
app.get("/api/v1/health", systemController.healthCheck);

// ---------------------------------------------
//  ROOT TEMPLATE ENDPOINT (Required by template)
// ---------------------------------------------
app.get('/api', systemController.apiRoot);

// ---------------------------------------------
//  USER ROUTES 
// ---------------------------------------------
app.use(API_PREFIX + "/users", userRoutes);
app.use(API_PREFIX + "/courses", courseRoutes);
app.use(API_PREFIX + "/notes", noteRoutes);
app.use(API_PREFIX + "/quizzes", quizRoutes);
app.use(API_PREFIX + "/quizcreators", quizCreatorRoutes);
app.use(API_PREFIX + "/quizparticipations", quizParticipationRoutes);
app.use(API_PREFIX + "/auth", authRoutes);

// Relationship routes under /courses
app.use(API_PREFIX + "/courses", courseAttendancesRoutes);
app.use(API_PREFIX + "/courses", teachingAssignmentRoutes);
app.use(API_PREFIX + "/courses", courseMaterialRoutes);
app.use(API_PREFIX + "/notes", noteSummariesRoutes);
app.use(API_PREFIX + "/notes", noteAIquizRoutes);
app.use(API_PREFIX + "/notes", noteFlashcardsRoutes);



// When these routers exist, mount them like this:
// app.use(API_PREFIX + "/courses", courseRoutes);
// app.use(API_PREFIX + "/tasks", taskRoutes);
// app.use(API_PREFIX + "/sessions", sessionRoutes);

// ---------------------------------------------
//  OPTIONAL: 404 CATCH FOR /api/v1/*
// ---------------------------------------------
app.use('/api/v1/*', function (req, res) {
    res.status(404).json({ message: 'Not Found' });
});

// ---------------------------------------------
//  GLOBAL ERROR HANDLER (FR1.2)
// ---------------------------------------------
app.use(function (err, req, res, next) {
    console.error(err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: "ValidationError",
            message: err.message,
            details: err.errors,
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            error: "CastError",
            message: `Invalid ${err.path}: ${err.value}`,
        });
    }

    if (err.code && err.code === 11000) {
        return res.status(409).json({
            error: "DuplicateKey",
            keyValue: err.keyValue,
        });
    }

    res.status(err.status || 500).json({
        error: "InternalServerError",
        message: err.message || "Unexpected error",
    });
});

// ---------------------------------------------
//  EXPORT FOR server.js
// ---------------------------------------------
module.exports = app;

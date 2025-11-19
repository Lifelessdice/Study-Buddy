// ---------------------------------------------
//  ORIGINAL TEMPLATE IMPORTS
// ---------------------------------------------
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');

// ---------------------------------------------
//  ROUTES
// ---------------------------------------------
var userRoutes = require('./routes/users');   
var courseRoutes = require('./routes/courses');
var noteRoutes = require('./routes/notes');
var quizRoutes = require('./routes/quizzes');
var quizCreatorRoutes = require('./routes/quizCreators');
var quizParticipationRoutes = require('./routes/quizParticipations');
var courseAttendancesRoutes = require('./routes/courseAttendances');
var teachingAssignmentRoutes = require('./routes/teachingAssignments');


// ---------------------------------------------
//  ENV + CONFIG
// ---------------------------------------------
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animalDevelopmentDB';
var port = process.env.PORT || 3000;

//Versioned API prefix
var API_PREFIX = '/api/v1';
// ---------------------------------------------
//  APP INIT
// ---------------------------------------------
var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.options('*', cors());
app.use(cors());

// ---------------------------------------------
//  HEALTH CHECK (Required for CI)
// ---------------------------------------------
app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok" });
});

// ---------------------------------------------
//  ROOT TEMPLATE ENDPOINT (Required by template)
// ---------------------------------------------
app.get('/api', function(req, res) {
    res.json({ 'message': 'Welcome to StudyBuddy API v1' });
});

// ---------------------------------------------
//  USER ROUTES 
// ---------------------------------------------
app.use(API_PREFIX + "/users", userRoutes);
app.use(API_PREFIX + "/courses", courseRoutes);
app.use(API_PREFIX + "/notes", noteRoutes);
app.use(API_PREFIX + "/quizzes", quizRoutes);
app.use(API_PREFIX + "/quizcreators", quizCreatorRoutes);
app.use(API_PREFIX + "/quizparticipations", quizParticipationRoutes);
app.use(API_PREFIX + "/courses", courseAttendancesRoutes);
app.use(API_PREFIX + "/courses", teachingAssignmentRoutes);



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

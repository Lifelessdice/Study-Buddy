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
var userRoutes = require('./routes/users');   // ✅ FIXED

// ---------------------------------------------
//  ENV + CONFIG
// ---------------------------------------------
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animalDevelopmentDB';
var port = process.env.PORT || 3000;

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
//  USER ROUTES (FR1.2)
// ---------------------------------------------
app.use("/api/v1/users", userRoutes);

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

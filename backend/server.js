/**
 * server.js — Entry point for Skylark BI Agent Backend
 *
 * Bootstraps the Express application, applies global middleware,
 * mounts route handlers, and starts the HTTP server.
 */

"use strict";

// Load environment variables FIRST before any other imports
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

// ─────────────────────────────────────────────────────────────────────────────
// App initialization
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Security middleware
// ─────────────────────────────────────────────────────────────────────────────

// Helmet sets secure HTTP headers
app.use(helmet());

// CORS — restrict origins to those defined in config
app.use(
  cors({
    origin: config.cors.origins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Global rate limiter — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});
app.use(limiter);

// ─────────────────────────────────────────────────────────────────────────────
// Body parsing
// ─────────────────────────────────────────────────────────────────────────────

// Parse incoming JSON payloads (max 2mb)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// Logging middleware (before routes so every request is captured)
// ─────────────────────────────────────────────────────────────────────────────

app.use(requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use("/", routes);

// ─────────────────────────────────────────────────────────────────────────────
// 404 fallback for unmatched routes
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler (must be last)
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 Skylark BI Agent backend running on port ${PORT}`);
  logger.info(`   Environment : ${config.server.env}`);
  logger.info(`   CORS origins: ${config.cors.origins.join(", ")}`);
});

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught synchronous exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;

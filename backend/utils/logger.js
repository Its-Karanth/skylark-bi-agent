/**
 * utils/logger.js — Winston-based structured logger
 *
 * Provides a consistent logging interface across the entire application.
 * - In development: pretty-prints colorized output to the console.
 * - In production: logs structured JSON for easy parsing by log aggregators.
 */

"use strict";

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors, json } = format;

// Detect environment early (config may not be loaded yet when logger initializes)
const isDev = (process.env.NODE_ENV || "development") === "development";
const logLevel = process.env.LOG_LEVEL || "info";

// ─────────────────────────────────────────────────────────────────────────────
// Custom dev format: [TIMESTAMP] LEVEL  message  {meta}
// ─────────────────────────────────────────────────────────────────────────────

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let base = `${timestamp} [${level.toUpperCase().padEnd(5)}]  ${stack || message}`;
  const metaStr = Object.keys(meta).length
    ? "  " + JSON.stringify(meta, null, 0)
    : "";
  return base + metaStr;
});

// ─────────────────────────────────────────────────────────────────────────────
// Build logger
// ─────────────────────────────────────────────────────────────────────────────

const logger = createLogger({
  level: logLevel,
  // Capture full stack traces for Error objects
  format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss" })),
  transports: [
    new transports.Console({
      format: isDev
        ? combine(colorize({ all: true }), devFormat)
        : combine(json()),
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

module.exports = logger;

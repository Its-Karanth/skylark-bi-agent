/**
 * middleware/requestLogger.js — HTTP request/response logger
 *
 * Logs every incoming request with method, URL, status code, and
 * response time. Uses the Winston logger for consistency.
 */

"use strict";

const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

/**
 * Express middleware that:
 *  1. Assigns a unique request ID to each request (for tracing).
 *  2. Logs the incoming request.
 *  3. Intercepts the response to log status code + duration.
 */
module.exports = function requestLogger(req, res, next) {
  // Attach a unique request ID for distributed tracing
  req.requestId = uuidv4().split("-")[0]; // Short 8-char ID

  const start = Date.now();
  const { method, originalUrl } = req;

  // Log incoming request
  logger.info(`[${req.requestId}] --> ${method} ${originalUrl}`);

  // Intercept when the response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    const logLevel =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      `[${req.requestId}] <-- ${method} ${originalUrl} ${statusCode} (${duration}ms)`
    );
  });

  next();
};

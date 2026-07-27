/**
 * middleware/errorHandler.js — Global Express error handling middleware
 *
 * Catches any error passed to next(err) from route handlers or other
 * middleware. Returns a consistent JSON error envelope to the client
 * and logs the full error server-side.
 *
 * Must be registered LAST in the Express middleware chain.
 */

"use strict";

const logger = require("../utils/logger");
const config = require("../config");

/**
 * Express error handler (4-parameter signature required by Express).
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const requestId = req.requestId || "unknown";

  // Log the full error stack on the server
  logger.error(`[${requestId}] Unhandled error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });

  // Determine the HTTP status code
  const statusCode = err.statusCode || err.status || 500;

  // Build client-facing error response
  const response = {
    success: false,
    requestId,
    error: err.message || "An unexpected error occurred.",
    // Only include stack trace in development mode
    ...(config.server.isDev && { stack: err.stack }),
  };

  // Surface monday.com / Axios error details if available
  if (err.isAxiosError) {
    response.upstream = {
      status: err.response?.status,
      data: err.response?.data,
    };
  }

  res.status(statusCode).json(response);
};

/**
 * middleware/validateRequest.js — Request validation middleware factory
 *
 * Provides reusable validation functions that can be used as Express
 * middleware to validate request bodies, query params, etc.
 * Returns 400 with descriptive errors rather than letting bad data
 * propagate into the business logic layer.
 */

"use strict";

/**
 * Validates that the specified fields exist in req.body.
 * Usage: router.post('/chat', validateBody(['message']), chatController)
 *
 * @param {string[]} requiredFields - Array of field names to require
 * @returns {import('express').RequestHandler}
 */
function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      const val = req.body[field];
      if (val === undefined || val === null || val === "") {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required field(s) in request body: ${missing.join(", ")}`,
        required: requiredFields,
      });
    }

    next();
  };
}

/**
 * Validates that the chat message is a non-empty string within length limits.
 *
 * @param {number} [maxLength=2000]
 * @returns {import('express').RequestHandler}
 */
function validateChatMessage(maxLength = 2000) {
  return (req, res, next) => {
    const { message } = req.body;

    if (typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: 'Field "message" must be a string.',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "message" cannot be empty.',
      });
    }

    if (message.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Field "message" exceeds maximum length of ${maxLength} characters.`,
      });
    }

    // Sanitize the message (store trimmed version back on body)
    req.body.message = message.trim();
    next();
  };
}

module.exports = { validateBody, validateChatMessage };

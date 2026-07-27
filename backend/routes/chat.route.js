/**
 * routes/chat.route.js — AI Chat API route
 *
 * Applies validation middleware before the controller so that
 * the controller can safely assume `req.body.message` is a valid string.
 */

"use strict";

const { Router } = require("express");
const { chat } = require("../controllers/chat.controller");
const { validateBody, validateChatMessage } = require("../middleware/validateRequest");

const router = Router();

// POST /api/chat
// Body: { message: string, history?: Array, refreshData?: boolean }
router.post(
  "/",
  validateBody(["message"]),       // Ensure message field exists
  validateChatMessage(2000),       // Validate string type + length
  chat
);

module.exports = router;

/**
 * controllers/chat.controller.js — AI Chat endpoint handler
 *
 * Accepts a user message (and optional conversation history),
 * fetches fresh monday.com data, builds an AI-enriched system prompt,
 * and returns the OpenAI assistant's reply.
 *
 * Request body:
 *  {
 *    "message": "What are our top deals this quarter?",
 *    "history": [                          // optional — prior turns
 *      { "role": "user",      "content": "..." },
 *      { "role": "assistant", "content": "..." }
 *    ],
 *    "refreshData": true                   // optional — force fresh fetch
 *  }
 */

"use strict";

const openaiService = require("../services/openai.service");
const logger = require("../utils/logger");

/**
 * POST /api/chat
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function chat(req, res, next) {
  try {
    const { message, history = [], refreshData = false } = req.body;
    const requestId = req.requestId || "unknown";

    logger.info(
      `[ChatController] [${requestId}] Chat request — message: "${message.substring(0, 80)}..." ` +
        `history turns: ${history.length}`
    );

    // ── Validate history format ────────────────────────────────────────────
    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        error: '"history" must be an array of {role, content} objects.',
      });
    }

    const invalidTurn = history.find(
      (t) =>
        !t.role ||
        !t.content ||
        !["user", "assistant", "system"].includes(t.role)
    );
    if (invalidTurn) {
      return res.status(400).json({
        success: false,
        error: 'Each item in "history" must have a valid "role" and "content".',
      });
    }

    // ── Call OpenAI service ────────────────────────────────────────────────
    const { reply, usage, dataQuality } = await openaiService.chat({
      message,
      history,
      refreshData,
    });

    // ── Build response ─────────────────────────────────────────────────────
    const response = {
      success: true,
      requestId,
      reply,
      // Return metadata so the frontend can display data freshness
      metadata: {
        model: process.env.OPENAI_MODEL || "gpt-4o",
        tokensUsed: usage.total_tokens || null,
        promptTokens: usage.prompt_tokens || null,
        completionTokens: usage.completion_tokens || null,
        dataContext: dataQuality,
        timestamp: new Date().toISOString(),
      },
    };

    logger.info(
      `[ChatController] [${requestId}] Reply sent — tokens: ${usage.total_tokens || "?"}`
    );
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };

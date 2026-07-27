/**
 * services/openai.service.js — OpenAI chat completion service
 *
 * Encapsulates all interactions with the OpenAI Chat Completions API.
 *  - Builds the full message array (system + history + current message)
 *  - Injects live business data into the system prompt
 *  - Returns the AI's reply and token usage metadata
 *
 * The system prompt is rebuilt on every request so the AI always has
 * fresh data — no stale context from a previous session.
 */

"use strict";

const openai = require("../config/openai");
const config = require("../config");
const logger = require("../utils/logger");
const { buildSystemPrompt } = require("../utils/systemPrompt");
const biService = require("./bi.service");

// ─────────────────────────────────────────────────────────────────────────────
// Chat completion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a chat message to OpenAI and returns the assistant's reply.
 *
 * @param {Object} params
 * @param {string}   params.message        - The user's current message
 * @param {Object[]} params.history         - Prior conversation turns [{role, content}]
 * @param {boolean}  [params.refreshData]  - Force a fresh fetch of monday.com data
 * @returns {Promise<{reply: string, usage: Object, dataQuality: Object}>}
 */
async function chat({ message, history = [], refreshData = false }) {
  logger.info(`[OpenAIService] Processing chat message (${message.length} chars)...`);

  // ── 1. Fetch live business data ───────────────────────────────────────────
  //
  // We fetch fresh data on every request to ensure AI answers are current.
  // For high-traffic production use, consider a short-lived cache (e.g., 60s TTL).
  const { deals, workOrders } = await biService.getMergedData();
  const today = new Date().toISOString().split("T")[0];

  // ── 2. Build the system prompt with live data context ────────────────────
  const systemContent = buildSystemPrompt({ deals, workOrders, today });

  // ── 3. Assemble the message array ─────────────────────────────────────────
  //
  // Format: [system, ...history, current user message]
  // History allows multi-turn conversations. Client is responsible for passing
  // prior turns as [{role: 'user'|'assistant', content: '...'}]
  const messages = [
    { role: "system", content: systemContent },
    // Limit history to last 10 turns to stay within token budget
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  // ── 4. Call OpenAI Chat Completions API ──────────────────────────────────
  logger.info(
    `[OpenAIService] Sending to OpenAI — model: ${config.openai.model}, messages: ${messages.length}`
  );

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    max_tokens: config.openai.maxTokens,
    temperature: config.openai.temperature,
    // Ask the model to use markdown formatting (reinforces system prompt)
    response_format: { type: "text" },
  });

  const reply = completion.choices[0]?.message?.content || "";
  const usage = completion.usage || {};

  logger.info(
    `[OpenAIService] Response received — tokens used: ${usage.total_tokens || "unknown"}`
  );

  // ── 5. Compute data quality summary for the response metadata ────────────
  const dataQuality = {
    dealsWithIssues: deals.filter((d) => d._dataIssues?.length > 0).length,
    workOrdersWithIssues: workOrders.filter((w) => w._dataIssues?.length > 0).length,
    totalDeals: deals.length,
    totalWorkOrders: workOrders.length,
  };

  return { reply, usage, dataQuality };
}

module.exports = { chat };

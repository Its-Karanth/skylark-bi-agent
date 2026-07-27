/**
 * config/openai.js — OpenAI client singleton
 *
 * Creates and exports a single shared OpenAI client instance.
 * Centralizing this prevents multiple clients from being spawned
 * and makes it easy to swap in different configurations for testing.
 */

"use strict";

const { OpenAI } = require("openai");
const config = require("./index");
const logger = require("../utils/logger");

// Initialize the OpenAI SDK with the API key and optional baseURL (for Groq)
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  ...(config.openai.baseURL && { baseURL: config.openai.baseURL }),
});

logger.info(
  `[OpenAI] Client initialized — model: ${config.openai.model}, ` +
    `maxTokens: ${config.openai.maxTokens}, temperature: ${config.openai.temperature}`
);

module.exports = openai;

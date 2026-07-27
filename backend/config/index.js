/**
 * config/index.js — Centralized application configuration
 *
 * Reads environment variables, validates required ones, and
 * exports a single frozen config object used throughout the app.
 * This prevents scattered process.env calls across the codebase.
 */

"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: assert that a required env var is set
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[Config] Missing required environment variable: ${key}. ` +
        `Please add it to your .env file (see .env.example).`
    );
  }
  return value.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the config object
// ─────────────────────────────────────────────────────────────────────────────

const config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development",
    isDev: (process.env.NODE_ENV || "development") === "development",
  },

  openai: {
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || requireEnv("GROQ_API_KEY"),
    baseURL: (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY?.startsWith("gsk_"))
      ? "https://api.groq.com/openai/v1"
      : process.env.OPENAI_BASE_URL,
    model: process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.3-70b-versatile",
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1500", 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.3"),
  },

  monday: {
    apiKey: requireEnv("MONDAY_API_KEY"),
    apiVersion: process.env.MONDAY_API_VERSION || "2024-01",
    apiUrl: "https://api.monday.com/v2",
    dealsBoardId: requireEnv("MONDAY_DEALS_BOARD_ID"),
    workordersBoardId: requireEnv("MONDAY_WORKORDERS_BOARD_ID"),
  },

  cors: {
    // Support comma-separated list of origins or default to localhost
    origins: (
      process.env.CORS_ORIGINS ||
      "http://localhost:5173,http://localhost:3000"
    )
      .split(",")
      .map((o) => o.trim()),
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

// Freeze to prevent accidental mutations at runtime
module.exports = Object.freeze(config);

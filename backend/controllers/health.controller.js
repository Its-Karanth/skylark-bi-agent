/**
 * controllers/health.controller.js — Health check endpoint handler
 *
 * Returns server status, version info, and uptime.
 * Used by monitoring tools, load balancers, and the frontend to
 * confirm the backend is alive before making data requests.
 */

"use strict";

const config = require("../config");
const logger = require("../utils/logger");

/**
 * GET /health
 * Returns a 200 JSON response with server health information.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getHealth(req, res) {
  const uptimeSeconds = process.uptime();

  const health = {
    success: true,
    status: "ok",
    service: "Skylark BI Agent Backend",
    version: "1.0.0",
    environment: config.server.env,
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      human: formatUptime(uptimeSeconds),
    },
    memory: {
      heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
    },
  };

  logger.debug("[HealthController] Health check passed.");
  res.status(200).json(health);
}

/**
 * Formats uptime in seconds to a human-readable string (e.g., "2h 5m 30s").
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

module.exports = { getHealth };

/**
 * routes/index.js — Root router
 *
 * Mounts all feature routers under their respective path prefixes.
 * This is the single entry point imported by server.js.
 *
 * Route map:
 *   GET  /health
 *   GET  /api/deals
 *   GET  /api/workorders
 *   GET  /api/merged
 *   POST /api/chat
 */

"use strict";

const { Router } = require("express");

const healthRoute = require("./health.route");
const dealsRoute = require("./deals.route");
const workordersRoute = require("./workorders.route");
const mergedRoute = require("./merged.route");
const chatRoute = require("./chat.route");

const router = Router();

// ── Health check ────────────────────────────────────────────────────────────
router.use("/health", healthRoute);

// ── Business data endpoints ─────────────────────────────────────────────────
router.use("/api/deals", dealsRoute);
router.use("/api/workorders", workordersRoute);
router.use("/api/merged", mergedRoute);

// ── AI chat endpoint ────────────────────────────────────────────────────────
router.use("/api/chat", chatRoute);

module.exports = router;
/**
 * routes/health.route.js — Health check route
 */

"use strict";

const { Router } = require("express");
const { getHealth } = require("../controllers/health.controller");

const router = Router();

// GET /health
router.get("/", getHealth);

module.exports = router;

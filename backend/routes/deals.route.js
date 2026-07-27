/**
 * routes/deals.route.js — Deals API route
 */

"use strict";

const { Router } = require("express");
const { getDeals } = require("../controllers/deals.controller");

const router = Router();

// GET /api/deals
// Returns normalized deals from monday.com with summary statistics
router.get("/", getDeals);

module.exports = router;

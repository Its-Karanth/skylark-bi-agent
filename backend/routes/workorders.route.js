/**
 * routes/workorders.route.js — Work Orders API route
 */

"use strict";

const { Router } = require("express");
const { getWorkOrders } = require("../controllers/workorders.controller");

const router = Router();

// GET /api/workorders
// Returns normalized work orders with operational metrics
router.get("/", getWorkOrders);

module.exports = router;

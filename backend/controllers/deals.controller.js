/**
 * controllers/deals.controller.js — Deals endpoint handler
 *
 * Fetches, normalizes, and returns all deals from monday.com.
 * Includes computed summary statistics and data quality metadata
 * so the frontend can display insights alongside raw records.
 */

"use strict";

const biService = require("../services/bi.service");
const logger = require("../utils/logger");

/**
 * GET /api/deals
 *
 * Returns normalized deals with:
 *  - Summary statistics (total, won/lost/open, revenue)
 *  - Data quality report (records with missing/suspicious fields)
 *  - Full normalized deals array
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getDeals(req, res, next) {
  try {
    logger.info("[DealsController] GET /api/deals request received.");

    const deals = await biService.getDeals();

    // ── Compute summary statistics ─────────────────────────────────────────

    const wonDeals = deals.filter((d) => d.status === "Won");
    const lostDeals = deals.filter((d) => d.status === "Lost");
    const openDeals = deals.filter((d) => !["Won", "Lost"].includes(d.status));

    const totalRevenue = wonDeals
      .filter((d) => d.deal_value !== null)
      .reduce((sum, d) => sum + d.deal_value, 0);

    const dealsWithValue = deals.filter((d) => d.deal_value !== null);
    const avgDealValue =
      dealsWithValue.length > 0
        ? dealsWithValue.reduce((s, d) => s + d.deal_value, 0) / dealsWithValue.length
        : 0;

    // Win rate (among deals that have resolved — Won or Lost)
    const resolved = wonDeals.length + lostDeals.length;
    const winRate = resolved > 0 ? ((wonDeals.length / resolved) * 100).toFixed(1) : "0.0";

    // Status distribution
    const statusDistribution = deals.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    // Industry distribution
    const industryDistribution = deals.reduce((acc, d) => {
      if (d.industry && d.industry !== "Unknown") {
        acc[d.industry] = (acc[d.industry] || 0) + 1;
      }
      return acc;
    }, {});

    // ── Data quality report ────────────────────────────────────────────────

    const dealsWithIssues = deals.filter((d) => d._dataIssues.length > 0);

    const response = {
      success: true,
      fetchedAt: new Date().toISOString(),
      summary: {
        total: deals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        open: openDeals.length,
        winRate: `${winRate}%`,
        totalWonRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageDealValue: parseFloat(avgDealValue.toFixed(2)),
        statusDistribution,
        industryDistribution,
      },
      dataQuality: {
        recordsWithIssues: dealsWithIssues.length,
        totalRecords: deals.length,
        issueRate: `${((dealsWithIssues.length / (deals.length || 1)) * 100).toFixed(1)}%`,
        issues: dealsWithIssues.map((d) => ({
          id: d.id,
          name: d.name,
          issues: d._dataIssues,
        })),
      },
      deals,
    };

    logger.info(
      `[DealsController] Returning ${deals.length} deals (${dealsWithIssues.length} with issues).`
    );
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDeals };

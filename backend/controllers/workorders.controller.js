/**
 * controllers/workorders.controller.js — Work Orders endpoint handler
 *
 * Fetches, normalizes, and returns all work orders from monday.com.
 * Computes operational metrics: overdue orders, priority breakdown,
 * efficiency ratio (actual vs estimated hours), and data quality.
 */

"use strict";

const biService = require("../services/bi.service");
const logger = require("../utils/logger");

/**
 * GET /api/workorders
 *
 * Returns normalized work orders with:
 *  - Operational summary (overdue, by status, by priority)
 *  - Efficiency metrics (hours estimated vs actual)
 *  - Data quality report
 *  - Full normalized work orders array
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getWorkOrders(req, res, next) {
  try {
    logger.info("[WorkOrdersController] GET /api/workorders request received.");

    const workOrders = await biService.getWorkOrders();
    const today = new Date().toISOString().split("T")[0];

    // ── Operational metrics ────────────────────────────────────────────────

    const done = workOrders.filter((w) => w.status === "Done");
    const inProgress = workOrders.filter((w) => w.status === "In Progress");
    const blocked = workOrders.filter((w) => w.status === "Blocked");

    // Overdue = has a due_date in the past AND is not Done/Cancelled
    const overdue = workOrders.filter(
      (w) =>
        w.due_date &&
        w.due_date < today &&
        !["Done", "Cancelled"].includes(w.status)
    );

    // Priority breakdown
    const priorityDistribution = workOrders.reduce((acc, w) => {
      const p = w.priority || "Unknown";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const statusDistribution = workOrders.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {});

    // ── Efficiency metrics ─────────────────────────────────────────────────

    const woWithHours = workOrders.filter(
      (w) => w.estimated_hours !== null && w.actual_hours !== null
    );
    const totalEstimated = woWithHours.reduce(
      (s, w) => s + w.estimated_hours,
      0
    );
    const totalActual = woWithHours.reduce((s, w) => s + w.actual_hours, 0);
    const efficiencyRatio =
      totalEstimated > 0
        ? ((totalActual / totalEstimated) * 100).toFixed(1)
        : null;

    // Assignee workload
    const assigneeWorkload = workOrders.reduce((acc, w) => {
      if (w.assigned_to && w.assigned_to !== "Unknown") {
        if (!acc[w.assigned_to]) {
          acc[w.assigned_to] = { total: 0, inProgress: 0, done: 0, overdue: 0 };
        }
        acc[w.assigned_to].total++;
        if (w.status === "In Progress") acc[w.assigned_to].inProgress++;
        if (w.status === "Done") acc[w.assigned_to].done++;
        if (overdue.some((o) => o.id === w.id)) acc[w.assigned_to].overdue++;
      }
      return acc;
    }, {});

    // ── Data quality ───────────────────────────────────────────────────────

    const woWithIssues = workOrders.filter((w) => w._dataIssues.length > 0);

    const response = {
      success: true,
      fetchedAt: new Date().toISOString(),
      summary: {
        total: workOrders.length,
        done: done.length,
        inProgress: inProgress.length,
        blocked: blocked.length,
        overdue: overdue.length,
        criticalOverdue: overdue.filter((w) => w.priority === "Critical").length,
        statusDistribution,
        priorityDistribution,
      },
      efficiency: {
        totalEstimatedHours: parseFloat(totalEstimated.toFixed(2)),
        totalActualHours: parseFloat(totalActual.toFixed(2)),
        efficiencyRatio: efficiencyRatio ? `${efficiencyRatio}%` : "N/A",
        note:
          efficiencyRatio && parseFloat(efficiencyRatio) > 100
            ? "Team is running over estimated hours — review capacity planning."
            : null,
        assigneeWorkload,
      },
      dataQuality: {
        recordsWithIssues: woWithIssues.length,
        totalRecords: workOrders.length,
        issueRate: `${((woWithIssues.length / (workOrders.length || 1)) * 100).toFixed(1)}%`,
        issues: woWithIssues.map((w) => ({
          id: w.id,
          name: w.name,
          issues: w._dataIssues,
        })),
      },
      workOrders,
    };

    logger.info(
      `[WorkOrdersController] Returning ${workOrders.length} work orders (${overdue.length} overdue).`
    );
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = { getWorkOrders };

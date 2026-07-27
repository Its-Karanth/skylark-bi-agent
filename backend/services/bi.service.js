/**
 * services/bi.service.js — Business Intelligence data layer
 *
 * Responsible for:
 *  1. Transforming raw monday.com items into clean, normalized records.
 *  2. Detecting and annotating data quality issues on each record.
 *  3. Merging deals with their associated work orders.
 *  4. Providing high-level computed metrics for the AI context.
 *
 * All normalization rules live in utils/dataCleaner.js and constants/index.js
 * so this service stays focused on orchestration.
 */

"use strict";

const mondayService = require("./monday.service");
const {
  cleanText,
  normalizeStatus,
  normalizeDate,
  cleanNumber,
  extractColumnValue,
  detectDataQualityIssues,
  DEAL_STATUS_NORMALIZATION,
  WORKORDER_STATUS_NORMALIZATION,
  PRIORITY_NORMALIZATION,
} = require("../utils/dataCleaner");
const {
  DEALS_COLUMN_MAP,
  WORKORDERS_COLUMN_MAP,
} = require("../constants");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────────────────────────────────────
// Column value index builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a lookup map from a monday.com item's column_values array.
 * Keys are column IDs; values are the column_value objects.
 *
 * @param {Object[]} columnValues - item.column_values from GraphQL
 * @returns {Map<string, Object>}
 */
function buildColumnIndex(columnValues = []) {
  return new Map(columnValues.map((col) => [col.id, col]));
}

/**
 * Gets the text value of a column by ID from the index.
 *
 * @param {Map} index
 * @param {string} columnId
 * @returns {string}
 */
function getColumnText(index, columnId) {
  const col = index.get(columnId);
  return col ? extractColumnValue(col) : "Unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// Deal normalizer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transforms a single raw monday.com item from the Deals board
 * into a clean, normalized deal object.
 *
 * @param {Object} rawItem - Raw item from monday.com GraphQL response
 * @returns {Object} Normalized deal
 */
function normalizeDeal(rawItem) {
  const colMap = DEALS_COLUMN_MAP;
  const idx = buildColumnIndex(rawItem.column_values);

  const rawStatus = getColumnText(idx, colMap.status);
  const rawStage = getColumnText(idx, colMap.stage);
  const rawPriority = getColumnText(idx, "color_mm5nd207");
  const rawDealValue = getColumnText(idx, colMap.deal_value);
  const rawCloseDate = getColumnText(idx, colMap.close_date);
  const rawOwner = getColumnText(idx, colMap.owner);
  const rawCompany = getColumnText(idx, colMap.company);
  const rawIndustry = getColumnText(idx, colMap.industry);
  const rawNotes = getColumnText(idx, colMap.notes);

  // Skip malformed/header rows BEFORE any parsing
  if (
    rawStatus === "Deal Status" ||
    rawStage === "Deal Stage" ||
    rawCloseDate === "Tentative Close Date" ||
    rawIndustry === "Sector/service"
  ) {
    logger.warn(
      `[BIService] Skipping malformed deal row: ${rawItem.name} (${rawItem.id})`
    );

    return {
      id: rawItem.id,
      _invalid: true,
      _dataIssues: [],
    };
  }

  const deal = {
    id: rawItem.id,
    name: cleanText(rawItem.name, "name"),
    status: normalizeStatus(rawStatus, DEAL_STATUS_NORMALIZATION),
    stage: cleanText(rawStage, "stage"),
    priority: cleanText(rawPriority, "priority"),
    deal_value: cleanNumber(rawDealValue),
    close_date: normalizeDate(rawCloseDate),
    owner: cleanText(rawOwner, "owner"),
    company: cleanText(rawCompany, "company"),
    industry: cleanText(rawIndustry, "industry"),
    notes: cleanText(rawNotes, "notes"),
    created_at: normalizeDate(rawItem.created_at),
    updated_at: normalizeDate(rawItem.updated_at),
    _raw_status: rawStatus,
    _dataIssues: [],
    _invalid: false,
  };

  deal._dataIssues = detectDataQualityIssues(deal, [
    "name",
    "status",
    "deal_value",
    "close_date",
    "owner",
  ]);

  return deal;
}

// ─────────────────────────────────────────────────────────────────────────────
// Work Order normalizer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transforms a single raw monday.com item from the Work Orders board
 * into a clean, normalized work order object.
 *
 * @param {Object} rawItem
 * @returns {Object} Normalized work order
 */
function normalizeWorkOrder(rawItem) {
  const colMap = WORKORDERS_COLUMN_MAP;
  const idx = buildColumnIndex(rawItem.column_values);

  const rawStatus = getColumnText(idx, colMap.status);
  const rawPriority = getColumnText(idx, colMap.priority);

  const workOrder = {
    id: rawItem.id,
    name: cleanText(rawItem.name, "name"),
    deal_reference: cleanText(getColumnText(idx, colMap.deal_reference), "deal_reference"),
    status: normalizeStatus(rawStatus, WORKORDER_STATUS_NORMALIZATION),
    priority: normalizeStatus(rawPriority, PRIORITY_NORMALIZATION),
    assigned_to: cleanText(getColumnText(idx, colMap.assigned_to), "assigned_to"),
    start_date: normalizeDate(getColumnText(idx, colMap.start_date)),
    due_date: normalizeDate(getColumnText(idx, colMap.due_date)),
    completion_date: normalizeDate(getColumnText(idx, colMap.completion_date)),
    estimated_hours: cleanNumber(getColumnText(idx, colMap.estimated_hours)),
    actual_hours: cleanNumber(getColumnText(idx, colMap.actual_hours)),
    notes: cleanText(getColumnText(idx, colMap.notes), "notes"),
    created_at: normalizeDate(rawItem.created_at),
    updated_at: normalizeDate(rawItem.updated_at),
    _raw_status: rawStatus,
    _dataIssues: [],
  };

  workOrder._dataIssues = detectDataQualityIssues(workOrder, [
    "name",
    "status",
    "assigned_to",
    "due_date",
  ]);

  return workOrder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public service methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches and normalizes all deals from monday.com.
 *
 * @returns {Promise<Object[]>} Array of normalized deal objects
 */
async function getDeals() {
  logger.info("[BIService] Fetching and normalizing deals...");
  const rawItems = await mondayService.fetchDeals();

  console.log("\n========== FIRST RAW DEAL ==========\n");
  console.log(JSON.stringify(rawItems[0], null, 2));
  console.log("\n====================================\n");

  const deals = rawItems
    .map(normalizeDeal)
    .filter((deal) => !deal._invalid);

  const issueCount = deals.filter((d) => d._dataIssues.length > 0).length;
  logger.info(
    `[BIService] Deals — normalized: ${deals.length}, with issues: ${issueCount}`
  );

  return deals;
}

/**
 * Fetches and normalizes all work orders from monday.com.
 *
 * @returns {Promise<Object[]>} Array of normalized work order objects
 */
async function getWorkOrders() {
  logger.info("[BIService] Fetching and normalizing work orders...");
  const rawItems = await mondayService.fetchWorkOrders();
  const workOrders = rawItems.map(normalizeWorkOrder);

  const issueCount = workOrders.filter((w) => w._dataIssues.length > 0).length;
  logger.info(
    `[BIService] Work Orders — normalized: ${workOrders.length}, with issues: ${issueCount}`
  );

  return workOrders;
}

/**
 * Fetches both datasets in parallel and merges them.
 * Deals get an `workOrders` array attached showing linked work orders.
 * Work orders get a `deal` object attached when a match is found.
 *
 * Matching logic: workOrder.deal_reference (case-insensitive) === deal.name
 *
 * @returns {Promise<{deals: Object[], workOrders: Object[]}>}
 */
async function getMergedData() {
  logger.info("[BIService] Fetching both boards in parallel for merged view...");

  // Fetch both boards concurrently
  const [deals, workOrders] = await Promise.all([
    getDeals(),
    getWorkOrders(),
  ]);

  // Build a quick lookup map: deal name (lower) → deal object
  const dealsByName = new Map(
    deals.map((d) => [d.name.toLowerCase(), d])
  );

  // Attach related work orders to each deal
  const dealsMap = new Map(deals.map((d) => [d.id, { ...d, workOrders: [] }]));

  workOrders.forEach((wo) => {
    const matchedDeal = dealsByName.get(wo.deal_reference?.toLowerCase());
    if (matchedDeal) {
      // Attach deal reference to work order
      wo.deal = {
        id: matchedDeal.id,
        name: matchedDeal.name,
        status: matchedDeal.status,
      };
      // Attach work order to deal
      const dealEntry = dealsMap.get(matchedDeal.id);
      if (dealEntry) dealEntry.workOrders.push(wo);
    }
  });

  const mergedDeals = Array.from(dealsMap.values());
  logger.info("[BIService] Merge complete.");

  return { deals: mergedDeals, workOrders };
}

module.exports = { getDeals, getWorkOrders, getMergedData };

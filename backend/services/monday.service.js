/**
 * services/monday.service.js — monday.com GraphQL API integration
 *
 * Handles all communication with the monday.com API:
 *  - Executes GraphQL queries via axios
 *  - Implements automatic cursor-based pagination
 *  - Provides raw item fetching for both boards
 *
 * Raw data is returned here WITHOUT cleaning — cleaning happens
 * in bi.service.js so concerns stay separated.
 */

"use strict";

const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const {
  buildBoardItemsQuery,
  buildBoardMetaQuery,
} = require("../utils/graphqlQueries");

// ─────────────────────────────────────────────────────────────────────────────
// HTTP client for monday.com
// ─────────────────────────────────────────────────────────────────────────────

/** Shared Axios instance pre-configured with monday.com auth headers. */
const mondayClient = axios.create({
  baseURL: config.monday.apiUrl,
  headers: {
    "Content-Type": "application/json",
    Authorization: config.monday.apiKey,
    "API-Version": config.monday.apiVersion,
  },
  timeout: 30000, // 30s timeout
});

// ─────────────────────────────────────────────────────────────────────────────
// Core GraphQL executor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Executes a raw GraphQL query against the monday.com API.
 *
 * @param {string} query - GraphQL query string
 * @returns {Promise<Object>} The `data` field from the GraphQL response
 * @throws {Error} On network errors or GraphQL-level errors
 */
async function executeQuery(query) {
  try {
    const response = await mondayClient.post("", { query });
    const { data, errors } = response.data;

    // GraphQL errors are returned in the `errors` array, not as HTTP errors
    if (errors && errors.length > 0) {
      const messages = errors.map((e) => e.message).join("; ");
      const err = new Error(`monday.com GraphQL error: ${messages}`);
      err.statusCode = 502;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.isAxiosError) {
      logger.error(
        `[MondayService] HTTP error: ${error.response?.status} ${error.message}`
      );
      const err = new Error(
        `Failed to reach monday.com API: ${error.message}`
      );
      err.statusCode = 502;
      throw err;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches ALL items from a board using cursor-based pagination.
 * Keeps fetching pages until the API returns no next cursor.
 *
 * @param {string} boardId - monday.com board ID
 * @param {number} [pageSize=100] - Items per page (max 500)
 * @returns {Promise<Object[]>} Flat array of all raw item objects
 */
async function fetchAllBoardItems(boardId, pageSize = 100) {
  const allItems = [];
  let cursor = null;
  let page = 1;

  logger.info(`[MondayService] Fetching all items from board ${boardId}...`);

  do {
    const query = buildBoardItemsQuery(boardId, pageSize, cursor);
    const data = await executeQuery(query);

    const board = data?.boards?.[0];
    if (!board) {
      logger.warn(`[MondayService] Board ${boardId} returned no data.`);
      break;
    }

    const { items, cursor: nextCursor } = board.items_page;
    allItems.push(...items);

    logger.info(
      `[MondayService] Board ${boardId} — page ${page}: fetched ${items.length} items (total so far: ${allItems.length})`
    );

    // Update cursor for next iteration; null means we've reached the end
    cursor = nextCursor || null;
    page++;

    // Safety valve: never fetch more than 50 pages (5000 items at default page size)
    if (page > 50) {
      logger.warn(
        `[MondayService] Board ${boardId} hit page limit (50). Some items may be omitted.`
      );
      break;
    }
  } while (cursor);

  logger.info(
    `[MondayService] Board ${boardId} — done. Total items: ${allItems.length}`
  );
  return allItems;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all raw deal items from the Deals board.
 * @returns {Promise<Object[]>}
 */
async function fetchDeals() {
  const meta = await fetchBoardMeta(config.monday.dealsBoardId);

  console.log("\n========== DEALS BOARD COLUMNS ==========\n");
  console.log(JSON.stringify(meta.columns, null, 2));
  console.log("\n=========================================\n");

  return fetchAllBoardItems(config.monday.dealsBoardId);
}

/**
 * Fetches all raw work order items from the Work Orders board.
 * @returns {Promise<Object[]>}
 */
async function fetchWorkOrders() {
  const meta = await fetchBoardMeta(config.monday.workordersBoardId);

  console.log("\n========== WORK ORDERS COLUMNS ==========\n");
  console.log(JSON.stringify(meta.columns, null, 2));
  console.log("\n=========================================\n");

  return fetchAllBoardItems(config.monday.workordersBoardId);
}

/**
 * Fetches column metadata for a board (useful for debugging schema changes).
 * @param {string} boardId
 * @returns {Promise<Object>}
 */
async function fetchBoardMeta(boardId) {
  const query = buildBoardMetaQuery(boardId);
  const data = await executeQuery(query);
  return data?.boards?.[0] || null;
}

module.exports = { fetchDeals, fetchWorkOrders, fetchBoardMeta };

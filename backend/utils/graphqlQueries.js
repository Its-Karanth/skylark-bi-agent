/**
 * utils/graphqlQueries.js — monday.com GraphQL query definitions
 *
 * All GraphQL queries are centralized here so they are easy to
 * update when the board schema changes. Each query fetches the
 * raw column values for all items in a board.
 *
 * monday.com GraphQL docs: https://developer.monday.com/api-reference/docs
 */

"use strict";

/**
 * Builds a GraphQL query to fetch all items from a board.
 * Uses cursor-based pagination: pass `cursor` for subsequent pages.
 *
 * @param {string} boardId - The monday.com board ID
 * @param {number} [limit=100] - Items per page (max 500)
 * @param {string|null} [cursor=null] - Pagination cursor from previous response
 * @returns {string} GraphQL query string
 */
function buildBoardItemsQuery(boardId, limit = 100, cursor = null) {
  // Determine whether to use cursor-based pagination or initial fetch
  const paginationArgs = cursor
    ? `limit: ${limit}, cursor: "${cursor}"`
    : `limit: ${limit}`;

  return `
    query {
      boards(ids: [${boardId}]) {
        id
        name
        items_page(${paginationArgs}) {
          cursor
          items {
            id
            name
            created_at
            updated_at
            state
            column_values {
              id
              text
              value
              type
              column {
                title
                settings_str
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Builds a query to fetch board metadata (column definitions).
 * Useful for dynamically discovering column IDs and types.
 *
 * @param {string} boardId
 * @returns {string} GraphQL query string
 */
function buildBoardMetaQuery(boardId) {
  return `
    query {
      boards(ids: [${boardId}]) {
        id
        name
        description
        columns {
          id
          title
          type
          settings_str
        }
      }
    }
  `;
}

/**
 * Builds a query to fetch a single item by ID.
 *
 * @param {string} itemId
 * @returns {string} GraphQL query string
 */
function buildSingleItemQuery(itemId) {
  return `
    query {
      items(ids: [${itemId}]) {
        id
        name
        created_at
        updated_at
        board {
          id
          name
        }
        column_values {
          id
          text
          value
          type
          column {
            title
          }
        }
      }
    }
  `;
}

module.exports = {
  buildBoardItemsQuery,
  buildBoardMetaQuery,
  buildSingleItemQuery,
};

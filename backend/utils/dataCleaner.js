/**
 * utils/dataCleaner.js — Data normalization and cleaning utilities
 *
 * Provides pure functions for:
 *  - Normalizing dates into ISO 8601
 *  - Standardizing status/priority text
 *  - Handling missing / null / empty values
 *  - Extracting structured values from monday.com column payloads
 *  - Detecting and reporting data quality issues
 */

"use strict";

const {
  DEAL_STATUS_NORMALIZATION,
  WORKORDER_STATUS_NORMALIZATION,
  PRIORITY_NORMALIZATION,
  MISSING_TEXT,
  MISSING_NUMBER,
  MISSING_DATE,
} = require("../constants");
const logger = require("./logger");

// ─────────────────────────────────────────────────────────────────────────────
// Text utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely trims and returns a string value.
 * Returns MISSING_TEXT sentinel when the value is null/undefined/empty.
 *
 * @param {*} value
 * @param {string} [fieldName] - Used in warnings
 * @returns {string}
 */
function cleanText(value, fieldName = "field") {
  if (value === null || value === undefined) return MISSING_TEXT;
  const trimmed = String(value).trim();
  if (trimmed === "" || trimmed === "-" || trimmed.toLowerCase() === "null") {
    return MISSING_TEXT;
  }
  // Capitalize first letter of each word for consistency
  return trimmed;
}

/**
 * Normalizes a status string to a canonical label using the provided map.
 * Falls back to the original (title-cased) string if no mapping exists.
 *
 * @param {string} raw - Raw status value
 * @param {Object} normalizationMap
 * @returns {string}
 */
function normalizeStatus(raw, normalizationMap) {
  if (!raw || raw === MISSING_TEXT) return MISSING_TEXT;
  const key = raw.toString().toLowerCase().trim();
  return normalizationMap[key] || toTitleCase(raw.trim());
}

/**
 * Converts a string to Title Case.
 * @param {string} str
 * @returns {string}
 */
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Number utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a numeric value safely, returning null for missing/invalid values.
 *
 * @param {*} value
 * @returns {number|null}
 */
function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return MISSING_NUMBER;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? MISSING_NUMBER : parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a date string to ISO 8601 format (YYYY-MM-DD).
 * Accepts monday.com JSON date values like `{"date":"2024-01-15","time":null}`.
 *
 * @param {string|object|null} value
 * @returns {string|null} ISO date string or null
 */
function normalizeDate(value) {
  if (!value || value === MISSING_TEXT) return MISSING_DATE;

  let dateStr = value;

  // monday.com date columns return JSON strings: {"date":"2024-01-15"}
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      dateStr = parsed.date || parsed.changed_at || value;
    } catch {
      // Not JSON — treat as raw date string
      dateStr = value;
    }
  } else if (typeof value === "object" && value.date) {
    dateStr = value.date;
  }

  if (!dateStr) return MISSING_DATE;

  // Try to parse to a Date object
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    logger.warn(`[dataCleaner] Could not parse date: "${dateStr}"`);
    return MISSING_DATE;
  }

  // Return YYYY-MM-DD
  return date.toISOString().split("T")[0];
}

/**
 * Computes the age in days between a date string and today.
 * Returns null if the date is invalid.
 *
 * @param {string|null} isoDate
 * @returns {number|null}
 */
function dateDiffInDays(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  const now = new Date();
  const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  return isNaN(diff) ? null : diff;
}

// ─────────────────────────────────────────────────────────────────────────────
// monday.com column value extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts a usable value from a monday.com column_value object.
 * monday.com returns columns as:
 *   { id, text, value (JSON string), type, column: { title } }
 *
 * @param {Object} col - A single entry from item.column_values
 * @returns {string} The cleaned text representation
 */
function extractColumnValue(col) {
  if (!col) return MISSING_TEXT;

  // `text` is already the human-readable representation from monday.com
  const textVal = col.text || "";
  if (textVal && textVal.trim() !== "") return textVal.trim();

  // Fall back to parsing the raw JSON `value` field
  if (col.value) {
    try {
      const parsed = JSON.parse(col.value);
      // Person column: { "personsAndTeams": [{ "name": "..." }] }
      if (parsed.personsAndTeams && parsed.personsAndTeams.length > 0) {
        return parsed.personsAndTeams.map((p) => p.name).join(", ");
      }
      // Status column: { "label": "..." }
      if (parsed.label) return parsed.label;
      // Date column: { "date": "YYYY-MM-DD" }
      if (parsed.date) return parsed.date;
      // Number columns
      if (parsed.number !== undefined) return String(parsed.number);
      // Generic fallback
      if (typeof parsed === "string") return parsed;
    } catch {
      return col.value; // Return raw value if JSON parsing fails
    }
  }

  return MISSING_TEXT;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data quality reporter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans a normalized record and returns a list of data quality issues found.
 *
 * @param {Object} record - A normalized deal or work order object
 * @param {string[]} criticalFields - Fields that must be present
 * @returns {string[]} Array of human-readable issue descriptions
 */
function detectDataQualityIssues(record, criticalFields = []) {
  const issues = [];

  for (const field of criticalFields) {
    const val = record[field];
    if (val === null || val === undefined || val === MISSING_TEXT) {
      issues.push(`Missing value for critical field: "${field}"`);
    }
  }

  // Check for dates that look suspiciously old or in the future
  const dateFields = ["close_date", "due_date", "start_date", "completion_date"];
  for (const field of dateFields) {
    if (record[field]) {
      const ageInDays = dateDiffInDays(record[field]);
      if (ageInDays !== null && ageInDays < -365) {
        issues.push(`Field "${field}" is more than 1 year in the future`);
      }
      if (ageInDays !== null && ageInDays > 365 * 5) {
        issues.push(`Field "${field}" is more than 5 years in the past — may be stale`);
      }
    }
  }

  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  cleanText,
  normalizeStatus,
  normalizeDate,
  cleanNumber,
  dateDiffInDays,
  extractColumnValue,
  detectDataQualityIssues,
  toTitleCase,
  DEAL_STATUS_NORMALIZATION,
  WORKORDER_STATUS_NORMALIZATION,
  PRIORITY_NORMALIZATION,
};

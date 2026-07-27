/**
 * constants/index.js — Application-wide constants
 *
 * Centralizes monday.com field names, status maps, and
 * other domain constants so they never get scattered across files.
 * Update these whenever the board schema changes.
 */

"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// monday.com column IDs → human-readable keys
//
// These must match the column IDs in your actual monday.com boards.
// Go to Board → column menu → "Copy column ID" to find them.
// ─────────────────────────────────────────────────────────────────────────────

const DEALS_COLUMN_MAP = {
  name: "name",

  // This comes from your imported CSV
  status: "text_mm5n4ke4",

  // Masked Deal value
  deal_value: "text_mm5ngjn2",

  // Tentative Close Date
  close_date: "text_mm5nmw7m",

  // Owner Code
  owner: "text_mm5nacsw",

  // Client Code
  company: "text_mm5ndmxv",

  // Sector / Service
  industry: "text_mm5nest",

  // Deal Stage
  stage: "text_mm5nnhgm",

  notes: "",

  // Created Date
  created_at: "text_mm5ndbbj",

  last_updated: ""
};

const WORKORDERS_COLUMN_MAP = {
  name: "name",

  // Customer reference
  deal_reference: "text_mm5nn3qb",

  // Execution status from imported data
  status: "text_mm5naehp",

  // Priority
  priority: "dropdown_mm5ngfnh",

  // Assigned engineer / owner
  assigned_to: "multiple_person_mm5nh0cg",

  // Project dates
  start_date: "text_mm5na1m4",
  due_date: "text_mm5nt8vr",

  // No completion date column in your board
  completion_date: "",

  // Estimated effort
  estimated_hours: "numeric_mm5n5mhy",

  // No actual hours column
  actual_hours: "",

  // Notes
  notes: "text_mm5nt3w2",

  created_at: "",
  last_updated: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// Status normalization maps
// Map any variant text returned by monday.com to a canonical status label.
// ─────────────────────────────────────────────────────────────────────────────

const DEAL_STATUS_NORMALIZATION = {
  lead: "Lead",
  new: "Lead",
  prospect: "Lead",
  "in progress": "In Progress",
  proposal: "Proposal Sent",
  "proposal sent": "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  closed: "Won",
  "closed won": "Won",
  lost: "Lost",
  "closed lost": "Lost",
  "on hold": "On Hold",
  paused: "On Hold",
};

const WORKORDER_STATUS_NORMALIZATION = {
  new: "New",
  open: "New",
  "in progress": "In Progress",
  active: "In Progress",
  working: "In Progress",
  review: "In Review",
  "in review": "In Review",
  done: "Done",
  complete: "Done",
  completed: "Done",
  closed: "Done",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  blocked: "Blocked",
  "on hold": "On Hold",
};

const PRIORITY_NORMALIZATION = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  med: "Medium",
  normal: "Medium",
  low: "Low",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sentinel values for missing / unknown data
// ─────────────────────────────────────────────────────────────────────────────

const MISSING_TEXT = "Unknown";
const MISSING_NUMBER = null;
const MISSING_DATE = null;

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  DEALS_COLUMN_MAP,
  WORKORDERS_COLUMN_MAP,
  DEAL_STATUS_NORMALIZATION,
  WORKORDER_STATUS_NORMALIZATION,
  PRIORITY_NORMALIZATION,
  MISSING_TEXT,
  MISSING_NUMBER,
  MISSING_DATE,
};

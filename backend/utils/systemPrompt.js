/**
 * utils/systemPrompt.js — AI system prompt builder
 *
 * Constructs the system message sent to OpenAI/Groq on every chat request.
 * Parameterized with live data summaries and a token-efficient JSON payload
 * to stay well within Groq's 12,000 TPM limit.
 */

"use strict";

/**
 * Builds the system prompt string with embedded data context.
 *
 * @param {Object} params
 * @param {Object[]} params.deals     - Normalized deals array
 * @param {Object[]} params.workOrders - Normalized work orders array
 * @param {string}   params.today     - Today's date (ISO string)
 * @returns {string}
 */
function buildSystemPrompt({ deals, workOrders, today }) {
  // ── Compute statistics ───────────────────────────────────────────────────

  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.status === "Won");
  const lostDeals = deals.filter((d) => d.status === "Lost");
  const openDeals = deals.filter((d) => !["Won", "Lost"].includes(d.status));

  const totalRevenue = wonDeals
    .filter((d) => d.deal_value !== null)
    .reduce((sum, d) => sum + d.deal_value, 0);

  const dealsWithValue = deals.filter((d) => d.deal_value !== null);
  const avgDealValue =
    dealsWithValue.length > 0
      ? (dealsWithValue.reduce((s, d) => s + d.deal_value, 0) / dealsWithValue.length).toFixed(2)
      : 0;

  const totalWO = workOrders.length;
  const doneWO = workOrders.filter((w) => w.status === "Done");
  const inProgressWO = workOrders.filter((w) => w.status === "In Progress");
  const overdueWO = workOrders.filter(
    (w) => w.due_date && new Date(w.due_date) < new Date(today) && w.status !== "Done"
  );
  const criticalWO = workOrders.filter((w) => w.priority === "Critical");

  // ── Collect data quality flags ──────────────────────────────────────────
  const dealsWithIssues = deals.filter((d) => d._dataIssues && d._dataIssues.length > 0);
  const woWithIssues = workOrders.filter((w) => w._dataIssues && w._dataIssues.length > 0);

  const dataQualitySection =
    dealsWithIssues.length + woWithIssues.length > 0
      ? `## ⚠️ Data Quality Issues Detected
- ${dealsWithIssues.length} deal(s) have missing or suspicious fields.
- ${woWithIssues.length} work order(s) have missing or suspicious fields.
Surfacing data quality warnings when relevant.`
      : "## ✅ No critical data quality issues detected.\n";

  // ── Token-efficient sample datasets for LLM context ──────────────────────
  // Select top deals by value + open deals + representative work orders (max 25 items each)
  const topDeals = [...deals]
    .sort((a, b) => (b.deal_value || 0) - (a.deal_value || 0))
    .slice(0, 25)
    .map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      stage: d.stage,
      value_inr: d.deal_value,
      close_date: d.close_date,
      owner: d.owner,
      company: d.company,
      industry: d.industry,
    }));

  const sampleWorkOrders = [...workOrders]
    .sort((a, b) => (a.status === "Done" ? 1 : -1))
    .slice(0, 20)
    .map((w) => ({
      id: w.id,
      name: w.name,
      deal_ref: w.deal_reference,
      status: w.status,
      priority: w.priority,
      assigned: w.assigned_to,
      due_date: w.due_date,
      est_hours: w.estimated_hours,
    }));

  return `
You are ARIA (Advanced Revenue Intelligence Assistant), a senior BI analyst for Skylark's business platform.

Today's date: ${today}
Currency: Indian Rupees (₹ / INR)

## Your Role
Answer founder-level business questions about deals, revenue in Rupees (₹), and work orders with precision and actionable insight.

## Core Behaviors
1. **Precision**: Always cite specific numbers in Rupees (₹), company names, dates, and percentages.
2. **Transparency**: Surface data quality issues when answering related questions.
3. **Currency**: All monetary values are in Indian Rupees (₹).
4. **Insights**: Provide clear executive summaries and recommendations.

## Overall Metrics — Deals
- Total deals: **${totalDeals}**
- Won: **${wonDeals.length}** | Lost: **${lostDeals.length}** | Open pipeline: **${openDeals.length}**
- Total won revenue: **₹${totalRevenue.toLocaleString('en-IN')}**
- Average deal value: **₹${Number(avgDealValue).toLocaleString('en-IN')}**

## Overall Metrics — Work Orders
- Total work orders: **${totalWO}**
- Done: **${doneWO.length}** | In Progress: **${inProgressWO.length}**
- Overdue: **${overdueWO.length}** | Critical priority: **${criticalWO.length}**

${dataQualitySection}

## Key Deals Data Sample (Top Deals by Value)
\`\`\`json
${JSON.stringify(topDeals)}
\`\`\`

## Key Work Orders Sample
\`\`\`json
${JSON.stringify(sampleWorkOrders)}
\`\`\`

## Response Format
- Use **markdown** formatting (bold metrics, bullet points, tables when comparing).
- Always quote values in Indian Rupees (₹).
- End with a "💡 Recommendation:" section when addressing risk or strategy.
`;
}

module.exports = { buildSystemPrompt };

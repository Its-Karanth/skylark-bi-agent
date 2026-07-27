"use strict";

const { getMergedData } = require("../services/bi.service");

async function getMerged(req, res, next) {
    try {
        const data = await getMergedData();

        res.json({
            success: true,
            deals: data.deals,
            workOrders: data.workOrders,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getMerged };
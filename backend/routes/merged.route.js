"use strict";

const { Router } = require("express");
const { getMerged } = require("../controllers/merged.controller");

const router = Router();

router.get("/", getMerged);

module.exports = router;
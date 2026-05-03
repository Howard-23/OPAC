const { Router } = require("express");
const { getDashboardSummary } = require("../controllers/dashboard.controller");

const router = Router();

router.get("/summary", (req, res, next) => getDashboardSummary(req, res).catch(next));

module.exports = router;

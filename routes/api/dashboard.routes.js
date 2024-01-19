const express = require("express");
const router = express.Router({ mergeParams: true });

const dashboardController = require("../../controllers/dashboard.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/getDashboardData",
  useTryCatch(dashboardController.getDashboardData)
);
module.exports = router;

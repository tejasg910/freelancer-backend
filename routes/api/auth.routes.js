const express = require("express");
const { useTryCatch } = require("../../services/utility.service");
const { authMiddleware } = require("../../middleware/auth");
const {
  getCompanyByIdController,
} = require("../../controllers/users.controllers");
const router = express.Router({ mergeParams: true });

router.get(
  "/check-login",
  authMiddleware,
  useTryCatch(getCompanyByIdController)
),
  router.get("/logout", authMiddleware, useTryCatch(getCompanyByIdController)),
  (module.exports = router);

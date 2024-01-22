const express = require("express");
const router = express.Router({ mergeParams: true });

const notificationController = require("../../controllers/notification.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/getProjectPostedNotification",
  useTryCatch(notificationController.getProjectPostedNotifications)
);
router.post(
  "/getResourcePostedNotification",
  useTryCatch(notificationController.getResourcesPostedNotifications)
);
router.post(
  "/getAllNotifications",
  useTryCatch(notificationController.getAllNotifications)
);

module.exports = router;

const express = require("express");
const applicationController = require("../../controllers/application.controller");
const { useTryCatch } = require("../../services/utility.service");

const router = express.Router({ mergeParams: true });

router.post(
  "/getApplicationsByProjectId",

  useTryCatch(applicationController.getApplicationsByProjectId)
);

router.post(
  "/getApplicationsByFreelancerId",

  useTryCatch(applicationController.getApplicationsByFreelancerId)
);
router.post(
  "/getAllReceivedApplications",
  useTryCatch(applicationController.getAllRecievedApplications)
);

router.delete(
  "/deleteApplication",
  useTryCatch(applicationController.deleteApplication)
);
module.exports = router;

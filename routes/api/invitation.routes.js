const express = require("express");
const router = express.Router({ mergeParams: true });

const invitationControllers = require("../../controllers/invitation.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/sendInvitionToResource",
  useTryCatch(invitationControllers.sendInvitionToResource)
);
router.post(
  "/getAllReceivedInvitations",
  useTryCatch(invitationControllers.getReceivedInvitations)
);
router.post(
  "/getAllSentInvitations",
  useTryCatch(invitationControllers.getSentInvitations)
);
module.exports = router;

const express = require("express");
const router = express.Router({ mergeParams: true });
const shortListController = require("../../controllers/shortlist.controller");

const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/addToShortList",
  useTryCatch(shortListController.shortListResource)
);
router.post(
  "/sendInvitationFromShortlist",
  useTryCatch(shortListController.sendInviationFromShortList)
);
router.post(
  "/sendInvitationToAllResourceFromShortlist",
  useTryCatch(shortListController.sendInviationToAllResourcesFromShortList)
);
router.post(
  "/getAllShortlistedResourcesOfCompany",
  useTryCatch(shortListController.getAllShortlistedUsersOfComapny)
);
router.delete(
  "/removeFromShortlist",
  useTryCatch(shortListController.removeFromShortList)
);
router.delete(
  "/removeAllFromShortlist",
  useTryCatch(shortListController.removeAllFromShortList)
);
module.exports = router;

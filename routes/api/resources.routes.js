const express = require("express");
const router = express.Router({ mergeParams: true });
const { upload } = require("../../utils/multer");

const addResourcesController = require("../../controllers/resources.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/addResources",
  upload.array("files"),
  useTryCatch(addResourcesController.addResources)
);

module.exports = router;

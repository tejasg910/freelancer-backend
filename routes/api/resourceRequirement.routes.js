const express = require("express");
const router = express.Router({ mergeParams: true });
const { upload } = require("../../utils/multer");

const resourceRequirement = require("../../controllers/resourceRequirement.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post(
  "/postResourceRequirement",
  useTryCatch(resourceRequirement.postResourceRequirement)
);

module.exports = router;

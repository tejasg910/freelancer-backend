const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  Pdf_to_Detail_Json,
  getLiveUpdate,
} = require("../../controllers/pdfFileService.controller");

router.post("/", Pdf_to_Detail_Json);
router.get("/liveUpdate", getLiveUpdate);

module.exports = router;

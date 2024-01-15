const express = require('express');
const router = express.Router({ mergeParams: true });
const { Pdf_to_Detail_Json } = require('../../controllers/pdfFileService.controller')

router.post('/',Pdf_to_Detail_Json)

module.exports = router;

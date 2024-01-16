const { Category, User } = require("../models");
const {
  FileService,
  createUserFromPdfService,
} = require("../services/pdfFileProcess.service");
const { uploadFile } = require("../utils/awsUpload");

const Pdf_to_Detail_Json = async (req, res) => {
  const files = req.files;
  const { companyId } = req.body;

  const response = await createUserFromPdfService(files, companyId);

  return res.status(response.status).json({
    ...response,
  });
};

module.exports = {
  Pdf_to_Detail_Json,
};

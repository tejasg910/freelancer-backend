const { Category, User } = require("../models");
const {
  FileService,
  createUserFromPdfService,
  getLiveUpdateService,
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
const getLiveUpdate = async (req, res) => {
  const response = await getLiveUpdateService();

  return res.status(response.status).json({
    ...response,
  });
};
module.exports = {
  Pdf_to_Detail_Json,
  getLiveUpdate,
};

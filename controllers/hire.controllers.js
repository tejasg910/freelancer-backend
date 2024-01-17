const { Application } = require("../models");
const { queryConditions } = require("../services/utility.service");
const {
  hireAndRejectService,
  hireRequestService,
  getAllHireRequestsService,
  agreeRejectHireService,
  applyProjectService,
  getAllSentHireRequestsService,
  getAllIncommingHireRequestsService,
} = require("../services/hire.service");

const applyProject = async (req, res) => {
  const {
    projectId,
    receiverId,
    userId,
    description,
    bid,
    duration,
    coverLetter,
    attachmentLinks,
  } = req.body;

  const response = await applyProjectService({
    projectId,
    userId,
    receiverId,
    description,
    bid,
    duration,
    coverLetter,
    attachmentLinks,
  });

  res.status(response.status).json({
    ...response,
  });
};

const getAllAppliedProjects = async (req, res) => {
  const { page = 1, size = 10 } = req.query;
  const conditions = queryConditions(
    req.body,
    Object.keys(Application.schema.obj)
  );

  const response = await getAllAppliedProjectsService({
    page,
    size,
    conditions,
  });
  res.status(response.status).json({
    ...response,
  });
};

const hireApplicant = async (req, res) => {
  const { applicationId, clientId } = req.body;

  const { message, freelancerId, projectId, notificationId } =
    await hireAndRejectService({
      applicationId,
      applicationStatus: "hired",
      clientId,
    });

  res.status(200).json({
    message,
    freelancerId,
    clientId,
    projectId,
    notificationId,
  });
};

const rejectApplicant = async (req, res) => {
  const { applicationId, clientId } = req.body;

  const { message, freelancerId, projectId, notificationId } =
    await hireAndRejectService({
      applicationId,
      applicationStatus: "rejected",
      clientId,
    });

  res.status(200).json({
    message,
    freelancerId,
    clientId,
    projectId,
    notificationId,
  });
};

const hireRequest = async (req, res) => {
  const {
    projectId,
    freelancerId,
    clientId,
    // duration,
    // hourlyRate,
    // description,
  } = req.body;

  const response = await hireRequestService({
    projectId,
    freelancerId,
    clientId,
    // duration,
    // hourlyRate,
    // description,
  });

  res.status(response.status).json({
    ...response,
  });

  // res.status(200).json({
  //   message: "Hire Request Sent",
  //   hireRequest: result.hireRequest,
  //   projectId: result.projectId,
  //   freelancerId: result.freelancerId,
  //   clientId: result.clientId,
  //   notificationId: result.notificationId,
  // });
};

const getAllHireRequests = async (req, res) => {
  const { freelancerId } = req.body;

  const hireRequests = await getAllHireRequestsService({ freelancerId });

  res.status(200).json({
    message: "All hireRequests",
    hireRequests,
  });
};

const getAllSentHireRequests = async (req, res) => {
  const { clientId } = req.body;
  const { page, size } = req.query;

  const response = await getAllSentHireRequestsService(clientId, page, size);

  res.status(200).json({
    ...response,
  });
};
const getAllIncomingHireRequests = async (req, res) => {
  const { clientId } = req.body;
  const { page, size } = req.query;

  const response = await getAllIncommingHireRequestsService(
    clientId,
    page,
    size
  );

  res.status(200).json({
    ...response,
  });
};

const agreeHireRequest = async (req, res) => {
  const { hireRequestId } = req.body;

  const response = await agreeRejectHireService({
    hireRequestId,
    hireRequestStatus: "agreed",
  });
  console.log(response);
  res.status(response.status).json({
    ...response,
  });
};

const rejectHireRequest = async (req, res) => {
  const { hireRequestId } = req.body;

  const { message, freelancerId, projectId, notificationId } =
    await agreeRejectHireService({
      hireRequestId,
      hireRequestStatus: "rejected",
    });

  res.status(200).json({
    message,
    freelancerId,
    projectId,
    notificationId,
    hireRequestId,
  });
};

module.exports = {
  applyProject,
  getAllAppliedProjects,
  hireApplicant,
  rejectApplicant,
  hireRequest,
  getAllHireRequests,
  agreeHireRequest,
  rejectHireRequest,
  getAllSentHireRequests,
  getAllIncomingHireRequests,
};

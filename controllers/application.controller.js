const { Project } = require("../models");
const {
  getApplicationsByProjectIdService,
  getApplicationsByFreelancerIdService,
  deleteApplicationService,
  getAllRecivedApplicationsService,
} = require("../services/applications.service");
const { queryConditions } = require("../services/utility.service");

const getApplicationsByProjectId = async (req, res) => {
  const { page = 1, size = 10 } = req.query;
  const {
    projectId,
    minBid = 0,
    // maxBid = 900000000,
    minRating = 0,
    maxRating = 5,
    sortedBy = "mostReviews",
  } = req.body;
  //   const conditions = queryConditions(req.body, Object.keys(Project.schema.obj));
  const filters = {
    projectId,
    active: true,
    bid: { $gte: minBid },
  };

  const response = await getApplicationsByProjectIdService({
    filters,
    sortedBy,
  });

  res.status(response.status).json({
    ...response,
  });
};

const getApplicationsByFreelancerId = async (req, res) => {
  const { freelancerId, bidType = "totalBids" } = req.body;
  const { page = 1, size = 10 } = req.query;
  const response = await getApplicationsByFreelancerIdService({
    freelancerId,
    bidType,
    page,
    size,
  });

  res.status(response.status).json({
    ...response,
  });
};

const getAllRecievedApplications = async (req, res) => {
  const { receiverId } = req.body;
  const { page = 1, size = 10 } = req.query;
  const response = await getAllRecivedApplicationsService({
    receiverId,
    page,
    size,
  });

  res.status(response.status).json({
    ...response,
  });
};

const deleteApplication = async (req, res) => {
  const { applicationId, freelancerId, projectId } = req.body;
  const response = await deleteApplicationService({
    applicationId,
    freelancerId,
    projectId,
  });

  res.status(response.status).json({
    ...response,
  });
};
module.exports = {
  getApplicationsByProjectId,
  getApplicationsByFreelancerId,
  deleteApplication,
  getAllRecievedApplications,
};

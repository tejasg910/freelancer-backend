const {
  sendInvitationToResourceService,
  getAllReceivedInvitations,
  getAllReceivedInvitationsService,
  getAllSentInvitationsService,
} = require("../services/invitation.service");

const sendInvitionToResource = async (req, res) => {
  const {
    resourceId,
    companyId,
    budget = 100,
    rateType = "hourly",
    avaibility = "Immediately",
  } = req.body;

  const response = await sendInvitationToResourceService({
    resourceId,
    companyId,
    budget,
    rateType,
    avaibility,
  });

  res.status(response.status).json({
    ...response,
  });
};

const getReceivedInvitations = async (req, res) => {
  const { resourceOwner } = req.body;
  const { page = 1, size = 10 } = req.query;
  const response = await getAllReceivedInvitationsService({
    resourceOwner,
    page,
    size,
  });

  res.status(response.status).json({
    ...response,
  });
};
const getSentInvitations = async (req, res) => {
  const { companyId } = req.body;
  const { page = 1, size = 10 } = req.query;
  const response = await getAllSentInvitationsService({
    companyId,
    page,
    size,
  });

  res.status(response.status).json({
    ...response,
  });
};
module.exports = {
  sendInvitionToResource,
  getReceivedInvitations,
  getSentInvitations,
};

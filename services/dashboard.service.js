const { Project, Application, Invitation } = require("../models");

const getDashboardDataService = async ({ companyId }) => {
  const projectsPosted = await Project.find({
    postedBy: companyId,
    isDeleted: false,
  }).countDocuments();
  const applicationsSent = await Application.find({
    userId: companyId,
    active: true,
  }).countDocuments();
  const applicationsReceived = await Application.find({
    receiverId: companyId,
    active: true,
  }).countDocuments();

  const invitationsSent = await Invitation.find({
    companyId: companyId,
    isDeleted: false,
  }).countDocuments();
  const invitationsReceived = await Invitation.find({
    resourceOwner: companyId,
    isDeleted: false,
  }).countDocuments();
  console.log(invitationsReceived, "recived");
  return {
    status: 200,
    message: "",
    data: {
      projectsPosted,
      applicationsSent,
      invitationsSent,
      invitationsReceived,
      applicationsReceived,
    },
  };
};

module.exports = { getDashboardDataService };

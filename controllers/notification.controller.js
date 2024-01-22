const {
  getProjectPostedNotificationsService,
  getAllNotificationsSeervice,
  getResourcePostedNotificationsService,
} = require("../services/notification.service");

const getProjectPostedNotifications = async (req, res) => {
  const { companyId } = req.body;

  const response = await getProjectPostedNotificationsService(companyId);

  res.status(response.status).json({
    ...response,
  });
};
const getResourcesPostedNotifications = async (req, res) => {
  const { companyId } = req.body;

  const response = await getResourcePostedNotificationsService(companyId);

  res.status(response.status).json({
    ...response,
  });
};
const getAllNotifications = async (req, res) => {
  const { companyId } = req.body;

  const response = await getAllNotificationsSeervice(companyId);

  res.status(response.status).json({
    ...response,
  });
};

module.exports = {
  getProjectPostedNotifications,
  getAllNotifications,
  getResourcesPostedNotifications,
};

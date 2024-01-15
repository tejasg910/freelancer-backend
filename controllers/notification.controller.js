const {
  getProjectPostedNotificationsService,
} = require("../services/notification.service");

const getProjectPostedNotifications = async (req, res) => {
  const { companyId } = req.body;

  const response = await getProjectPostedNotificationsService(companyId);

  res.status(response.status).json({
    ...response,
  });
};

module.exports = { getProjectPostedNotifications };

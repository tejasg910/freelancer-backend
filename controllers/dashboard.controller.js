const { getDashboardDataService } = require("../services/dashboard.service");

const getDashboardData = async (req, res) => {
  const { companyId } = req.body;

  const response = await getDashboardDataService({
    companyId,
  });

  res.status(response.status).json({
    ...response,
  });
};

module.exports = { getDashboardData };

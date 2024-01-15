const { addResourcesServices } = require("../services/resources.services");

const addResources = async (req, res) => {
  //   const {
  //     projectId,
  //     minBid = 0,
  //     maxBid = 10000,
  //     minRating = 0,
  //     maxRating = 5,
  //     sortedBy = "mostReviews",
  //   } = req.body;

  console.log(req.files);

  const response = await addResourcesServices();

  res.status(response.status).json({
    ...response,
  });
};

module.exports = { addResources };

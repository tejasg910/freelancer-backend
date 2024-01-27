const { User } = require("../models");

const {
  addResourcesServices,
  deleteResourceService,
} = require("../services/resources.services");

const addResources = async (req, res) => {
  const {
    firstName,

    lastName,
    designation,
    skills,
    // email,
    availiability,
    experience,
    budget,
    ownerId,
  } = req.body;
  const files = req.files;

  const response = await addResourcesServices({
    budget,
    firstName,
    lastName,
    // email,
    designation,
    skills,
    ownerId,
    availiability,
    experience,
    files,
  });

  res.status(response.status).json({
    ...response,
  });
};

const updateResourceController = async (req, res) => {
  try {
    const { resourceId, availiability, budget } = req.body;

    if (!resourceId || !availiability || !budget) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required field properly",
      });
    }

    const updateResourceResponse = await User.updateOne(
      { _id: resourceId },
      { $set: { availability: availiability, budget: budget } }
    );

    if (
      updateResourceResponse.ok === 1 &&
      updateResourceResponse.nModified > 0
    ) {
      return res
        .status(201)
        .json({ status: true, message: "Resource successfully updated" });
    } else {
      throw new Error("Failed to updated");
    }
  } catch (error) {
    console.error(error);
    if (error.message === "Failed to update resource") {
      return res.status(422).json({
        status: false,
        message: "Failed to update resource.",
      });
    } else {
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
};
const deleteResourceController = async (req, res) => {
  const { resourceId } = req.body;

  const response = await deleteResourceService({
    resourceId,
  });

  res.status(response.status).json({
    ...response,
  });
};
module.exports = {
  addResources,
  updateResourceController,
  deleteResourceController,
};

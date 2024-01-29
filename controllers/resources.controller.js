const { User } = require("../models");

const {
  addResourcesServices,
  deleteResourceService,
  updateResourceService,
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
const getResourceById = async (req, res) => {
  const { resourceId } = req.body;
  const files = req.files;

  const response = await addResourcesServices({
    resourceId,
  });

  res.status(response.status).json({
    ...response,
  });
};
const updateResourceController = async (req, res) => {
  const {
    resourceId,
    availiability,
    budget,
    email,
    designation,
    totalExperience,
    experience,
    fullName,
    briefExperience,
    phoneNumber,
    skills,
  } = req.body;
  const files = req.files;

  const response = await updateResourceService({
    resourceId,
    availiability,
    budget,
    email,
    designation,
    totalExperience,
    experience,
    fullName,
    briefExperience,
    phoneNumber,
    skills,
    files,
  });

  res.status(response.status).json({
    ...response,
  });
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
  getResourceById,
};

const {} = require("../services/invitation.service");
const {
  addToShortListService,
  getAllShortlistedResourcesOfCompanyService,
  sendInvitationToResourceServiceFromShortlistService,
  sendInvitationToAllResourceServiceFromShortlistService,
  removeShortListService,
  removeAllShortListService,
} = require("../services/shortlist.service");

const shortListResource = async (req, res) => {
  const { resourceId, companyId } = req.body;

  const response = await addToShortListService({
    resourceId,
    companyId,
  });

  res.status(response.status).json({
    ...response,
  });
};
const sendInviationFromShortList = async (req, res) => {
  const { resourceId, companyId } = req.body;

  const response = await sendInvitationToResourceServiceFromShortlistService({
    resourceId,
    companyId,
  });

  res.status(response.status).json({
    ...response,
  });
};
const sendInviationToAllResourcesFromShortList = async (req, res) => {
  const { companyId } = req.body;
  const response = await sendInvitationToAllResourceServiceFromShortlistService(
    {
      companyId,
    }
  );

  res.status(response.status).json({
    ...response,
  });
};

const getAllShortlistedUsersOfComapny = async (req, res) => {
  const { companyId } = req.body;

  const response = await getAllShortlistedResourcesOfCompanyService({
    companyId,
  });

  res.status(response.status).json({
    ...response,
  });
};

const removeFromShortList = async (req, res) => {
  const { companyId, resourceId } = req.body;
  const response = await removeShortListService({
    companyId,
    resourceId,
  });

  res.status(response.status).json({
    ...response,
  });
};

const removeAllFromShortList = async (req, res) => {
  const { companyId } = req.body;
  const response = await removeAllShortListService({
    companyId,
  });

  res.status(response.status).json({
    ...response,
  });
};

module.exports = {
  shortListResource,
  getAllShortlistedUsersOfComapny,
  sendInviationFromShortList,
  sendInviationToAllResourcesFromShortList,
  removeFromShortList,
  removeAllFromShortList,
};

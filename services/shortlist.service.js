const { Shortlist, User, Invitation } = require("../models");

const { setNotification } = require("./notification.service");

const addToShortListService = async ({ resourceId, companyId }) => {
  const resource = await User.findOne({
    _id: resourceId,
    userType: "user",
  });
  if (!resource) {
    return {
      status: 404,
      message: "Resource not found",
    };
  }
  const company = await User.findOne({
    _id: companyId,
    userType: "client",
  });
  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  if (resource?.owner === companyId) {
    return {
      status: 400,
      message: "You can not send request to your own resource",
    };
  }

  const shortList = await Shortlist.findOne({
    resource: resourceId,
    company: companyId,
    active: true,
  });
  if (shortList) {
    return {
      status: 404,
      message: "This resource is already added to shortlist",
    };
  }

  const inviteExists = await Invitation.findOne({ resourceId, companyId });

  if (inviteExists) {
    return {
      status: 400,
      message: "You have already sent invite",
    };
  }

  const newShortlist = new Shortlist({
    resource: resourceId,
    company: companyId,
    resourceOwner: resource.owner,
  });

  const err = newShortlist.validateSync();
  if (err) {
    return {
      message: `Something went Wrong`,
      status: 400,
      err,
    };
  } else {
    const newInvitationSave = await newShortlist.save();

    return {
      status: 200,
      message: `${resource.fullName} shortlisted successfully`,
    };
  }
};

const sendInvitationToResourceServiceFromShortlistService = async ({
  resourceId,
  companyId,
}) => {
  const resource = await User.findOne({ _id: resourceId, userType: "user" });
  if (!resource) {
    return {
      status: 404,
      message: "Resource not found",
    };
  }

  const company = await User.findOne({ _id: companyId, userType: "client" });
  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  if (resource?.owner === companyId) {
    return {
      status: 400,
      message: "You can not send request to your own resource",
    };
  }

  const inviteExists = await Invitation.find({
    resourceId,
    companyId,
    isDeleted: false,
  });

  if (inviteExists.length > 0) {
    return {
      status: 400,
      message: "You have already sent the invitation to this resource",
    };
  }

  const newInvitation = new Invitation({
    resourceId,
    companyId,
    resourceOwner: resource.owner,
  });

  const err = newInvitation.validateSync();
  if (err) {
    console.log("err: ", err);
    return {
      message: `Something went Wrong`,
      status: 400,
      err,
    };
  } else {
    const newInvitationSave = await newInvitation.save();

    const ownerUpdate = await User.findOneAndUpdate(
      { _id: companyId },
      {
        $push: { invitationsSent: resource._id },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    //send notification to company
    const switchObj = {
      notificationType: "invitationReceived",
      notificationMessage: `New invitation received for ${resource?.fullName}`,
      responseMessage: "Notification received",
    };
    const notification = await setNotification({
      triggeredBy: companyId,
      notify: resource?.owner,
      notificationMessage: switchObj.notificationMessage,
      notificationType: switchObj?.notificationType,
    });

    //update the shortlist

    const updateShortlist = await Shortlist.findOneAndUpdate(
      { company: companyId, resource: resourceId },
      {
        active: false,
      }
    );

    return {
      status: 200,
      message: "Invitation sent successfully",
      newInvitationSave,
    };
  }
};

const sendInvitationToAllResourceServiceFromShortlistService = async ({
  companyId,
}) => {
  const company = await User.findOne({ _id: companyId, userType: "client" });
  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  const shortLists = await Shortlist.find({ company: companyId, active: true });
  console.log(shortLists.length, "shortlist");
  if (shortLists.length > 0) {
    for (const shortlist of shortLists) {
      const { company, resource } = shortlist;
      await sendInvitationsService(company, resource);

      // Update the shortlist
    }

    //update the shortlist

    const updateShortlist = await Shortlist.updateMany(
      { company: companyId },
      {
        active: false,
      }
    );

    return {
      status: 200,
      message: "Invitation sent successfully",
    };
  } else {
    return {
      status: 400,
      message: "Your shortist is cleared",
    };
  }
};

const sendInvitationsService = async (companyId, resourceId) => {
  const resource = await User.findOne({ _id: resourceId, userType: "user" });

  if (resource) {
    const newInvitation = new Invitation({
      resourceId,
      companyId,
      resourceOwner: resource.owner,
    });

    const err = newInvitation.validateSync();
    if (!err) {
      const newInvitationSave = await newInvitation.save();

      const ownerUpdate = await User.findOneAndUpdate(
        { _id: companyId },
        {
          $push: { invitationsSent: resource._id },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      //send notification to company
      const switchObj = {
        notificationType: "invitationReceived",
        notificationMessage: `New invitation received for ${resource?.fullName}`,
        responseMessage: "Notification received",
      };
      const notification = await setNotification({
        triggeredBy: companyId,
        notify: resource?.owner,
        notificationMessage: switchObj.notificationMessage,
        notificationType: switchObj?.notificationType,
      });
    }
  }
};

const getAllShortlistedResourcesOfCompanyService = async ({ companyId }) => {
  console.log(companyId);
  const shortList = await Shortlist.find({
    company: companyId,
    active: true,
  }).populate({
    path: "resource",

    populate: {
      path: "skills",
    },
  });
  return {
    status: 200,
    message: "Fetched shortlisted successfully",
    shortList,
  };
};

const removeShortListService = async ({ companyId, resourceId }) => {
  const resource = await User.findOne({ _id: resourceId, userType: "user" });
  if (!resource) {
    return {
      status: 404,
      message: "Resource not found",
    };
  }

  const company = await User.findOne({ _id: companyId, userType: "client" });
  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  //update the shortlist

  const updateShortlist = await Shortlist.updateMany(
    { company: companyId, resource: resourceId },
    {
      active: false,
    }
  );

  if (updateShortlist) {
    return {
      status: 200,
      message: `${resource.fullName} removed from shortlist`,
    };
  } else {
    return {
      status: 500,
      message: `Failed to update`,
    };
  }
};

const removeAllShortListService = async ({ companyId }) => {
  const company = await User.findOne({ _id: companyId, userType: "client" });
  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  //update the shortlist

  const updateShortlist = await Shortlist.updateMany(
    { company: companyId },
    {
      active: false,
    }
  );

  return {
    status: 200,
    message: `Removed all resources from shortlist`,
  };
};

module.exports = {
  addToShortListService,
  getAllShortlistedResourcesOfCompanyService,
  sendInvitationToResourceServiceFromShortlistService,
  sendInvitationToAllResourceServiceFromShortlistService,
  removeShortListService,
  removeAllShortListService,
};

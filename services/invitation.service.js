const { Invitation, User } = require("../models");
const { setNotification } = require("./notification.service");
const { pagination } = require("./utility.service");

const sendInvitationToResourceService = async ({
  resourceId,
  companyId,
  budget,
  rateType,
  avaibility,
}) => {
  const resource = await User.findOne({ _id: resourceId, userType: "user" });
  if (!resource) {
    return {
      status: 404,
      message: "Resource not found",
    };
  }
  console.log(resource);
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
  console.log(resourceId, companyId);
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
    budget,
    rateType,
    avaibility,
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

    return {
      status: 200,
      message: "Invitation sent successfully",
    };
  }
};

const getAllReceivedInvitationsService = async ({
  resourceOwner,
  page,
  size,
}) => {
  const { limit, skip } = pagination({ page, size });

  const count = await Invitation.find({
    resourceOwner,
    isDeleted: false,
  }).countDocuments();
  const totalPages = count / size;
  const allInvitations = await Invitation.find(
    {
      resourceOwner,
      isDeleted: false,
    },
    {},
    { limit, skip }
  )

    .populate("resourceId")

    .sort({ createdAt: -1 })
    .exec();

  return {
    totalPages,
    page,
    allInvitations,
    status: 200,
    message: "Invitation received successfully",
  };
};
const getAllSentInvitationsService = async ({ companyId, page, size }) => {
  const { limit, skip } = pagination({ page, size });

  const count = await Invitation.find({
    companyId,
    isDeleted: false,
  }).countDocuments();
  const totalPages = count / size;
  const allInvitations = await Invitation.find(
    {
      companyId,
      isDeleted: false,
    },
    {},
    { limit, skip }
  )

    .populate("resourceId")

    .sort({ createdAt: -1 })
    .exec();

  return {
    totalPages,
    page,
    allInvitations,
    status: 200,
    message: "Invitation received successfully",
  };
};
module.exports = {
  sendInvitationToResourceService,
  getAllReceivedInvitationsService,
  getAllSentInvitationsService,
};

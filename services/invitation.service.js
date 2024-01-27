const { Invitation, User, Shortlist } = require("../models");
const { setNotification } = require("./notification.service");
const { setContactedService } = require("./users.service");
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

  const isShortlisted = await Shortlist.findOne({
    resource: resourceId,
    company: companyId,
    active: true,
  });

  if (!isShortlisted) {
    return { status: 400, message: `Please shortlist ${resource.fullName}` };
  }

  const inviteExists = await Invitation.findOne({
    resourceId,
    companyId,
    isDeleted: false,
  });

  if (inviteExists) {
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

    return {
      status: 200,
      message: "Invitation sent successfully",
      newInvitationSave,
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

const acceptInvitationStatusService = async ({ invitationId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    return {
      status: 404,
      message: "No invitation found",
    };
  }

  if (invitation.invitationStatus === "accepted") {
    return {
      status: 400,
      message: "You have already accepted invitation",
    };
  }
  if (invitation.invitationStatus === "rejected") {
    return {
      status: 400,
      message: "You have already rejected invitation",
    };
  }
  const updateInvitation = await Invitation.findByIdAndUpdate(
    invitationId,
    {
      invitationStatus: "accepted",
    },
    {
      runValidators: true,
      new: true,
    }
  ).populate("resourceId");

  const senderUserId = updateInvitation.companyId;
  const receiverUserId = updateInvitation.resourceOwner;

  await setContactedService({ senderUserId, receiverUserId });

  //send notification
  const switchObj = {
    notificationType: "invitationAccepted",
    notificationMessage: `${updateInvitation.resourceId?.fullName}`,
  };
  const notification = await setNotification({
    triggeredBy: updateInvitation.companyId,
    notify: updateInvitation.resourceId?.owner,
    notificationMessage: switchObj.notificationMessage,
    notificationType: switchObj?.notificationType,
  });
  return {
    status: 200,
    message: "Invitation accepted successfully",
  };
};
const rejectInvitationStatusService = async ({ invitationId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    return {
      status: 404,
      message: "No invitation found",
    };
  }

  if (invitation.invitationStatus === "accepted") {
    return {
      status: 400,
      message: "You have already accepted invitation",
    };
  }
  if (invitation.invitationStatus === "rejected") {
    return {
      status: 400,
      message: "You have already rejected invitation",
    };
  }

  const updateInvitation = await Invitation.findByIdAndUpdate(
    invitationId,
    {
      invitationStatus: "rejected",
    },
    {
      runValidators: true,
      new: true,
    }
  ).populate("resourceId");

  return {
    status: 200,
    message: "Invitation rejected successfully",
  };
};
module.exports = {
  sendInvitationToResourceService,
  getAllReceivedInvitationsService,
  getAllSentInvitationsService,
  acceptInvitationStatusService,
  rejectInvitationStatusService,
};

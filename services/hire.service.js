const mongoose = require("mongoose");
const { HireRequest, Project, User, Application } = require("../models");
const { setNotification } = require("./notification.service");
const { pagination } = require("./utility.service");

const applyProjectService = async (bodyArgs) => {
  const existing = await Application.find({
    projectId: bodyArgs.projectId,
    userId: bodyArgs.userId,
    active: true,
  });
  if (existing.length > 0) {
    return {
      message: "You have already  applied to this project",
      status: 400,
    };
  }

  const application = new Application({
    ...bodyArgs,
  });
  const err = await application.validateSync();

  if (err) {
    return {
      message: "Bad Request",
      status: 400,
    };
  } else {
    const applicationSave = await application.save();

    const freelancerUpdate = await User.findOneAndUpdate(
      { _id: applicationSave?.userId },
      {
        $push: {
          applications: {
            projectId: applicationSave?.projectId,
            applicationId: applicationSave?._id,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const projectUpdate = await Project.findOneAndUpdate(
      { _id: applicationSave?.projectId },
      {
        $push: {
          appliedBy: {
            userId: applicationSave?.userId,
            applicationId: applicationSave?._id,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const notification = await setNotification({
      triggeredBy: freelancerUpdate._id,
      notify: projectUpdate.postedBy,
      notificationMessage: `${projectUpdate.projectTitle} `,
      projectId: projectUpdate._id,
      notificationType: "jobApplication",
    });

    return {
      status: 200,
      message: "Project Applied",
      freelancerId: freelancerUpdate?._id,
      freelancer: freelancerUpdate?.userName,
      projectId: applicationSave?.projectId,
      projectTitle: projectUpdate.projectTitle,
      applicationId: applicationSave?._id,
      notification,
    };
  }
};

const getAllAppliedProjectsService = async ({ page, size, conditions }) => {
  const { limit, skip } = pagination({ page, size });

  const applications = await Application.find(
    { ...conditions },
    {},
    { limit, skip }
  )
    .populate({
      path: "projectId",
      model: "project",
      select: { projectTitle: 1 },
    })
    .populate({
      path: "userId",
      model: "user",
      select: { userName: 1, "skills.name": 1 },
    });

  if (applications.length >= 1) {
    return {
      message: "All Applied Projects",
      applications,
      status: 200,
    };
  } else {
    return {
      message: "Something went wrong",
      status: 400,
    };
  }
};

const hireAndRejectService = async ({
  applicationId,
  applicationStatus,
  clientId,
}) => {
  const application = await Application.findByIdAndUpdate(
    applicationId,
    {
      applicationStatus,
    },
    {
      runValidators: true,
      new: true,
    }
  )
    .populate("userId")
    .populate("projectId");

  if (applicationStatus === "hired") {
    await Project.findOneAndUpdate(
      {
        _id: application.projectId?._id,
        "hired.freelancerId": { $ne: application.userId?._id },
      },
      {
        $push: {
          hired: {
            freelancerId: application.userId?._id,
            applicationId: application?._id,
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
  }
  if (applicationStatus === "rejected") {
    await Project.findOneAndUpdate(
      {
        _id: application.projectId?._id,
        "hired.freelancerId": { $eq: application.userId?._id },
      },
      {
        $pull: {
          hired: {
            freelancerId: application.userId?._id,
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
  }

  const switchObj = {
    hired: {
      notificationType: "hired",
      notificationMessage: `Application for "${application.projectId.projectTitle}" got Approved`,
      responseMessage: "Applicant Hired",
    },
    rejected: {
      notificationType: "rejected",
      notificationMessage: `Application for "${application.projectId.projectTitle}" got Rejected`,
      responseMessage: "Applicant Rejected",
    },
  };
  const notification = await setNotification({
    triggeredBy: clientId,
    notify: application.userId?._id,
    notificationMessage: switchObj[applicationStatus].notificationMessage,
    projectId: application.projectId?._id,
    notificationType: switchObj[applicationStatus].notificationType,
  });

  return {
    message: switchObj[applicationStatus].responseMessage,
    freelancerId: application?.userId._id,
    projectId: application?.projectId._id,
    notification,
  };
};

const hireRequestService = async ({ projectId, freelancerId, clientId }) => {
  //checks if hire request service sent or not

  if (!projectId || !freelancerId || !clientId) {
    return {
      status: 400,
      message: "Bad reqeust",
    };
  }

  const isHireRequestServiceSent = await HireRequest.find({
    projectId,
    freelancerId,
    clientId,
  });

  if (isHireRequestServiceSent.length > 0) {
    return {
      status: 400,
      message: "You have already sent hire request",
    };
  }

  const hireRequest = new HireRequest({
    projectId,
    freelancerId,
    clientId,
    // duration,
    // hourlyRate,
    // description,
  });
  const hireRequestOnSave = await hireRequest.save().then(async (result) => {
    const freelancer = await User.findOneAndUpdate(
      {
        _id: freelancerId,
        "hireRequests.projectId": { $ne: projectId },
        "hireRequests.hireRequestId": { $ne: result._id },
      },
      {
        $push: {
          hireRequests: {
            projectId,
            clientId,
            hireRequestId: result._id,
          },
        },
      },
      { new: true }
    );

    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        "hireRequests.freelancerId": { $ne: freelancerId },
        "hireRequests.hireRequest": { $ne: result._id },
      },
      {
        $push: {
          hireRequests: {
            freelancerId,
            hireRequest: result._id,
          },
        },
      },
      { new: true }
    ).then((result) => result);
    const client = await User.find({ _id: clientId });

    const notification = await setNotification({
      triggeredBy: clientId,
      notify: freelancerId,
      notificationMessage: `Hire Request for ${project?.projectTitle}`,
      projectId: project?._id,
      notificationType: "hireRequest",
      hireRequestId: hireRequest._id,
    });

    return {
      status: 200,
      message: "Hire request sent",
      hireRequest: result,
      projectId: project?._id,
      freelancerId: freelancer?._id,
      clientId: client?._id,
      notification,
    };
  });

  return hireRequestOnSave;
};

const getAllHireRequestsService = async ({ freelancerId }) => {
  const hireRequests = await HireRequest.find({
    freelancerId,
    projectId: { $ne: null },
  })
    .populate("projectId")
    .populate("clientId");
  return hireRequests;
};

const agreeRejectHireService = async ({ hireRequestId, hireRequestStatus }) => {
  console.log(hireRequestId);
  //checking if there is a freelancer in hirerequest
  const userWithValidHireRequest = await User.findOne({
    "hireRequests.hireRequestId": mongoose.Types.ObjectId(hireRequestId),
  });

  if (!userWithValidHireRequest) {
    return { status: 404, message: "Invalid request" };
  }

  const hireRequest = await HireRequest.findByIdAndUpdate(
    hireRequestId,
    {
      hireRequestStatus,
    },
    {
      runValidators: true,
      new: true,
    }
  )
    .populate("projectId")
    .populate("freelancerId")
    .populate("clientId");

  await Project.findByIdAndUpdate(
    hireRequest.projectId?._id,
    {
      $pull: {
        hireRequests: {
          freelancerId: hireRequest.freelancerId?._id,
          hireRequest: hireRequest?._id,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  await User.findByIdAndUpdate(
    hireRequest.freelancerId?._id,
    {
      $pull: {
        hireRequests: {
          clientId: hireRequest.clientId?._id,
          hireRequestId: hireRequest?._id,
          projectId: hireRequest.projectId?._id,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (hireRequestStatus === "agreed") {
    await Project.findOneAndUpdate(
      {
        _id: hireRequest.projectId?._id,
        "hired.freelancerId": { $ne: hireRequest.freelancerId?._id },
      },
      {
        $push: {
          hired: {
            freelancerId: hireRequest.freelancerId?._id,
            hireRequestId: hireRequest?._id,
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
  }

  if (hireRequestStatus === "rejected") {
    await Project.findOneAndUpdate(
      {
        _id: hireRequest.projectId?._id,
        "hired.freelancerId": { $eq: hireRequest.freelancerId?._id },
      },
      {
        $pull: {
          hired: {
            freelancerId: hireRequest.userId?._id,
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
  }

  const switchObj = {
    agreed: {
      notificationType: "agreeHireRequest",
      notificationMessage: `Hire Request for "${hireRequest.projectId.projectTitle}" got Agreed by  ${hireRequest.freelancerId.userName}`,
      responseMessage: "HireRequest Agreed",
    },
    rejected: {
      notificationType: "rejectedHireRequest",
      notificationMessage: `Hire Request for "${hireRequest.projectId.projectTitle}" got rejected by  ${hireRequest.freelancerId.userName}`,
      responseMessage: "HireRequest Rejected",
    },
  };
  const notification = await setNotification({
    triggeredBy: hireRequest.freelancerId?._id,
    notify: hireRequest.clientId?._id,
    notificationMessage: switchObj[hireRequestStatus].notificationMessage,
    projectId: hireRequest.projectId?._id,
    notificationType: switchObj[hireRequestStatus].notificationType,
  });

  return {
    status: 200,
    message: switchObj[hireRequestStatus].responseMessage,
    freelancerId: hireRequest.userId?._id,
    projectId: hireRequest?.projectId,
    notification,
  };
};

const getAllSentHireRequestsService = async (clientId, page, size) => {
  const { limit, skip } = pagination({ page, size });
  const count = await HireRequest.find({
    clientId: clientId,
    isDeleted: false,
  }).count();
  const totalPages = count / size;
  const hireRequests = await HireRequest.find(
    { clientId: clientId, isDeleted: false },
    {},
    { limit, skip }
  )
    .populate("projectId")
    .populate("freelancerId")
    .sort({ createdAt: -1 })
    .exec();

  return {
    status: 200,
    message: "Hire requests fetched successfully",
    page,
    totalPages,
    hireRequests,
  };
};

const getAllIncommingHireRequestsService = async (clientId, page, size) => {
  const { limit, skip } = pagination({ page, size });
  const count = await HireRequest.find({
    freelancerId: clientId,
    isDeleted: false,
  }).countDocuments();
  const totalPages = count / size;
  const hireRequests = await HireRequest.find(
    { freelancerId: clientId, isDeleted: false },
    {},
    { limit, skip }
  )
    .populate("projectId")
    .populate("clientId")
    .sort({ createdAt: -1 })
    .exec();

  return {
    status: 200,
    message: "Hire requests fetched successfully",
    page,
    totalPages,
    hireRequests,
  };
};

module.exports = {
  applyProjectService,
  getAllAppliedProjectsService,
  hireAndRejectService,
  hireRequestService,
  getAllHireRequestsService,
  agreeRejectHireService,
  getAllSentHireRequestsService,
  getAllIncommingHireRequestsService,
};

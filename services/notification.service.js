const { Notification, User } = require("../models");
const { userSelect } = require("./service.constants");

const setNotification = async ({
  triggeredBy,
  notify,
  notificationMessage,
  projectId,
  notificationType,
  hireRequestId,
  resourceId,
}) => {
  const notificationCreate = await new Notification({
    triggeredBy,
    notify,
    notificationMessage,
    projectId,
    notificationType,
    hireRequestId,
    resourceId,
  });
  const err = await notificationCreate.validateSync();
  if (!err) {
    const notificationDetails = await notificationCreate.save();

    const notifyUserDetails = await User.findByIdAndUpdate(
      notify,
      {
        $push: {
          notifications: notificationDetails._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(userSelect);
    const triggeredByUserDetails = await User.findOne(
      { _id: triggeredBy, isDeleted: false },
      userSelect
    );

    return { notificationDetails, notifyUserDetails, triggeredByUserDetails };
  } else {
    throw Error("Bad Notification Request");
  }
  // node mailer
};

const readNotificationService = async ({ notificationId, userId }) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      notify: userId,
    },
    {
      isRead: true,
      updatedAt: Date.now(),
    },
    { new: true }
  );

  return notification;
};

const getProjectPostedNotificationsService = async (companyId) => {
  const notifications = await Notification.find(
    {
      notificationType: "projectPosted",
      notify: companyId,
      // isRead: false,
    },
    {},
    { limit: 20 }
  )
    .populate({
      path: "projectId",
      populate: {
        path: "postedBy",
        select: userSelect,
      },
    })
    .populate({
      path: "triggeredBy",
    })
    .sort({ createdAt: -1 });

  return {
    status: 200,
    message: "fetched notifications successfully",
    notifications,
  };
};

const getResourcePostedNotificationsService = async (companyId) => {
  const notifications = await Notification.find(
    {
      notificationType: "requirementPosted",
      notify: companyId,
      // isRead: false,
    },
    {},
    { limit: 50 }
  )
    .populate({
      path: "triggeredBy",
    })
    .populate({
      path: "resourceId",
    })
    .sort({ createdAt: -1 });

  return {
    status: 200,
    message: "fetched notifications successfully",
    notifications,
  };
};

const getAllNotificationsSeervice = async (companyId) => {
  const notifications = await Notification.find(
    {
      notify: companyId,
      // isRead: false,
    },
    {},
    { limit: 20 }
  )
    .populate({
      path: "projectId",
      populate: {
        path: "postedBy",
        select: userSelect,
      },
    })
    .populate({
      path: "hireRequestId",
    })
    .populate({
      path: "triggeredBy",
    })
    .sort({ createdAt: -1 });

  return {
    status: 200,
    message: "fetched notifications successfully",
    notifications,
  };
};

module.exports = {
  setNotification,
  readNotificationService,
  getProjectPostedNotificationsService,
  getAllNotificationsSeervice,
  getResourcePostedNotificationsService,
};

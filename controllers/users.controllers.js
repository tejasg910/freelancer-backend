const { User } = require("../models");
const { queryConditions } = require("../services/utility.service");
const { readNotificationService } = require("../services/notification.service");
const {
  getUserReviewsService,
  setReviewService,
  userFindService,
  getAllUsersService,

  registerUserService,
  setContactedService,
  loginUserService,
  updateUserService,
  getCompaniesInFeedService,
  verifyUserService,
  forgotPasswordService,
  resetPasswordService,
  getCompanyByIdService,
  resendOtpService,
  verifyEmailService,
  getCompaniesByProjectIdInFeedService,
} = require("../services/users.service");
const { generateLoginToken } = require("../utils/forgotPasswordtoken");

const getAllUsers = async (req, res) => {
  const { page = 1, size = 10 } = req.query;

  const conditions = queryConditions(req.body, Object.keys(User.schema.obj));

  const response = await getAllUsersService({
    conditions,
    page,
    size,
  });

  return res.status(response?.status).json({
    ...response,
  });
};
const getCompanyById = async (req, res) => {
  const { companyId } = req.body;
  const response = await getCompanyByIdService(companyId);

  return res.status(response?.status).json({
    ...response,
  });
};
const registerUser = async (req, res) => {
  const {
    email,
    // companyName,
    password,
    // phoneNumber,
    // userName,
    fullName,
    // firstName,
    // lastName,

    // userType,
  } = req.body;

  const response = await registerUserService({
    email,
    // companyName,
    password,
    // phoneNumber,
    // userName,
    fullName,
    // firstName,
    // lastName,

    // userType,
  });

  res.status(response?.status).json({
    ...response,
  });
};

const updateUser = async (req, res) => {
  const {
    // firstName,
    // lastName,
    // companyName,
    fullName,
    email,
    // userType,
    // occupation,
    intro,
    profilePic,
    phoneNumber,
    address,
    socialProfiles,
    qualifications,
    skills,
    // portfolioProjects,
    companyId,
    website,
  } = req.body;
  const response = await updateUserService({
    // companyName,
    fullName,
    // firstName,
    // lastName,
    email,
    // userType,
    // occupation,
    intro,
    companyId,
    profilePic,
    phoneNumber,
    address,
    socialProfiles,
    qualifications,
    skills,
    // portfolioProjects,
    website,
  });
  res.status(response?.status).json({
    ...response,
  });
};
const verifyEmail = async (req, res) => {
  const { email } = req.body;
  const response = await verifyEmailService({
    email,
  });
  res.status(response?.status).json({
    ...response,
  });
};

const verifyUser = async (req, res) => {
  const { email, otp } = req.body;
  const response = await verifyUserService({
    email,
    otp,
  });
  res.status(response?.status).json({
    ...response,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);
  const response = await loginUserService({
    email,
    password,
  });
  if (response.status === 200) {
    const token = await generateLoginToken(email);

    res.cookie("token", token, { httpOnly: false });
  }
  res.status(response?.status).json({
    ...response,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const response = await forgotPasswordService({
    email,
  });
  res.status(response?.status).json({
    ...response,
  });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const response = await resetPasswordService({
    token,
    password,
  });
  res.status(response?.status).json({
    ...response,
  });
};
const resendOTP = async (req, res) => {
  const { email } = req.body;
  const response = await resendOtpService(email);
  res.status(response?.status).json({
    ...response,
  });
};

const findByEmail = async (req, res) => {
  const { email } = req.body;

  const user = await userFindService({
    email,
  });

  if (user.length) {
    res.status(200).json({
      message: "User Found",
      user,
    });
  } else {
    res.status(400).json({
      message: "Bad Request",
    });
  }
};

const setReview = async (req, res) => {
  const { userId, reviewedBy, title, description, rating } = req.body;

  const response = await setReviewService({
    userId,
    reviewedBy,
    title,
    description,
    rating,
  });

  res.status(response?.status).json({
    ...response,
    title,
    description,
    rating,
  });
};

const getUserReviews = async (req, res) => {
  const { reviews, userId } = await getUserReviewsService({
    userId: req.body.userId,
  });

  res.status(200).json({
    message: "Reviews of User",
    reviews,
    userId,
  });
};

const readNotification = async (req, res) => {
  const { notificationId, userId } = req.body;

  const notification = await readNotificationService({
    notificationId,
    userId,
  });

  res.status(200).json({
    message: "Notification read success",
    notificationId: notification._id,
    userId: notification.notify,
  });
};

const setContacted = async (req, res) => {
  const { senderUserId, receiverUserId } = req.body;

  const response = await setContactedService({
    senderUserId,
    receiverUserId,
  });

  res.status(response.status).json({
    ...response,
  });
};

const getCompaniesInFeed = async (req, res) => {
  const { companyId } = req.body;
  const { page = 1, size = 10 } = req.query;
  console.log("req.query: ", req.query);

  const response = await getCompaniesInFeedService({
    companyId,
    page,
    size,
  });
  res.status(response.status).json({
    ...response,
  });
};

const getCompaniesByProjectIdInFeed = async (req, res) => {
  const { companyId, projectId } = req.body;
  const { page = 1, size = 10 } = req.query;
  console.log("req.query: ", req.query);

  const response = await getCompaniesByProjectIdInFeedService({
    companyId,
    page,
    size,
    projectId,
  });
  res.status(response.status).json({
    ...response,
  });
};
module.exports = {
  getAllUsers,
  registerUser,
  findByEmail,
  setReview,
  getUserReviews,
  readNotification,
  setContacted,
  loginUser,
  updateUser,
  getCompaniesInFeed,
  verifyUser,
  forgotPassword,
  resetPassword,
  getCompanyById,
  resendOTP,
  verifyEmail,
  getCompaniesByProjectIdInFeed,
};

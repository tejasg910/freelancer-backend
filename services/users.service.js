const { User, Project } = require("../models");
const { setNotification } = require("./notification.service");
const mongoose = require("mongoose");
const {
  pagination,
  comparePassword,
  hashPassword,
  calculateProfileCompletion,
} = require("./utility.service");

const {
  userSelect,
  applicationSelect,
  projectSelect,
} = require("./service.constants");
const { sendEmail } = require("../utils/sendEmail");
const { generateOTP } = require("../utils/generateOtp");
const {
  emailVerificationTemplate,
  resetPasswordTemplate,
  registrationTemplate,
} = require("../utils/emailTemplates");
const {
  generateResetToken,
  verifyResetToken,
} = require("../utils/forgotPasswordtoken");
const { uploadFile } = require("../utils/awsUpload");

const userFindService = async (conditions) => {
  const user = await User.find({ ...conditions })
    .populate({
      path: "notifications",
      populate: {
        path: "triggeredBy",
        select: userSelect,
      },
    })
    .populate({
      path: "notifications",
      populate: {
        path: "notify",
        select: userSelect,
      },
      match: { isRead: false },
    })
    .populate({
      path: "contacted",
      select: userSelect,
    })
    .populate({
      path: "projects",
      select: projectSelect,
      populate: {
        path: "skills",
      },
    })
    .populate({
      path: "applications.projectId",
      select: { ...projectSelect, hired: 1 },
      populate: {
        path: "hired.freelancerId",
        select: userSelect,
      },
      populate: {
        path: "skills",
      },
    })
    .populate({
      path: "applications.applicationId",
      select: applicationSelect,
    })
    .populate({
      path: "hireRequests.projectId",
      select: projectSelect,
    })
    .populate({
      path: "hireRequests.clientId",
      select: userSelect,
    })
    .populate({
      path: "reviews.reviewedBy",
      select: userSelect,
    })
    .populate({
      path: "favUsers",
      select: userSelect,
    })
    .populate({
      path: "favProjects",
      select: userSelect,
    })
    .populate({
      path: "favByUsers",
      select: userSelect,
    })
    .populate({
      path: "skills",
    })
    .populate({
      path: "team",
      select: userSelect,
      populate: {
        path: "skills",
      },
    });

  return user;
};

const getCompanyByIdService = async (companyId) => {
  const company = await User.findById(companyId)
    .populate("skills")
    .populate({
      path: "team",
      select: userSelect,
      populate: {
        path: "skills",
      },
    })
    .populate({
      path: "portfolioProjects.skills",
      model: "category",
    });
  if (!company) {
    return {
      status: 404,
      message: "No company found",
    };
  }

  return {
    status: 200,
    message: "Fetched company successfully",
    company,
  };
};

const getAllUsersService = async ({ filter, conditions, page, size }) => {
  const { limit, skip } = pagination({ page, size });
  console.log(limit, skip);
  console.log("condition", filter);

  const { maxBudget, minBudget, availability, experience, skill, sort } =
    filter;

  if (maxBudget !== null && minBudget !== null) {
    conditions = {
      ...conditions,
      // Add conditions for budget filtering
      budget: { $gte: minBudget, $lte: maxBudget },
    };
  }

  // Apply additional filters if provided
  if (availability && availability !== undefined) {
    conditions = {
      ...conditions,
      availability: availability,
    };
  }

  // Apply additional filters if provided
  if (experience && experience !== null) {
    conditions = {
      ...conditions,
      experience: experience,
    };
  }

  const ObjSkill = skill ? mongoose.Types.ObjectId(skill) : "";

  // Apply additional filters if provided
  if (skill && skill !== undefined && ObjSkill) {
    conditions = {
      ...conditions,
      skills: { $eq: ObjSkill },
    };
  }

  let sorted = { createdAt: -1 };

  if (sort === "newest") {
    sorted = { createdAt: -1 }; // Sort by createdAt field in descending order for newest
  } else if (sort === "oldest") {
    sorted = { createdAt: 1 }; // Sort by createdAt field in ascending order for oldest
  }

  console.log(conditions);

  const users = await User.find({ isDeleted: false, ...conditions })
    .skip(skip)
    .limit(limit)
    .sort(sorted)
    .populate({
      path: "notifications",
      populate: {
        path: "triggeredBy",
        select: userSelect,
      },
    })
    .populate({
      path: "notifications",
      populate: {
        path: "notify",
        select: userSelect,
      },

      match: { isRead: false },
    })
    .populate({
      path: "contacted",
      select: userSelect,
    })
    .populate({
      path: "projects",
      select: projectSelect,
    })
    .populate({
      path: "applications.projectId",
      select: { ...projectSelect, hired: 1 },
      populate: {
        path: "hired.freelancerId",
        select: userSelect,
      },
      populate: {
        path: "skills",
      },
    })
    .populate({
      path: "applications.applicationId",
      select: applicationSelect,
    })
    .populate({
      path: "hireRequests.projectId",
      select: projectSelect,
    })
    .populate({
      path: "hireRequests.clientId",
      select: userSelect,
    })
    .populate({
      path: "hireRequests.hireRequestId",
    })
    .populate({
      path: "reviews.reviewedBy",
      select: userSelect,
    })
    .populate({
      path: "favUsers",
      select: userSelect,
    })
    .populate({
      path: "favProjects",
      select: userSelect,
    })
    .populate({
      path: "favByUsers",
      select: userSelect,
    })
    .populate({
      path: "skills",
    });

  const count = await User.find({ isDeleted: false, ...conditions }).count();
  const totalPages = count / size;

  if (users) {
    const skills = users
      .reduce((a, c) => [...new Set([...a, ...c.skills])], [])
      .reduce((a, c) => [...new Set([...a, c.name])], []);

    const userType = users.reduce(
      (a, c) => [...new Set([...a, c.userType])],
      []
    );

    return {
      message: "Users List",
      status: 200,
      users,
      page,
      size,
      totalPages,
      filter: {
        skills,
        // qualifications,
        userType,
      },
    };
  } else {
    return {
      message: "Bad Request",
      status: 400,
    };
  }
};

const registerUserService = async ({
  email,
  // companyName,
  fullName,
  password,
  // phoneNumber,
  // userName,
  gstId,
  // firstName,
  // lastName,

  // userType,
}) => {
  const company = await User.findOne({ fullName, userType: "client" });

  if (company) {
    return {
      message: "Company already exists with the same company name",
      status: 403,
    };
  }

  const user = await User.findOne({
    email,
  });

  if (user) {
    if (user.email === email) {
      return {
        message: "Company already exists with the same email",
        status: 403,
      };
    }
  } else {
    //hashing

    const hashedPassword = await hashPassword(password);

    if (!hashedPassword) {
      return { status: 400, message: "Something went wrong" };
    }
    // const fullName = firstName + " " + lastName;
    //send
    console.log(gstId);

    //verify user
    const otp = await generateOTP();
    const expiration = new Date(Date.now() + 2 * 60 * 1000);
    const emailContent = `You account verification code is ${otp}. Please do not share this code with anyone. This otp is valid until 10 minutes.`;
    const emailTempate = emailVerificationTemplate(otp, email, fullName);
    sendEmail(email, emailTempate, "Verifying email for registration!");
    const newUser = new User({
      email,
      fullName,
      gstId,
      password: hashedPassword,
      otp: {
        otp,
        expireIn: expiration,
      },
      // phoneNumber,
      // userName,

      // firstName,
      // lastName,

      // userType,
      // fullName,
    });

    const err = await newUser.validateSync();
    if (err) {
      console.log("err: ", err);
      return {
        message: `Something went Wrong`,
        status: 400,
        err,
      };
    } else {
      const newUserSave = await newUser.save();
      return {
        message: "Please enter otp sent on your email",
        user: newUserSave,
        status: 200,
      };
    }
  }
};

const verifyEmailService = async ({ email }) => {
  // Find the user by email

  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "No Company found",
      status: 404,
    };
  }

  if (!user.isVerified) {
    const otp = await generateOTP();
    const expiration = new Date(Date.now() + 2 * 60 * 1000);

    const emailTempate = emailVerificationTemplate(otp, email, user?.fullName);
    sendEmail(email, emailTempate, "Verifying email for registration!");

    await User.findOneAndUpdate(
      { email },
      {
        otp: {
          otp,
          expireIn: expiration,
        },
      }
    );
    return {
      message: "Company is not verfied",
      status: 400,
    };
  }

  return {
    message: "Company is already verified",
    status: 200,
  };
};

const verifyUserService = async ({ email, otp }) => {
  // Find the user by email

  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "No company found",
      status: 404,
    };
  }

  if (user.isVerified) {
    return {
      message: "Company is already verfied",
      status: 400,
      user,
    };
  }

  if (user.otp.otp !== otp) {
    return {
      message: "Incorrect OTP",
      status: 403,
    };
  }

  // Check if the OTP is expired
  if (user.otp.expireIn < new Date()) {
    return {
      message: "OTP has expired",
      status: 403,
    };
  }

  // Update user's isVerified status and clear OTP information
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: { isVerified: true, otp: null } },
    { new: true }
  );

  if (!updatedUser) {
    return {
      message: "Failed to update user",
      status: 500,
    };
  }

  const verificationTemplate = registrationTemplate(updatedUser?.fullName);
  sendEmail(
    email,
    verificationTemplate,
    "Verification completed successfully!"
  );

  return {
    message: "Company verified successfully",
    status: 200,
    user: updatedUser,
  };
};

const loginUserService = async ({
  email,

  password,
}) => {
  const user = await User.find({ email });

  if (user.length === 0) {
    return { status: 404, message: "User not found" };
  }

  const updatedUser = await userFindService({ email });

  //checking password
  const isMatch = await comparePassword(password, user[0].password);

  if (!isMatch) {
    return {
      status: 400,
      message: "Invalid credentials",
    };
  }

  // if (user[0].isVerified === false) {
  //   const otp = await generateOTP();
  //   const expiration = new Date(Date.now() + 10 * 60 * 1000);

  //   const emailTempate = emailVerificationTemplate(
  //     otp,
  //     email,
  //     user[0].companyName
  //   );
  //   sendEmail(email, emailTempate, "Verifying email for login!");
  //   await User.findOneAndUpdate(
  //     { email },
  //     {
  //       otp: {
  //         otp,
  //         expireIn: expiration,
  //       },
  //     }
  //   );
  //   return {
  //     status: 401,
  //     message: "This user is not verified",
  //   };
  // }

  // Set the token in a cookie

  return { status: 200, message: "Login succes", user: updatedUser };
};

const forgotPasswordService = async ({ email }) => {
  // generating a token

  const company = await User.findOne({ email });
  if (!company) {
    return {
      status: 404,
      message: "No company found with this email",
    };
  }

  const token = await generateResetToken(company.email);
  //sending email for user

  const link = `${process.env.FRONTEND_ORIGIN}ForgotPassword/${token}`;
  const resetTemplate = resetPasswordTemplate(link, company?.fullName);
  await sendEmail(email, resetTemplate, "Reset your password");

  return {
    status: 200,
    message: "Password reset link has been sent to your email",
  };
};

const resetPasswordService = async ({ token, password }) => {
  if (!password) {
    return {
      status: 400,
      message: "Please enter valid password",
    };
  }
  //verify token
  const isEmail = verifyResetToken(token);
  if (!isEmail) {
    return {
      status: 400,
      message: "Invalid token or expired",
    };
  }

  //hashing password
  const hashedPassword = await hashPassword(password);

  //find and update user
  const updatedCompany = await User.findOneAndUpdate(
    { email: isEmail },
    { $set: { password: hashedPassword } },
    { new: true }
  );
  // console.log(updatedCompany);
  if (!updatedCompany) {
    return {
      message: "Company not found",
      status: 404,
    };
  }

  return {
    status: 200,
    message: "Company updated successfully",
  };
};

const setReviewService = async ({
  userId,
  reviewedBy,
  title,
  description,
  rating,
}) => {
  const userDetails = await User.findById(userId);
  const reviews = userDetails.reviews || [];
  const totalRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) + parseInt(rating);
  const newAverageRating =
    totalRating > 0 ? totalRating / (reviews.length + 1) : 0;
  // console.log(totalRating, newAverageRating, "this is average rating");

  const userUpdate = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        averageRating: newAverageRating,
      },
      $push: {
        reviews: {
          reviewedBy,
          title,
          description,
          rating,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  const reviewerUpdate = await User.findByIdAndUpdate(
    reviewedBy,
    {
      $push: {
        reviewed: userUpdate._id,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  const notification = await setNotification({
    triggeredBy: reviewedBy,
    notify: userId,
    notificationMessage: "Got a Review",
    notificationType: "review",
  });

  const user = await User.find({ _id: userUpdate?._id });

  return {
    reviewedBy: reviewerUpdate?.email,
    user,
    notification,
    status: 200,
  };
};

const getUserReviewsService = async ({ userId }) => {
  const userReviews = await User.findById(userId, {
    email: 1,
    reviews: 1,
  }).populate({
    path: "reviews.reviewedBy",
    model: "user",
    select: {
      _id: 1,
      userName: 1,
      reviewed: 1,
    },
  });

  return {
    reviews: userReviews,
    userId: userReviews?._id,
  };
};

const setContactedService = async ({ senderUserId, receiverUserId }) => {
  const senderUserUpdate = await User.findOneAndUpdate(
    { _id: senderUserId },
    {
      $addToSet: {
        contacted: receiverUserId,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  const receiverUserUpdate = await User.findOneAndUpdate(
    { _id: receiverUserId },
    {
      $addToSet: {
        contacted: senderUserId,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return {
    status: 200,
    message: "Contacted user added to set",
    senderUser: senderUserUpdate?._id,
    senderUserContacted: senderUserUpdate?.contacted,
    receiverUser: receiverUserUpdate?._id,
    receiverUserContacted: receiverUserUpdate?.contacted,
  };
};

const updateUserService = async ({
  // firstName,
  // lastName,
  companyId,
  // companyName,
  fullName,
  email,
  // userType,
  // occupation,
  intro,
  files,
  phoneNumber,
  address,
  socialProfiles,
  qualifications,
  skills,
  // portfolioProjects,
  website,
}) => {
  // const fullName = firstName + " " + lastName;

  // const projects = portfolioProjects.filter((project) => project !== false);

  if (!email) {
    return {
      status: 404,
      message: "Please provide valid email",
    };
  }
  // console.log(skills);
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return { status: 404, message: "User not found" };
  }

  //cheks that other company name exists except current company name

  if (fullName) {
    const isCompanyExists = await User.findOne({
      fullName,
      _id: { $ne: companyId },
    });

    if (isCompanyExists) {
      return {
        status: 400,
        message: "Company Name is already exists",
      };
    }
  }

  let profilePic = "";
  const acceptedImageFormats = ["image/jpeg", "image/png", "image/jpg"];
  if (
    files &&
    files.length > 0 &&
    acceptedImageFormats.includes(files[0].mimetype)
  ) {
    const image = files[0];
    const uploadImage = await uploadFile(image, "ProfileImage");
    profilePic = uploadImage;
  }

  const userDetails = await User.findOneAndUpdate(
    { email: email },
    {
      // companyName,
      fullName,
      // firstName,
      // lastName,
      email,
      // userType,
      // occupation,
      profilePic,
      intro,
      phoneNumber,
      address,
      socialProfiles,
      qualifications,
      skills,
      // portfolioProjects: projects,
      website,
    },
    { new: true }
  );

  calculateProfileCompletion(email);

  return {
    status: 200,
    message: "User updated successfully",
    userDetails,
  };
};

const resendOtpService = async (email) => {
  const otp = await generateOTP();

  const expiration = new Date(Date.now() + 2 * 60 * 1000);
  const company = await User.findOne({ email });

  if (!company) {
    return {
      status: 400,
      message: "No company found with this email",
    };
  }

  if (company && company.otp && company.otp.expireIn > new Date()) {
    const remainingTime = company.otp.expireIn - Date.now();
    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
    const remainingSeconds = Math.ceil((remainingTime % (60 * 1000)) / 1000);
    return {
      status: 400,
      message: `Please wait ${
        remainingMinutes - 1
      } minutes ${remainingSeconds} seconds before requesting a new OTP.`,
    };
  }
  const emailTempate = emailVerificationTemplate(otp, email, company?.fullName);
  sendEmail(email, emailTempate, "Verifying email for registration!");
  await User.findOneAndUpdate(
    { email },
    { $set: { otp: { otp: otp, expireIn: expiration } } }
  );
  return {
    status: 200,
    message: "Otp sent successfully",
  };
};

async function getMatchedUsers(projectId, currentUserId) {
  try {
    // Step 1: Find the project by ID
    const project = await Project.findById(projectId).populate("skills");
    if (!project) {
      throw new Error("Project not found");
    }
    // Step 2: Extract skills from the project
    const projectSkills = project.skills.map((skill) => skill._id);
    // Step 3: Find users with matching skills, excluding the current user
    const matchingUsers = await User.find({
      owner: { $ne: mongoose.Types.ObjectId(currentUserId) },
      userType: "user",
      skills: { $in: projectSkills },
    }).populate("skills");

    // Step 4: Calculate matching score for each user
    const usersWithScore = matchingUsers.map((user) => {
      let matchingScore = 0;
      user.skills.forEach((userSkill) => {
        if (projectSkills.includes(userSkill._id)) {
          matchingScore++;
        }
      });
      const matchingPercentage = (matchingScore / projectSkills.length) * 100;

      const formattedPercentage = matchingPercentage.toFixed(2);

      return {
        matchingPercentage: formattedPercentage,
        project,
        user,
        matchingScore,
      };
    });
    // // Step 5: Sort users based on the matching score
    // console.log(
    //   "Before Sorting:",
    //   usersWithScore.map((user) => user.matchingScore)
    // );

    // const sortedUsers = usersWithScore.sort(
    //   (a, b) => parseInt(b.matchingScore) - parseInt(a.matchingScore)
    // );

    // sortedUsers.forEach((user) => {
    //   console.log(user.matchingScore, projectId);
    // });

    return usersWithScore;
  } catch (error) {
    throw error;
  }
}
const getCompaniesInFeedService = async ({ companyId, page, size }) => {
  const company = await User.findById(companyId);
  if (!company) {
    return {
      status: 404,
      message: "No company found",
    };
  }
  const projects = await Project.find({ postedBy: companyId });
  if (projects.length === 0) {
    return {
      status: 404,
      message: "No project found",
    };
  }
  const usersPromises = projects.map(async (project) => {
    const result = await getMatchedUsers(project._id, companyId);
    return result;
  });
  const allUsersArrays = await Promise.all(usersPromises);
  const allUsers = allUsersArrays.flat(); // Flatten the array

  const sortedUsers = allUsers.sort(
    (a, b) => parseInt(b.matchingPercentage) - parseInt(a.matchingPercentage)
  );

  const startIndex = (page - 1) * size;
  const endIndex = page * size;
  const users = sortedUsers.slice(startIndex, endIndex);
  const totalPages = allUsers.length / size;

  //sending  notification

  return {
    status: 200,
    page: page,
    totalPages,
    message: "Feed updated successfully",
    companies: users,
  };
};
const getCompaniesByProjectIdInFeedService = async ({
  companyId,
  page,
  size,
  projectId,
}) => {
  const company = await User.findById(companyId);
  if (!company) {
    return {
      status: 404,
      message: "No company found",
    };
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return {
      status: 404,
      message: "No project found",
    };
  }

  const result = await getMatchedUsers(project._id, companyId);

  const allUsersArrays = await Promise.all(result);
  const allUsers = allUsersArrays.flat(); // Flatten the array

  const sortedUsers = allUsers.sort(
    (a, b) => parseInt(b.matchingPercentage) - parseInt(a.matchingPercentage)
  );

  const startIndex = (page - 1) * size;
  const endIndex = page * size;
  const users = sortedUsers.slice(startIndex, endIndex);
  const totalPages = allUsers.length / size;

  //sending  notification

  return {
    status: 200,
    page: page,
    totalPages,
    message: "Feed updated successfully",
    companies: users,
  };
};

module.exports = {
  userFindService,
  getAllUsersService,
  registerUserService,
  setReviewService,
  getUserReviewsService,
  setContactedService,
  loginUserService,
  updateUserService,
  verifyUserService,
  getCompaniesInFeedService,
  forgotPasswordService,
  resetPasswordService,
  getCompanyByIdService,
  resendOtpService,
  verifyEmailService,
  getMatchedUsers,
  getCompaniesByProjectIdInFeedService,
};

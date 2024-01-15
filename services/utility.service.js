const { HireRequest, User } = require("../models");
var bcrypt = require("bcryptjs");

const pagination = ({ page, size }) => {
  const limit = parseInt(size);
  const skip = (page - 1) * size;

  return { limit, skip };
};

const queryConditions = (bodyObj, keys = []) => {
  const conditions = {};

  for (let key of ["_id", ...keys]) {
    if (bodyObj[key]) conditions[key] = bodyObj[key];
  }

  return conditions;
};

const comparePassword = async (password, hash) => {
  const isMatch = await bcrypt.compare(password, hash);
  if (isMatch) {
    return true;
  } else {
    return false;
  }
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    return false;
  }
};

const calculateProfileCompletion = async (email) => {
  const requiredFields = [
    "fullName",
    "intro",
    // "profilePic",
    "phoneNumber",
    "address",
    "socialProfiles",
    "skills",
    "website",
  ];

  let completedFields = 0;
  const user = await User.findOne({ email });

  requiredFields.forEach((field) => {
    if (user[field]) {
      if (typeof user[field] === "string" && user[field].trim() !== "") {
        completedFields += 1;
      }
    }
  });

  if (user.socialProfiles && user.socialProfiles.length > 0) {
    user.socialProfiles.forEach((social) => {
      if (social.url.length > 1) {
        completedFields += 1;
      }
    });
  }
  if (user.skills.length > 0) {
    completedFields += 1;
  }

  const totalFields = requiredFields.length + 2; //2 for social profiles;
  const profileCompletionPercentage = (
    (completedFields / totalFields) *
    100
  ).toFixed(2);

  // Calculate the percentage
  await User.findByIdAndUpdate(user._id, {
    profileCompleted: profileCompletionPercentage,
  });

  // Return the percentage with 2 decimal places
};

const useTryCatch = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

module.exports = {
  pagination,
  queryConditions,
  useTryCatch,
  comparePassword,
  hashPassword,
  calculateProfileCompletion,
};

const mongoose = require("mongoose");
const { HireRequest, User, Project } = require("../models");
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
    "profilePic",
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
  if (user?.skills?.length > 0) {
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

async function getMatchedCompanies(projectId, currentUserId) {
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
      _id: { $ne: mongoose.Types.ObjectId(currentUserId) },
      userType: "client",
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

const useTryCatch = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

module.exports = {
  pagination,
  queryConditions,
  useTryCatch,
  comparePassword,
  hashPassword,
  calculateProfileCompletion,
  getMatchedCompanies,
};

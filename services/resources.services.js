const mongoose = require("mongoose");
const { User } = require("../models");
const { uploadFile } = require("../utils/awsUpload");
const { setNotification } = require("./notification.service");
const { getMatchedCompaniesForResources } = require("./utility.service");

const addResourcesServices = async ({
  firstName,
  lastName,
  email,
  designation,
  skills,
  availiability,
  ownerId,
  experience,
  files,
  budget,
}) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      status: 404,
      message: "This email is already taken",
    };
  }

  const owner = await User.findById(ownerId);
  const ownerResumes = owner.resumes;
  const ownerSkills = owner.skills;
  const team = owner.team;
  if (!owner) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  let url = null;
  if (files && files.length > 0 && files[0].mimetype == "application/pdf") {
    url = await uploadFile(files[0], "document");
  }

  const fullName = firstName + " " + lastName;

  const newUser = new User({
    fullName,
    designation,
    skills,
    email,
    availiability,
    experience,
    budget,
    userType: "user",
    owner: owner._id,
    resume: url,
  });

  const err = newUser.validateSync();
  if (err) {
    console.log("err: ", err);
    return {
      message: `Something went Wrong`,
      status: 400,
      err,
    };
  } else {
    const newUserSave = await newUser.save();

    const newSkills = newUserSave?.skills.filter(
      (skill) => !owner.skills.includes(skill._id)
    );
    const skillId = newSkills.map((skill) => skill._id);
    if (skillId.length > 0) {
      ownerSkills.push(...skillId);
    }

    ownerResumes.push(url);
    team.push(newUserSave._id);
    const updateOwner = await User.findOneAndUpdate(
      { _id: ownerId },
      {
        skills: ownerSkills,
        resumes: ownerResumes,
        team: team,
      },

      {
        new: true,
        runValidators: true,
      }
    );

    //sending notification to the company when resources added

    //extracting skills
    const allCompanies = await User.find({
      _id: { $ne: mongoose.Types.ObjectId(ownerId) },
      userType: "client",
    });

    allCompanies.forEach(async (user) => {
      const switchObj = {
        notificationType: "resourcePosted",
        // notificationMessage: `"${user?.project?.projectTitle}" posted by  ${user?.user?.fullName}`,
        notificationMessage: `${newUserSave?.fullName}`,

        responseMessage: "resource posted",
      };
      const notification = await setNotification({
        triggeredBy: ownerId,
        notify: user?._id,
        notificationMessage: switchObj.notificationMessage,
        resourceId: newUserSave?._id,
        notificationType: switchObj?.notificationType,
      });
    });

    return {
      message: "Resource added successfully",
      userDetails: newUserSave,
      status: 200,
    };
  }
};

module.exports = {
  addResourcesServices,
};

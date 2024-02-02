const mongoose = require("mongoose");
const { User, Shortlist, Invitation, Notification } = require("../models");
const { uploadFile } = require("../utils/awsUpload");

const addResourcesServices = async ({
  firstName,
  lastName,
  // email,
  designation,
  skills,
  availiability,
  ownerId,
  experience,
  files,
  budget,
}) => {
  // const existingUser = await User.findOne({ email });
  // if (existingUser) {
  //   return {
  //     status: 404,
  //     message: "This email is already taken",
  //   };
  // }

  const owner = await User.findOne({
    _id: ownerId,
    isDeleted: false,
    userType: "client",
  });
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
    // email,
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

    // const allCompanies = await User.find({
    //   _id: { $ne: mongoose.Types.ObjectId(ownerId) },
    //   userType: "client",
    // });

    // allCompanies.forEach(async (user) => {
    //   const switchObj = {
    //     notificationType: "resourcePosted",
    //     // notificationMessage: `"${user?.project?.projectTitle}" posted by  ${user?.user?.fullName}`,
    //     notificationMessage: `${newUserSave?.fullName}`,

    //     responseMessage: "resource posted",
    //   };
    //   const notification = await setNotification({
    //     triggeredBy: ownerId,
    //     notify: user?._id,
    //     notificationMessage: switchObj.notificationMessage,
    //     resourceId: newUserSave?._id,
    //     notificationType: switchObj?.notificationType,
    //   });
    // });

    return {
      message: "Resource added successfully",
      userDetails: newUserSave,
      status: 200,
    };
  }
};

const getResourceByIdService = async ({ resourceId }) => {
  const resource = await User.findOne({
    _id: resourceId,
    isDeleted: false,
    userType: "user",
  })
    .select({
      otp: 0,
      password: 0,
    })
    .populate({
      path: "designation",
    })
    .populate({
      path: "skills",
    })

    .populate({
      path: "portfolioProjects.skills",
      model: "category",
    });

  if (!resource) {
    return {
      status: 404,
      message: "No company found",
    };
  }

  return {
    status: 200,
    message: "Fetched resource successfully",
    resource,
  };
};

const updateResourceService = async ({
  resourceId,
  availability,
  budget,
  email,
  designation,
  totalExperience,
  experience,
  fullName,
  briefExperience,
  phoneNumber,
  skills,
  files,
}) => {
  if (!skills || !skills.length > 0) {
    return { status: 400, message: "Please provide skills properly" };
  }

  if (!resourceId) {
    return {
      status: 400,
      message: "Resource not found",
    };
  }

  const resource = await User.findOne({
    _id: resourceId,
    userType: "user",
    isDeleted: false,
  });

  if (!resource) {
    return { status: 404, message: "Resource not found" };
  }
  let url = null;
  if (files && files.length > 0) {  
    if (files[0].mimetype == "application/pdf") {
      url = await uploadFile(files[0], "document");
    }
  }

  const oldSkills = resource.skills || [];      
  const oldResume = resource.resume;
  const updateFields = {
    availability,
    budget,
    email,
    designation,
    totalExperience,
    experience,
    fullName,
    briefExperience,
    phoneNumber,
    skills,
    resume: url,
  };

  // Remove undefined or null fields from the updateFields object
  Object.keys(updateFields).forEach(
    (key) => updateFields[key] == null && delete updateFields[key]
  );

  const updateResourceResponse = await User.updateOne(
    { _id: resourceId },
    { $set: updateFields }
  );

  if (updateResourceResponse.ok === 1 && updateResourceResponse.nModified > 0) {
    //update skills and resumes  of the owner

    const owner = await User.findOne({
      _id: resource.owner,
      userType: "client",
      isDeleted: false,
    });

    if (owner) {
      // Find skills to be removed (present in oldSkills but not in updated skills)

      const skillsToBeRemoved = oldSkills.filter(
        (oldSkill) =>
          !skills.some((newSkill) =>
            mongoose.Types.ObjectId(newSkill).equals(
              mongoose.Types.ObjectId(oldSkill)
            )
          )
      );

      const skillsToBeAdded = skills.filter(
        (newSkill) =>
          !oldSkills.some((oldSkill) =>
            mongoose.Types.ObjectId(oldSkill).equals(
              mongoose.Types.ObjectId(newSkill)
            )
          )
      );

      // Update the owner with skills to be removed and skills to be added
      await User.updateOne(
        { _id: resource.owner },
        {
          $pull: {
            skills: { $in: skillsToBeRemoved },
            resumes: oldResume,
          },
        }
      );

      await User.updateOne(
        { _id: resource.owner },
        {
          $addToSet: {
            skills: { $each: skillsToBeAdded },
            resumes: url,
          },
        }
      );
    }

    return { status: 200, message: "Resource successfully updated" };
  } else {
    return {
      status: 500,
      message: "Failed to update",
    };
  }
};

const deleteResourceService = async ({ resourceId }) => {
  if (!resourceId) {
    return {
      status: 400,
      message: "Resource not found",
    };
  }

  const resource = await User.findOne({
    _id: resourceId,
    userType: "user",
    isDeleted: false,
  });

  if (!resource) {
    return { status: 400, message: "Resource not found" };
  }
  const updateResourceResponse = await User.updateOne(
    { _id: resourceId },
    { $set: { isDeleted: true } }
  );

  if (updateResourceResponse.ok === 1 && updateResourceResponse.nModified > 0) {
    //remove from the owner team
    const updateOwner = await User.findOneAndUpdate(
      { _id: resource.owner },
      {
        $pull: {
          team: { $in: resource._id },
        },
      }
    );
    const owner = await User.findOne({
      _id: resource.owner,
      userType: "client",
      isDeleted: false,
    }).populate("team");

    // Find unique skills of the deleted resource
    const resourceSkills = resource.skills;

    // Find unique skills of the deleted resource
    const uniqueSkills = resourceSkills.filter((resourceSkill) => {
      // Check if the skill is not present in any other team member
      return !owner.team.some((teamMember) =>
        teamMember.skills.some((teamMemberSkill) =>
          teamMemberSkill.equals(resourceSkill)
        )
      );
    });
    const invites = await Invitation.find(
      { resourceId: resource._id },
      {
        active: true,
      }
    );
    const inviteId = invites.map((invite) => invite._id);

    const removeFromSkillsResponse = await User.updateOne(
      { _id: resource.owner },
      {
        $pull: {
          skills: { $in: uniqueSkills },
          invitationsSent: { $in: inviteId },
          resumes: { $in: resource.resume },
          team: { $in: resource._id },
        },
      }
    );

    const updateShortlist = await Shortlist.updateMany(
      { resource: resource._id },
      {
        active: false,
        isDeleted: true,
      }
    );

    //get inviations

    const updateInvite = await Invitation.updateMany(
      { resourceId: resource._id },
      {
        active: false,
        isDeleted: true,
      }
    );
    const updateNotification = await Notification.updateMany(
      { resourceId: resource._id },
      {
        isDeleted: true,
      }
    );
    return { status: 200, message: "Resource successfully updated" };
  } else {
    return {
      status: 500,
      message: "Something went wrong",
    };
  }
};

module.exports = {
  addResourcesServices,
  deleteResourceService,
  getResourceByIdService,
  updateResourceService,
};

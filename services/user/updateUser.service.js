const { User } = require("../../models");

const addExperienceOfCompanyService = async ({
  companyId,
  title,
  description,
  skills,
}) => {
  //updating

  const project = { title, description, skills };
  const companyUpdate = await User.findByIdAndUpdate(
    companyId,
    {
      $push: {
        portfolioProjects: {
          title: title,
          description: description,
          skills: skills,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  // Check if the update was successful
  if (!companyUpdate) {
    return {
      status: 500,
      message: "Update failed",
    };
  } else {
    return {
      companyUpdate,
      status: 200,
      message: "Project added successfully",
    };
  }
};

const updateExperienceOfCompanyService = async ({
  title,
  portFolioProjectId,
  description,
  skills,
  companyId,
}) => {
  const userUpdate = await User.findOneAndUpdate(
    {
      _id: companyId,
      "portfolioProjects._id": portFolioProjectId,
    },
    {
      $set: {
        "portfolioProjects.$.title": title,
        "portfolioProjects.$.description": description,
        "portfolioProjects.$.skills": skills,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  // Check if the update was successful
  if (!userUpdate) {
    return {
      status: 500,
      message: "Failed to update",
    };
  } else {
    return {
      status: 200,
      message: "Company experience updated successfully",
    };
  }
};
const deleteExperienceOfCompanyService = async ({
  portFolioProjectId,

  companyId,
}) => {
  const projectIdToDelete = "your-project-id-here"; // Replace with the actual project ID

  const userUpdate = await User.findOneAndUpdate(
    { _id: companyId },
    {
      $pull: {
        portfolioProjects: { _id: portFolioProjectId },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  // Check if the update was successful
  if (!userUpdate) {
    return {
      status: 500,
      message: "update failed",
    };
  } else {
    return {
      status: 200,
      message: "Company updated successfully",
    };
  }
};
module.exports = {
  addExperienceOfCompanyService,
  updateExperienceOfCompanyService,
  deleteExperienceOfCompanyService,
};

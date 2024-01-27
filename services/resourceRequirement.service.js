const { User, ResourceRequirement } = require("../models");
const { setNotification } = require("./notification.service");
const {
  getMatchedCompaniesForResourcesRequirements,
} = require("./utility.service");

const postResourceRequirementService = async ({
  title,
  skills,
  experience,
  postedBy,
  budget,
  availability,
}) => {
  const company = await User.findOne({ _id: postedBy, userType: "client" });

  if (!company) {
    return {
      status: 404,
      message: "Company not found",
    };
  }

  const resourceRequirement = new ResourceRequirement({
    title,
    skills,
    experience,
    postedBy,
    budget,
    availability,
  });

  const err = resourceRequirement.validateSync();
  if (err) {
    return {
      message: `Something went Wrong`,
      status: 400,
      err,
    };
  } else {
    const resourceRequirementSave = await resourceRequirement.save();

    //sending notification to the company when resources added

    //extracting getling matching companies
    const matchingCompanies = await getMatchedCompaniesForResourcesRequirements(
      resourceRequirementSave.skills,
      company._id
    );

    matchingCompanies.forEach(async (user) => {
      const switchObj = {
        notificationType: "requirementPosted",
        // notificationMessage: `"${user?.project?.projectTitle}" posted by  ${user?.user?.fullName}`,
        notificationMessage: `${resourceRequirementSave?.title} posted by ${company.fullName}`,

        responseMessage: "resource posted",
      };
      const notification = await setNotification({
        triggeredBy: company._id,
        notify: user?.user?._id,
        notificationMessage: switchObj.notificationMessage,
        notificationType: switchObj?.notificationType,
      });
    });

    return {
      message: "Resource added successfully",
      userDetails: resourceRequirementSave,
      status: 200,
    };
  }
};

module.exports = { postResourceRequirementService };

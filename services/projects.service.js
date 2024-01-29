const mongoose = require("mongoose");
const {
  User,
  Project,
  Application,
  HireRequest,
  Notification,
} = require("../models");
const {
  pagination,
  getMatchedCompanies,
} = require("../services/utility.service");
const { setNotification } = require("./notification.service");
const { userSelect, applicationSelect } = require("./service.constants");
const { getMatchedUsers } = require("./users.service");
const createProjectService = async (bodyArgs) => {
  const project = new Project({
    ...bodyArgs,
  });
  const err = await project.validateSync();
  if (err) {
    console.log(err);
    return {
      status: 400,
      message: "Something went wrong",
      err,
    };
  } else {
    const projectSave = await project.save();
    const userUpdate = await User.findOneAndUpdate(
      { _id: projectSave?.postedBy },
      { $push: { projects: projectSave?._id } },
      {
        runValidators: true,
        new: true,
      }
    );

    //creating notification

    const allUsersArrays = await getMatchedCompanies(
      projectSave?._id,
      projectSave?.postedBy
    );

    const allUsers = allUsersArrays.flat();
    allUsers.forEach(async (user) => {
      const switchObj = {
        notificationType: "projectPosted",
        // notificationMessage: `"${user?.project?.projectTitle}" posted by  ${user?.user?.fullName}`,
        notificationMessage: `"${user?.project?.projectTitle}" posted`,

        responseMessage: "Project posted",
      };
      const notification = await setNotification({
        triggeredBy: projectSave?.postedBy,
        notify: user?.user?._id,
        notificationMessage: switchObj.notificationMessage,
        projectId: projectSave?._id,
        notificationType: switchObj?.notificationType,
      });
    });

    return {
      status: 200,
      message: "Project added",
      projectId: projectSave?._id,
      title: projectSave?.projectTitle,
      user: userUpdate?.userName,
    };
  }
};
const getAllProjectsService = async ({ filter, page, size, conditions }) => {
  const { limit, skip } = pagination({ page, size });
  const { maxBudget, minBudget, duration, skill, sort } = filter;
  console.log(filter);
  if (maxBudget !== null && minBudget !== null) {
    conditions = {
      ...conditions,
      "budget.maxPrice": {
        $gte: minBudget,
        $lte: maxBudget,
      },
    };
  }
  if (duration && duration !== null) {
    conditions = {
      ...conditions,
      // Add conditions for budget filtering
      duration: { $lte: duration },
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
  const count = await Project.find({ isDeleted: false, ...conditions }).count();
  const totalPages = count / size;
  const projects = await Project.find({
    isDeleted: false,
    ...conditions,
  })
    .skip(skip)
    .limit(limit)
    .sort(sorted)
    .populate({
      path: "appliedBy.userId",
      model: "user",
      select: userSelect,
    })
    .populate({
      path: "appliedBy.applicationId",
      model: "application",
      select: applicationSelect,
    })
    .populate({
      path: "postedBy",
      model: "user",
      select: userSelect,
    })
    .populate({
      path: "hireRequests.freelancerId",
      model: "user",
      select: userSelect,
    })
    .populate({
      path: "hireRequests.hireRequest",
      model: "hireRequest",
    })
    .populate({
      path: "hired.freelancerId",
      model: "user",
      select: userSelect,
    })
    .populate({
      path: "skills",
      model: "category",
    });
  if (projects.length >= 1) {
    const skills = projects.reduce(
      (a, c) => [...new Set([...a, ...c.skills])],
      []
    );
    const education = projects.reduce(
      (a, c) => [...new Set([...a, ...c.education])],
      []
    );
    const visibility = projects.reduce(
      (a, c) => [...new Set([...a, ...c.visibility])],
      []
    );
    return {
      status: 200,
      message: "Projects List",
      projects,
      totalPages,
      page,
      filter: {
        skills,
        education,
        visibility,
      },
    };
  } else {
    return {
      status: 400,
      message: "Bad Request",
    };
  }
};

const getProjectByIdService = async ({ projectId }) => {
  const project = await Project.findById(projectId)
    .populate("postedBy")
    .populate({
      path: "appliedBy.userId",
      select: userSelect,
    })
    .populate({
      path: "appliedBy.applicationId",
      select: applicationSelect,
    })
    .populate({
      path: "postedBy",
      select: userSelect,
    })
    .populate({
      path: "hireRequests.freelancerId",
      select: userSelect,
    })
    .populate({
      path: "hireRequests.hireRequest",
    })
    .populate({
      path: "hired.freelancerId",
      select: userSelect,
    })
    .populate({
      path: "skills",
      select: "_id title  ",
    });
  if (!project) {
    return { status: 404, message: "No project found" };
  } else {
    return {
      status: 200,
      message: "fetched project successfully",
      project,
    };
  }
};
const editProjectService = async ({
  projectTitle,
  description,
  projectId,
  skills,
  education,
  workLocation,
  softwareRequirements,
  freelancersCount,
  visibility,
  postedBy,
  budget,
  duration,
}) => {
  const project = await Project.findByIdAndUpdate(projectId, {
    projectTitle,
    description,
    skills,
    education,
    workLocation,
    softwareRequirements,
    freelancersCount,
    visibility,
    postedBy,
    budget,
    duration,
  });
  if (project) {
    return {
      status: 200,
      message: "Project updated successfully",
    };
  } else {
    return {
      status: 400,
      message: "Something went wrong",
    };
  }
};

const getValidProjects = async ({ clientId, freelancerId }) => {
  const projects = await Project.find({
    postedBy: clientId,
    $nor: [
      { "hireRequests.freelancerId": freelancerId },
      { "hired.freelancerId": freelancerId },
    ],
  }).exec();
  return { status: 200, message: "Get data", projects };
};

const getProjectByClientIdService = async ({
  page,
  size,
  clientId,
  projectType,
}) => {
  const { limit, skip } = pagination({ page, size });
  let projects = [];

  if (projectType === "done") {
    const count = await Project.find({
      postedBy: clientId,
      isDeleted: false,
      projectProgress: "done",
    }).count();
    const totalPages = count / size;
    projects = await Project.find(
      {
        isDeleted: false,

        projectProgress: "done",
      },
      {},
      { limit, skip }
    )

      .populate("skills")

      .sort({ createdAt: -1 })
      .exec();
    return {
      status: 200,
      totalPages,
      page,
      message: "Projects fetched successfully",
      projects,
    };
  } else if (projectType === "working") {
    const count = await Project.find({
      isDeleted: false,
      projectProgress: "wokring",
    }).count();
    const totalPages = count / size;
    projects = await Project.find(
      {
        isDeleted: false,

        projectProgress: "working",
      },
      {},
      { limit, skip }
    )

      .sort({ createdAt: -1 })
      .exec();
    return {
      status: 200,
      totalPages,
      page,
      message: "Projects fetched successfully",
      projects,
    };
  } else {
    const count = await Project.find({
      postedBy: clientId,
      isDeleted: false,
    }).count();
    const totalPages = count / size;

    projects = await Project.find(
      { postedBy: clientId, isDeleted: false },
      {},
      { limit, skip }
    )
      .populate("skills")

      .sort({ createdAt: -1 })
      .exec();

    return {
      status: 200,
      totalPages,
      page,
      message: "Projects fetched successfully",
      projects,
    };
  }
};

async function getMatchedProjects(company) {
  try {
    const projects = await Project.find({ postedBy: company._id });

    const companySkills = company.skills.map((skill) => skill._id);

    const matchingProjects = await Project.find({
      postedBy: { $ne: mongoose.Types.ObjectId(company._id) },
      skills: { $in: companySkills },
    })
      .populate("skills")
      .populate("postedBy");

    // Step 4: Calculate matching score for each user
    const projectWithScore = matchingProjects.map((project) => {
      let matchingScore = 0;
      project.skills.forEach((projectSkill) => {
        if (company?.skills.includes(projectSkill._id)) {
          matchingScore++;
        }
      });
      const matchingPercentage = (matchingScore / companySkills.length) * 100;

      const formattedPercentage = matchingPercentage.toFixed(2);

      return {
        matchingPercentage: formattedPercentage,
        project,
        matchingScore,
      };
    });

    return projectWithScore;
  } catch (error) {
    throw error;
  }
}
const getProjectInFeedService = async ({ companyId, page, size }) => {
  const company = await User.findOne({
    _id: companyId,
    isDeleted: false,
    userType: "client",
  });
  if (!company) {
    return {
      status: 404,
      message: "No Company found",
    };
  }

  const result = await getMatchedProjects(company);

  const allProjectArrays = await Promise.all(result);
  const allProjects = allProjectArrays.flat(); // Flatten the array

  const sortedProjects = allProjects.sort(
    (a, b) => parseInt(b.matchingPercentage) - parseInt(a.matchingPercentage)
  );

  const startIndex = (page - 1) * size;
  const endIndex = page * size;
  const projects = sortedProjects.slice(startIndex, endIndex);
  const totalPages = allProjects.length / parseInt(size);

  //sending  notification

  return {
    status: 200,
    page: page,
    totalPages,
    message: "Feed updated successfully",
    projects: projects,
  };
};

const deleteProjectService = async ({ projectId }) => {
  if (!projectId) {
    return {
      status: 404,
      message: "Bad Request",
    };
  }

  const project = await Project.findByIdAndUpdate(projectId, {
    isDeleted: true,
  });
  return {
    status: 200,
    message: "Project deleted successfully",
  };
};

const deleteProjectById = async ({ projectId }) => {
  const updatedProject = await Project.findByIdAndUpdate(
    { _id: projectId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!updatedProject) {
    return { status: 404, message: "No project found" };
  }

  //updating the applications
  const application = await Application.updateMany(
    { projectId, active: true },
    { $set: { active: false } }
  );

  //updating hire request
  const hireRequest = await HireRequest.updateMany(
    { projectId, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  const notification = await Notification.updateMany(
    { projectId, isRead: false },
    { $set: { isRead: true } }
  );

  //clear notifications

  return {
    status: 200,
    message: "Project deleted successfully",
    deletedProject: updatedProject,
  };
};

const updateProjectStatusService = async ({ projectId, status }) => {
  const project = await Project.findById(projectId);

  if (!status) {
    return {
      status: 404,
      message: "Please provide status",
    };
  }

  if (!project) {
    return {
      status: 404,
      message: "Project not found",
    };
  }

  if (status === "OPEN") {
    const project = await Project.findOneAndUpdate(
      { projectId, active: true },
      { $set: { projectProgress: "OPEN" } }
    );
  } else if (status === "WORKING") {
    const project = await Project.findOneAndUpdate(
      { projectId, active: true },
      { $set: { projectProgress: "WORKING" } }
    );
  } else if (status === "DONE") {
    const project = await Project.findOneAndUpdate(
      { projectId, active: true },
      { $set: { projectProgress: "DONE" } }
    );
  }

  return {
    status: 200,
    message: "Project progress updated successfully",
  };
};

module.exports = {
  createProjectService,
  getProjectInFeedService,
  getAllProjectsService,
  editProjectService,
  getProjectByClientIdService,
  getProjectByIdService,
  getValidProjects,
  deleteProjectService,
  deleteProjectById,
  updateProjectStatusService,
};

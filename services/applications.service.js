const { Application, Project, User } = require("../models");
const mongoose = require("mongoose");
const { pagination, queryConditions } = require("../services/utility.service");
const { application } = require("express");
const { userSelect } = require("./service.constants");
const sortApplications = async (condition, filters) => {
  let sortQuery = {};
  let sortedApplications = [];
  switch (condition) {
    case "mostReviews":
      const applicationsReviewsMost = await Application.find(filters)
        .populate("userId")
        .exec();

      sortedApplications = applicationsReviewsMost.sort((a, b) => {
        const reviewsA = a.userId.reviews.length || 0;
        const reviewsB = b.userId.reviews.length || 0;
        return reviewsB - reviewsA;
      });
      break;
    case "leastReviews":
      const applicationsReviewsLeast = await Application.find(filters)
        .populate("userId")
        .exec();

      sortedApplications = applicationsReviewsLeast.sort((a, b) => {
        const reviewsA = a.userId.reviews.length || 0;
        const reviewsB = b.userId.reviews.length || 0;
        return reviewsA - reviewsB;
      });
      break;
    case "highestHourlyRate":
      sortedApplications = await Application.find(filters)
        .populate("userId")
        .sort({ bid: "desc" })
        .exec();

      break;
    case "lowestHourlyRate":
      sortedApplications = await Application.find(filters)
        .populate("userId")
        .sort({ bid: 1 })
        .exec();

      break;
    case "highestAverageRating":
      const applicationshigh = await Application.find(filters)
        .populate("userId")
        .exec();
      sortedApplications = applicationshigh.sort((a, b) => {
        const ratingA = a.userId.averageRating || 0;
        const ratingB = b.userId.averageRating || 0;
        return ratingB - ratingA;
      });
      break;
    case "lowestAverageRating":
      const applicationslow = await Application.find(filters)
        .populate("userId")
        .exec();
      sortedApplications = applicationslow.sort((a, b) => {
        const ratingA = a.userId.averageRating || 0;
        const ratingB = b.userId.averageRating || 0;
        return ratingA - ratingB;
      });
      break;
    default:
      // Default sorting condition
      sortedApplications = await Application.find(filters)
        .populate("userId")
        .sort({ createdAt: 1 })
        .exec();
      break;
  }

  return sortedApplications;
};
/* const sortApplications = async (condition, filters) => {
  let sortQuery = {};
  let sortedApplications = [];
  switch (condition) {
    case "mostReviews":
      const applicationsReviewsMost = await Application.find(filters)
        .populate("userId")
        .exec();

      sortedApplications = applicationsReviewsMost.sort((a, b) => {
        const reviewsA = a.userId.reviews.length || 0;
        const reviewsB = b.userId.reviews.length || 0;
        return reviewsB - reviewsA;
      });
      break;
    case "leastReviews":
      const applicationsReviewsLeast = await Application.find(filters)
        .populate("userId")
        .exec();

      sortedApplications = applicationsReviewsLeast.sort((a, b) => {
        const reviewsA = a.userId.reviews.length || 0;
        const reviewsB = b.userId.reviews.length || 0;
        return reviewsA - reviewsB;
      });
      break;
    case "highestHourlyRate":
      sortedApplications = await Application.aggregate([
        {
          $match: {
            projectId: mongoose.Types.ObjectId(filters.projectId),
            bid: { $gte: 50, $lte: 400 },

            // Convert projectId to ObjectId if needed
          },
        },

        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "project",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$project",
        },
        {
          $unwind: "$user",
        },
        {
          $sort: { bid: -1 }, // Adjust this line to sort by the bid field in the Application model
        },
      ]);

      break;
    case "lowestHourlyRate":
      sortedApplications = await Application.find(filters)
        .populate("userId")
        .sort({ bid: 1 })
        .exec();

      break;
    case "highestAverageRating":
      const applicationshigh = await Application.find(filters)
        .populate("userId")
        .exec();
      sortedApplications = applicationshigh.sort((a, b) => {
        const ratingA = a.userId.averageRating || 0;
        const ratingB = b.userId.averageRating || 0;
        return ratingB - ratingA;
      });
      break;
    case "lowestAverageRating":
      const applicationslow = await Application.find(filters)
        .populate("userId")
        .exec();
      sortedApplications = applicationslow.sort((a, b) => {
        const ratingA = a.userId.averageRating || 0;
        const ratingB = b.userId.averageRating || 0;
        return ratingA - ratingB;
      });
      break;
    default:
      // Default sorting condition
      sortedApplications = await Application.find(filters)
        .populate("userId")
        .sort({ createdAt: 1 })
        .exec();
      break;
  }

  return sortedApplications;
}; */
const getApplicationsByProjectIdService = async ({ filters, sortedBy }) => {
  console.log(filters, "filter");
  const sortedApplications = await sortApplications(sortedBy, filters);
  console.log(filters);
  console.log(sortedApplications);
  return {
    status: 200,
    message: "",
    applications: sortedApplications,
  };
};

const getApplicationsByFreelancerIdService = async ({
  freelancerId,
  bidType,
  page,
  size,
}) => {
  console.log(freelancerId, bidType);
  const { limit, skip } = pagination({ page, size });

  if (bidType === "pastBids") {
    const count = await Application.find({
      userId: freelancerId,
      active: true,
      applicationStatus: { $in: ["hired", "rejected"] },
      projectId: { $ne: null },
    }).countDocuments();
    const totalPages = count / size;
    const applications = await Application.find(
      {
        userId: freelancerId,
        active: true,
        applicationStatus: { $in: ["hired", "rejected"] },
        projectId: { $ne: null },
      },
      {},
      { limit, skip }
    )
      .populate({
        path: "projectId",

        populate: {
          path: "postedBy",
          select: userSelect,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
    return {
      status: 200,
      totalPages,
      page,
      message: "Applications fetched successfully",
      applications: applications,
    };
  } else if (bidType === "currentBids") {
    const count = await Application.find({
      userId: freelancerId,
      active: true,
      projectId: { $ne: null },
      applicationStatus: "hold",
    }).countDocuments();
    const totalPages = count / size;
    const applications = await Application.find(
      {
        userId: freelancerId,
        active: true,
        projectId: { $ne: null },
        applicationStatus: "hold",
      },
      {},
      { limit, skip }
    )
      .populate({
        path: "projectId",

        populate: {
          path: "postedBy",
          select: userSelect,
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      status: 200,
      totalPages,
      page,
      message: "Applications fetched successfully",
      applications: applications,
    };
  } else {
    const count = await Application.find({
      userId: freelancerId,
      active: true,
      projectId: { $ne: null },
    }).countDocuments();
    const totalPages = count / size;

    const applications = await Application.find(
      { userId: freelancerId, active: true, projectId: { $ne: null } },
      {},
      { limit, skip }
    )

      .populate({
        path: "projectId",

        populate: {
          path: "postedBy",
          select: userSelect,
        },
      })
      .populate("receiverId")

      .sort({ createdAt: -1 })
      .exec();

    return {
      status: 200,
      totalPages,
      page,
      message: "Applications fetched successfully",
      applications: applications,
    };
  }
};
const getAllRecivedApplicationsService = async ({ receiverId, page, size }) => {
  console.log(receiverId, "reciver");
  const { limit, skip } = pagination({ page, size });

  const count = await Application.find({
    receiverId,
    active: true,
  }).countDocuments();
  const totalPages = count / size;
  const applications = await Application.find(
    {
      receiverId,
      active: true,
    },
    {},
    { limit, skip }
  )
    .populate("projectId")
    .populate("userId")
    .sort({ createdAt: -1 })
    .exec();
  return {
    status: 200,
    totalPages,
    page,
    message: "Applications fetched successfully",
    applications: applications,
  };
};

const deleteApplicationService = async ({
  applicationId,
  freelancerId,
  projectId,
}) => {
  if (!applicationId && !freelancerId) {
    return {
      status: 404,
      message: "Bad Request",
    };
  }

  const application = await Application.findByIdAndUpdate(applicationId, {
    active: false,
  });

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: {
        appliedBy: {
          userId: freelancerId,
          applicationId: applicationId,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );
  const updatedUser = await User.findByIdAndUpdate(
    freelancerId,
    {
      $pull: {
        applications: {
          projectId: projectId,
          applicationId: applicationId,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );
  return {
    status: 200,
    message: "Applications deleted successfully",
  };
};

module.exports = {
  getApplicationsByFreelancerIdService,
  getApplicationsByProjectIdService,
  deleteApplicationService,
  getAllRecivedApplicationsService,
};

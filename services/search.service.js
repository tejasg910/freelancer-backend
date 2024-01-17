/* const { Project, Category } = require("../models");
const { pagination } = require("./utility.service");
const { projectGenericSelect } = require("./service.constants");

const searchService = async ({
  searchString,
  page = 1, // Default to page 1 if not provided
  size = 10 // Default to 10 results per page if not provided
}) => {
  try {
    const { limit, skip } = pagination({ page, size });

    const stringQuery = searchString.length >= 3 && { "$text": { "$search": searchString } };

    const skillsQuery = { ...stringQuery };
    const skills = await Category.find(skillsQuery);

    const skillIds = skills.map((skill) => skill._id);

    const matchStage = {
      $match: {
        isDeleted: false,
        skills: { $in: skillIds }
      }
    };

    const lookupStages = [
      {
        $lookup: {
          from: "categories",
          localField: "skills",
          foreignField: "_id",
          as: "skills"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy"
        }
      }
    ];

    const projectProjection = {
      $project: {
        "_id": 1,
        "projectTitle": 1,
        "description": 1,
        "skills._id": 1,
        "skills.title": 1,
        "postedBy.fullName": 1,
        // "postedBy.firstName": 1,
        // "postedBy.lastName": 1,
        "postedBy.profilePic": 1,
        "postedBy._id": 1,
        // "postedBy.userName": 1,
        "postedBy.email": 1,
        "budget": 1,
        "duration": 1,
        "createdAt": 1,
      }
    };

    const countStage = [
      {
        $count: "count"
      }
    ];

    const pipeline = [
      matchStage,
      ...lookupStages,
      projectProjection,
      {
        $facet: {
          projects: [
            { $skip: skip },
            { $limit: limit }
          ],
          count: countStage
        }
      }
    ];

    const [textSearchResults, result] = await Promise.all([
      Project.find({ ...stringQuery }).sort({ "createdAt": -1 }).skip(skip).limit(limit),
      Project.aggregate(pipeline),
    ]);

    const projects = result[0].projects;
    const totalProjectCount = result[0].count[0]?.count || 0;
    const totalProjectPages = Math.ceil(totalProjectCount / size);

    if (projects.length >= 1) {
      return {
        message: "search done",
        status: 200,
        projects,
        page,
        totalProjectPages: totalProjectPages || 1
      };
    } else {
      return {
        message: "Bad Request",
        status: 400
      };
    }
  } catch (error) {
    console.error("Error in searchService:", error);
    return {
      message: "Internal Server Error",
      status: 500
    };
  }
};

module.exports = {
  searchService
};


//  */

const mongoose = require("mongoose");
const { Project, Category, User } = require("../models");
const { pagination } = require("./utility.service");

const searchService = async ({
  searchString,
  page,
  size,
  budgetMin = null,
  budgetMax = null,
  skill,
}) => {
  const isSearchValid = searchString && searchString.length >= 3;
  const { limit, skip } = pagination({ page, size });

  const stringQuery = isSearchValid ? { $text: { $search: searchString } } : {};
  const stringScore = isSearchValid ? { score: { $meta: "textScore" } } : {};

  const skillsQuery = { ...stringQuery };
  const skills = await Category.find(skillsQuery);
  const skillIds = skills.map((skill) => skill._id);

  const budgetQuery =
    budgetMin !== null && budgetMax !== null
      ? {
          "budget.minPrice": { $gte: budgetMin },
          "budget.maxPrice": { $lte: budgetMax },
        }
      : {};

  const matchStage = {
    $match: {
      $or: [
        { $text: { $search: searchString } },
        {
          skills: { $in: skillIds },
        },
      ],
    },
  };

  const userAggregationPipeline = [
    matchStage,
    {
      $lookup: {
        from: "categories",
        localField: "skills",
        foreignField: "_id",
        as: "skills",
      },
    },
    {
      $project: {
        _id: 1,
        userType: 1,
        email: 1,
        fullName: 1,
        intro: 1,
        profilePic: 1,
        address: 1,
        "skills._id": 1,
        "skills.title": 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1, ...stringScore } },
    { $skip: skip },
    { $limit: limit },
  ];

  const projectAggregationPipeline = [
    matchStage,
    { $sort: { createdAt: -1, ...stringScore } },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedBy",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "skills",
        foreignField: "_id",
        as: "skills",
      },
    },
    {
      $project: {
        _id: 1,
        projectTitle: 1,
        description: 1,
        "skills._id": 1,
        "skills.title": 1,
        duration: 1,
        "postedBy._id": 1,
        "postedBy.fullName": 1,
        createdAt: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  const [users, projects] = await Promise.all([
    User.aggregate(userAggregationPipeline),
    Project.aggregate(projectAggregationPipeline),
  ]);

  console.log("websites");

  const [userCount, projectCount] = await Promise.all([
    User.countDocuments({ ...stringQuery }),
    Project.countDocuments({ ...stringQuery, skills: { $in: skillIds } }),
  ]);

  const totalUserPages = Math.ceil(userCount / size);
  const totalProjectPages = Math.ceil(projectCount / size);

  return users.length >= 1 || projects.length >= 1
    ? {
        message: "search done",
        status: 200,
        users,
        projects,
        page,
        totalUserPages,
        totalProjectPages,
      }
    : {
        message: "Bad Request",
        status: 400,
      };
};

module.exports = {
  searchService,
};

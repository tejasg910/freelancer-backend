const mongoose = require("mongoose");
const { Project, Category, User } = require("../models");
const { pagination } = require("./utility.service");

const searchService = async ({
  searchString,
  page,
  size,
  minBudget,
  maxBudget,
  availability,
}) => {
  try {
    console.log(minBudget, maxBudget, availability);

    console.log(page, size)

    const isSearchValid = searchString && searchString.length >= 3;
    const { limit, skip } = pagination({ page, size });

    const stringQuery = isSearchValid
      ? { $text: { $search: searchString } }
      : {};
    const stringScore = isSearchValid ? { score: { $meta: "textScore" } } : {};

    const skillsQuery = { ...stringQuery };

    const skills = await Category.find(skillsQuery);
    const skillIds = skills.map((skill) => skill._id);

    const availabilityQuery =
      availability === "" ? {} : { availability: availability };

    // console.log(availabilityQuery);

    const budgetQuery =
      minBudget !== null && maxBudget !== null
        ? {
          $and: [
            { "budget.minPrice": { $gte: minBudget } },
            { "budget.maxPrice": { $lte: maxBudget } },
          ],
        }

        : {};

    const matchStage = {
      $match: {
        $or: [
          { $text: { $search: searchString } },

          { skills: { $in: skillIds } },

        ]
      },
    };

    const userAggregationPipeline = [
      {
        $match: {
          $or: [
            { $text: { $search: searchString } },

            { skills: { $in: skillIds } },

          ]
        },
      },
      {
        $match: {
          budget: { $lte: maxBudget },
          // budget: { $gte: maxBudget - minBudget }
        },
      },
      // {
      //   $match: {
      //     // availabilityQuery
      //   },
      // },
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
          budget: 1,
          availability: 1,
          "experience.duration": 1,
          "skills._id": 1,
          "skills.title": 1,
          createdAt: 1,
          fullDocument: "$$ROOT",
        },
      },
      { $sort: { createdAt: -1, ...stringScore } },

    ];

    const projectAggregationPipeline = [
      matchStage,
      {
        $match: budgetQuery,
      },
      // {
      //   $match: availabilityQuery,
      // },
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
          budget: 1,
          "postedBy._id": 1,
          "postedBy.fullName": 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1, ...stringScore } },
    ];

    const [users, projects] = await Promise.all([
      await User.aggregate(userAggregationPipeline),
      await Project.aggregate(projectAggregationPipeline),
    ]);

    /*   console.log("websites");
     
      const [userCount, projectCount] = await Promise.all([
        User.countDocuments({ ...stringQuery }),
        Project.countDocuments({ ...stringQuery, skills: { $in: skillIds } }),
      ]);
     */

    const paginatedUsers = users.slice(skip, skip + limit);
    const paginatedProjects = projects.slice(skip, skip + limit);



    const totalUserPages = Math.ceil(users.length / size);
    const totalProjectPages = Math.ceil(projects.length / size);


    return users.length >= 1 || projects.length >= 1
      ? {
        message: "search done",
        status: 200,
        users: paginatedUsers,
        projects: paginatedProjects,
        page,
        totalUserPages,
        totalProjectPages,
      }
      : {
        message: "Bad Request",
        status: 400,
      };
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  searchService,
};

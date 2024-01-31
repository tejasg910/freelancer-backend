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
  skill,
  experience,
  sort,
  duration,
}) => {
  try {
    console.log(
      minBudget,
      maxBudget,
      availability,
      skill,
      duration,
      experience,
      sort
    );
    const isSearchValid = searchString && searchString.length >= 3;
    const { limit, skip } = pagination({ page, size });
    const stringQuery = isSearchValid
      ? { $text: { $search: searchString } }
      : {};
    const stringScore = isSearchValid ? { score: { $meta: "textScore" } } : {};
    const skillsQuery = { ...stringQuery };
    const skills = await Category.find(skillsQuery);
    const skillIds = skills.map((skill) => skill._id);
    const ObjSkill = skill ? mongoose.Types.ObjectId(skill) : "";
    console.log(ObjSkill);
    const matchStage = {
      $match: {
        $or: [
          { $text: { $search: searchString } },
          { skills: { $in: skillIds } },
        ],
      },
    };
    /* -------------Resource Pipeline ----------------- */
    const userAggregationPipeline = [];
    userAggregationPipeline.push(matchStage);
    userAggregationPipeline.push({
      $match: {
        isDeleted: false,
        userType: "user",
      },
    });
    //-------------Budget Filter Resources
    if (minBudget !== null && maxBudget !== null && minBudget <= maxBudget) {
      userAggregationPipeline.push({
        $match: {
          budget: {
            $gte: minBudget,
            $lte: maxBudget,
          },
        },
      });
    }
    // Add availability filter Resources
    if (availability && availability !== undefined) {
      userAggregationPipeline.push({
        $match: { availability: { $lte: parseInt(availability) } },
      });
    }
    // Add experience filter Resources
    if (experience && experience !== undefined) {
      userAggregationPipeline.push({
        $match: { totalExperience: { $lte: parseInt(experience) } },
      });
    }
    //-----------Skill Filer Resources
    if (skill !== "" && ObjSkill) {
      userAggregationPipeline.push({ $match: { skills: { $eq: ObjSkill } } });
    }
    // -----------  Pipeline Default stage Resources
    userAggregationPipeline.push(
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
          totalExperience: 1,
          "experience.duration": 1,
          "skills._id": 1,
          "skills.title": 1,
          createdAt: 1,
          fullDocument: "$$ROOT",
        },
      }
    );
    // -----------  Sort filter stage Resources
    if (sort === "newest") {
      userAggregationPipeline.push({
        $sort: { createdAt: -1 }, // Sort by createdAt field in descending order for newest
      });
    } else if (sort === "oldest") {
      userAggregationPipeline.push({
        $sort: { createdAt: 1 }, // Sort by createdAt field in ascending order for oldest
      });
    } else if (!sort || sort === "") {
      userAggregationPipeline.push({ $sort: { ...stringScore } });
    } else {
      userAggregationPipeline.push({ $sort: { ...stringScore } });
    }
    /* -------------Project Pipeline ----------------- */
    const projectAggregationPipeline = [];
    projectAggregationPipeline.push(matchStage);
    projectAggregationPipeline.push({
      $match: {
        isDeleted: false,
      },
    });
    // ------------ Budget Filter Project
    if (minBudget !== null && maxBudget !== null) {
      projectAggregationPipeline.push({
        $match: {
          // "budget.minPrice": { $gte: minBudget },
          "budget.maxPrice": {
            $gte: minBudget,
            $lte: maxBudget,
          },
        },
      });
    }
    // ------------ Duration Filter Project
    if (duration && duration !== null) {
      projectAggregationPipeline.push({
        $match: { duration: { $lte: duration } },
      });
    }
    // ------------ Skill Filter Project
    if (skill !== "" && ObjSkill) {
      projectAggregationPipeline.push({
        $match: { skills: { $eq: ObjSkill } },
      });
    }
    // -----------  Pipeline Default stage Project
    projectAggregationPipeline.push(
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
      }
    );
    // -----------  Sort filter stage Project
    if (sort === "newest") {
      projectAggregationPipeline.push({
        $sort: { createdAt: -1 }, // Sort by createdAt field in descending order for newest
      });
    } else if (sort === "oldest") {
      projectAggregationPipeline.push({
        $sort: { createdAt: 1 }, // Sort by createdAt field in ascending order for oldest
      });
    } else if (!sort || sort === "") {
      projectAggregationPipeline.push({ $sort: { ...stringScore } });
    } else {
      projectAggregationPipeline.push({ $sort: { ...stringScore } });
    }
    //----------- Applying Aggregation
    const [users, projects] = await Promise.all([
      await User.aggregate(userAggregationPipeline),
      await Project.aggregate(projectAggregationPipeline),
    ]);
    // console.log(users)
    //----------- Pagination
    const paginatedUsers = users.slice(skip, skip + limit);
    const paginatedProjects = projects.slice(skip, skip + limit);
    // ---------- Counting numbers of Documents
    const totalUserPages = Math.ceil(users.length / size);
    const totalProjectPages = Math.ceil(projects.length / size);
    // ------------- Sending Response
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

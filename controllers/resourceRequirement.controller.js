const { User } = require("../models");
const {
  postResourceRequirementService,
} = require("../services/resourceRequirement.service");

const postResourceRequirement = async (req, res) => {
  const { title, skills, experience, postedBy, budget, availability } = req.body;

  const response = await postResourceRequirementService({
    title,
    skills,
    experience,
    postedBy,
    budget,
    availability,
  });

  res.status(response.status).json({
    ...response,
  });
};

module.exports = { postResourceRequirement };

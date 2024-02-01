const mongoose = require("mongoose");

const resourceRequirementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    experience: { type: Number, required: true },
    skills: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    budget: {
      type: Number,
    },

    availability: {
      type: String,
    },

    requirementStatus: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "resourceRequirement",
  resourceRequirementSchema
);

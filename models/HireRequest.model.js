const mongoose = require("mongoose");

const hireRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: "project",
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
      // unique: true,
    },
    clientId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    duration: {
      type: Number,
    },
    hourlyRate: {
      type: Number,
    },
    description: {
      type: String,
    },
    hireRequestStatus: {
      type: String,
      enum: ["rejected", "agreed", "pending"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("hireRequest", hireRequestSchema);

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: "project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
      // unique: true,
    },
    receiverId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    bid: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      // required: true,
    },
    coverLetter: {
      type: String,
      // required: true,
    },
    attachmentLinks: [
      {
        type: String,
        // required: true,
      },
    ],
    applicationStatus: {
      type: String,
      enum: ["rejected", "hold", "hired"],
      default: "hold",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("application", applicationSchema);

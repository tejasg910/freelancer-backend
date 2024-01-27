const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    triggeredBy: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    notify: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    notificationMessage: {
      type: String,
      req: true,
    }, // project applied "project title " by "user name"
    isRead: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: "project",
    },
    hireRequestId: {
      type: mongoose.Schema.ObjectId,
      ref: "hireRequest",
    },
    resourceId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    notificationType: {
      type: String,
      enum: [
        "jobApplication",
        "hireRequest",
        "review",
        "applicantHired",
        "applicantRejected",
        "agreeHireRequest",
        "rejectedHireRequest",
        "message",
        "hired",
        "rejected",
        "projectPosted",
        "invitationReceived",
        "invitationAccepted",
        "requirementPosted",
        "resourcePosted",
      ],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationSchema);

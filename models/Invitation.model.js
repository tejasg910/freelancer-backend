const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
      // unique: true,
    },
    companyId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    budget: {
      type: Number,
    },
    rateType: {
      type: String,
    },
    avaibility: {
      type: String,
    },
    resourceOwner: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },

    invitationStatus: {
      type: String,
      enum: ["rejected", "accepted", "pending"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("invitation", invitationSchema);

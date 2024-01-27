const mongoose = require("mongoose");

const ShortListSchema = new mongoose.Schema(
  {
    resourceOwner: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    company: { type: mongoose.Schema.ObjectId, ref: "user", required: true },
    resource: { type: mongoose.Schema.ObjectId, ref: "user", required: true },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("shortlist", ShortListSchema);

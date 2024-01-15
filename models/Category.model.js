const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true
    },
    image: { type: String },
    active: { type: Boolean, default: true },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
    },
    isDeleted: { type: Boolean, default: false },
    default: [],
  },
  { timestamps: true }
);

categorySchema.index({ title: "text" })

module.exports = mongoose.model("category", categorySchema);

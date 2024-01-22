const mongoose = require("mongoose");

const DesignationSchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
    },

    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("designation", DesignationSchema);

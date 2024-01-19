const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectTitle: {
      type: String,
      //         required: true,
    },
    description: {
      type: String,
      //         required: true,
    },
    skills: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
        index: true,
      },
    ],
    /*  education: [
       {
         type: String,
       },
     ], */
    education: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "qualification",
      },
    ],
    workLocation: [
      {
        type: String,
        default: "remote",
      },
    ],
    softwareRequirements: [
      {
        type: String,
      },
    ],
    freelancersCount: {
      type: Number,
      //         required: true
    },
    duration: {
      type: String,
    },
    visibility: [
      {
        type: String,
      },
    ],

    budget: {
      minPrice: { type: Number },
      maxPrice: { type: Number },
      currency: { type: String, default: "INR" },
    },

    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    bidExpireOn: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },

    category: [
      {
        name: {
          type: String,
        },
      },
    ],

    appliedBy: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
        },
        applicationId: {
          type: mongoose.Schema.ObjectId,
          ref: "application",
        },
      },
    ],
    favByUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    hireRequests: [
      {
        freelancerId: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
        },
        hireRequest: {
          type: mongoose.Schema.ObjectId,
          ref: "hireRequest",
        },
      },
    ],
    hired: [
      {
        freelancerId: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
          // unique: true,
        },
        applicationId: {
          type: mongoose.Schema.ObjectId,
          ref: "application",
        },
        hireRequestId: {
          type: mongoose.Schema.ObjectId,
          ref: "hireRequest",
        },
      },
    ],
    projectProgress: {
      type: String,
      enum: ["OPEN", "WORKING", "DONE"],
      default: "OPEN",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

projectSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

// run this below line in mongo for full text search
// db.projects.createIndex({ "$**" : "text" })
projectSchema.index({
  projectTitle: "text",
  description: "text",
});
module.exports = mongoose.model("project", projectSchema);

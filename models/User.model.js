const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    // firstName: {
    //   type: String,
    //   // required: true,
    // },
    // lastName: {
    //   type: String,
    //   // required: true,
    // },
    // companyName: {
    //   type: String,
    //   required: true,
    // },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    userName: {
      type: String,
      // required: true,
      lowercase: true,
      trim: true,
      // unique: true,
    },
    // need to update
    userType: {
      type: String,
      enum: ["freelancer", "client"],
      default: "client",
      // required: true,
    },
    // need to remove
    occupation: {
      type: String,
      // required: true,
    },
    intro: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
    },
    profilePic: {
      type: String,
      // required: true,
      default: "profile pic",
    },
    phoneNumber: {
      type: String,
      // required: true,
    },
    profileCompleted: {
      type: Number,
      default: 20,
    },

    address: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
    },
    resumes: [
      {
        name: String,
        email: String,
      },
    ],
    team: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    socialProfiles: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    qualifications: [
      {
        degree: {
          type: mongoose.Schema.ObjectId,
          ref: "qualification",
          // required: true,
        },
      },
    ],
    skills: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
        index: true
      },
    ],

    portfolioProjects: [
      {
        title: String,

        description: String,

        skills: [
          {
            type: mongoose.Schema.ObjectId,
            ref: "category",
          },
        ],

        image_url: String,
        project_url: String,
      },
    ],
    reviews: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          default: 0,
        },
        reviewedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
          required: true,
        },
      },
    ],
    averageRating: { type: Number, default: 0 },

    reviewed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    projects: [
      // Client Posted Projects
      {
        type: mongoose.Schema.ObjectId,
        ref: "project",
      },
    ],

    applications: [
      {
        projectId: {
          type: mongoose.Schema.ObjectId,
          ref: "project",
        },
        applicationId: {
          type: mongoose.Schema.ObjectId,
          ref: "application",
        },
      },
    ],
    hireRequests: [
      {
        projectId: {
          type: mongoose.Schema.ObjectId,
          ref: "project",
        },
        clientId: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
        },
        hireRequestId: {
          type: mongoose.Schema.ObjectId,
          ref: "hireRequest",
        },
      },
    ],
    favUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    favProjects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "project",
      },
    ],
    favByUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "notification",
      },
    ],
    contacted: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    isVerified: { type: Boolean, default: false },
    otp: {
      otp: String,
      expireIn: Date,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// run this below line in mongo for full text search
// db.users.createIndex({ "$**" : "text" })
userSchema.index({
  fullName: "text",
  intro: "text"
});
module.exports = mongoose.model("user", userSchema);

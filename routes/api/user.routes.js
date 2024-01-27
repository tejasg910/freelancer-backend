const express = require("express");
const userControllers = require("../../controllers/users.controllers");
const { useTryCatch } = require("../../services/utility.service");

const router = express.Router({ mergeParams: true });

router.post("/getAllUsers", useTryCatch(userControllers.getAllUsers));
router.post(
  "/getUserByEmail",

  useTryCatch(userControllers.findByEmail)
);
router.post("/getUserById", useTryCatch(userControllers.getCompanyById));

router.post("/registerUser", useTryCatch(userControllers.registerUser));
router.post("/createResource", useTryCatch(userControllers.registerUser));

router.post("/loginUser", useTryCatch(userControllers.loginUser));
router.post("/forgotPassword", useTryCatch(userControllers.forgotPassword));
router.post("/resetPassword", useTryCatch(userControllers.resetPassword));
router.post("/resendOTP", useTryCatch(userControllers.resendOTP));
router.post("/verifyEmail", useTryCatch(userControllers.verifyEmail));

router.post("/setReview", useTryCatch(userControllers.setReview));
router.post("/getUserReviews", useTryCatch(userControllers.getUserReviews));
router.post("/readNotification", useTryCatch(userControllers.readNotification));
router.post("/setContacted", useTryCatch(userControllers.setContacted));
router.put("/updateUser", useTryCatch(userControllers.updateUser));
router.post(
  "/getCompaniesInFeed",
  useTryCatch(userControllers.getCompaniesInFeed)
);
router.post(
  "/getCompaniesByProjectIdInFeed",
  useTryCatch(userControllers.getCompaniesByProjectIdInFeed)
);
router.post("/verifyUser", useTryCatch(userControllers.verifyUser));
router.post(
  "/addExperience",
  useTryCatch(userControllers.addExperienceToCompany)
);
router.put(
  "/updateExperience",
  useTryCatch(userControllers.updateExperienceceOfCompany)
);
router.delete(
  "/deleteExperience",
  useTryCatch(userControllers.deleteExperienceOfCompany)
);

router.post("/forgotPassword", useTryCatch(userControllers.forgotPassword));

module.exports = router;

const express = require("express");
const router = express.Router({ mergeParams: true });

const projectControllers = require("../../controllers/projects.controllers");
const { useTryCatch } = require("../../services/utility.service");

router.post("/getAllProjects", useTryCatch(projectControllers.getAllProjects));
router.post("/createProject", useTryCatch(projectControllers.createProject));
router.put("/editProject", useTryCatch(projectControllers.editProject));
router.post(
  "/getProjectsByClientId",
  useTryCatch(projectControllers.getProjectByClientId)
);
router.get(
  "/getProjectById/:projectId",
  useTryCatch(projectControllers.getProjectById)
);
router.get(
  "/getvalidProjectForHire",
  useTryCatch(projectControllers.getValidProjectsForHire)
);
router.post(
  "/getProjectsInFeed",
  useTryCatch(projectControllers.getProjectsInFeed)
);
router.delete("/deleteProject", useTryCatch(projectControllers.deleteProject));
router.delete(
  "/deleteProjectById/:projectId",
  useTryCatch(projectControllers.deleteProjectByIdController)
);
module.exports = router;

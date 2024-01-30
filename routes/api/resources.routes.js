const express = require("express");
const router = express.Router({ mergeParams: true });
const { upload } = require("../../utils/multer");

const addResourcesController = require("../../controllers/resources.controller");
const { useTryCatch } = require("../../services/utility.service");

router.post("/addResources", useTryCatch(addResourcesController.addResources));
router.post(
  "/getResourceById",
  useTryCatch(addResourcesController.getResourceById)
);

router.patch(
  "/updateResource",
  useTryCatch(addResourcesController.updateResourceController)
);

router.delete(
  "/deleteResource",
  useTryCatch(addResourcesController.deleteResourceController)
);
module.exports = router;

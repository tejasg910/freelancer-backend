const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllCategories,
  insertCategory,
  getAllDesignations,
} = require("../../controllers/category.controller");

router.get("/all", getAllCategories),
  router.post("/createCategory", insertCategory);
router.get("/getAllDesignations", getAllDesignations);

module.exports = router;

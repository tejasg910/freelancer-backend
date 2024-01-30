const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllCategories,
  insertCategory,
  getAllDesignations,
  insertManyCategory,
} = require("../../controllers/category.controller");

router.get("/all", getAllCategories),
  router.post("/createCategory", insertCategory);
router.post("/insertMany", insertManyCategory);

router.get("/getAllDesignations", getAllDesignations);

module.exports = router;

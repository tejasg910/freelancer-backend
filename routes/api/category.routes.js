const express = require('express');
const router = express.Router({ mergeParams: true });

const { getAllCategories, insertCategory } = require('../../controllers/category.controller')

router.get('/all', getAllCategories),
router.post('/createCategory', insertCategory)

  module.exports = router;

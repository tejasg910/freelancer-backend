const { Category } = require('../models');
const CategoryModel = require('../models/Category.model');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find({ active: true });

    console.log(categories);
    return res.status(200).json(categories);

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const insertCategory = async (req, res, next) => {
  try {
    // const category = new Category({
    //   title: 'CSS',
    //   active: true,
    // });

    const { title, active } = req.body
    if (!title) {
      return res.status(404).json({ status: "failed", })
    }

    const IsExists = await CategoryModel.find({ active: true, title: title });

    if (IsExists.title == title) {
      return res.status(400).json({ status: "Category already exists" })
    }

    const category = await CategoryModel.create(req.body)

    res.status(200).json({ category });

    // await category.save();

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = { getAllCategories, insertCategory };

const mongoose = require('mongoose');
const Category = require('../models/Category');
const { serializeCategory } = require('../utils/serialize');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({ name: 1 });
    res.json({ success: true, data: categories.map(serializeCategory) });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    const category = await Category.create({
      userId: req.user.id,
      name: name.trim(),
    });

    res.status(201).json({ success: true, data: serializeCategory(category) });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid category id');
    }

    const category = await Category.findOne({ _id: id, userId: req.user.id });
    if (!category) {
      res.status(404);
      throw new Error('Category not found or unauthorized');
    }

    await Category.deleteOne({ _id: id });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};

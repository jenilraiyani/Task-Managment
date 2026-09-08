const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCategories).post(protect, createCategory);
router.route('/:id').delete(protect, deleteCategory);

module.exports = router;

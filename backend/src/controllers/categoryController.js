const Category = require('../models/Category');

// ✅ GET ALL
exports.getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {
      userId: req.userId // 🔥 IMPORTANT (user-specific data)
    };

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// ✅ CREATE
exports.createCategory = async (req, res) => {
  try {
    let { name, type, budget, isFixed, parentId } = req.body;

    if (type === 'income') {
      budget = 0;
    }

    isFixed = isFixed || false;
    parentId = parentId || null;
    budget = budget || 0;

    const newCategory = new Category({
      name,
      type,
      budget,
      isFixed,
      parentId,
      userId: req.userId,
      isDefault: false
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ GET BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
exports.updateCategory = async (req, res) => {
  try {
    let { name, type, budget, isFixed, parentId } = req.body;

    if (type === 'income') {
      budget = 0;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, type, budget, isFixed, parentId },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // 🔥 Prevent deleting default categories
    if (category.isDefault) {
      return res.status(403).json({ message: 'Default categories cannot be deleted.' });
    }

    await category.deleteOne();

    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
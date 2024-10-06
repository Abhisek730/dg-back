const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with pagination, search, and category filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const searchQuery = req.query.q || '';
    const categoryQuery = req.query.category || '';

    // Update search filter to search in 'title' or 'description'
    const searchFilter = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } }, // Search in 'title'
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    if (categoryQuery) {
      searchFilter.category = categoryQuery; // Filter by category
    }

    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(searchFilter);
    const products = await Product.find(searchFilter)
      .populate('category')
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      page,
      limit,
      totalPages,
      totalProducts,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get product by product_id
router.get('/:product_id', async (req, res) => {
  try {
    const product = await Product.findOne({ product_id: req.params.product_id }).populate('category');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { product_id, title, description, course_overview, category, trainingOptions } = req.body;

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ error: 'Invalid category ID' });

    const product = new Product({ product_id, title, description, course_overview, category, trainingOptions });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Update product by product_id
router.put('/:product_id', async (req, res) => {
  try {
    const { title, description, course_overview, category, trainingOptions } = req.body;

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ error: 'Invalid category ID' });

    const product = await Product.findOneAndUpdate(
      { product_id: req.params.product_id },
      { title, description, course_overview, category, trainingOptions },
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Delete product by product_id
router.delete('/:product_id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ product_id: req.params.product_id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;

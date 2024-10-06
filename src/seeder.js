const mongoose = require('mongoose');
const Category = require('./models/Category'); // Adjust the path if needed
const Product = require('./models/Product'); // Adjust the path if needed
const categories = require('../categories.json'); // Import categories from JSON
const products = require('../products.json'); // Import products from JSON

// Connect to MongoDB
mongoose.connect('mongodb+srv://ashuagrawalksj:123@cluster0.e3je7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed categories
    const createdCategories = await Category.insertMany(categories);

    // Map category IDs to the products
    const categoryMap = {};
    createdCategories.forEach(category => {
      categoryMap[category.name] = category._id; // Mapping category names to their new ObjectId
    });

    // Assign category IDs to products based on category names
    const productsWithCategoryIds = products.map(product => ({
      ...product,
      category: categoryMap[product.category] // Replace category name with category ID
    }));

    // Seed products with the new category IDs
    await Product.insertMany(productsWithCategoryIds);

    console.log('Database seeded successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database', error);
    mongoose.disconnect();
  }
};

seedDatabase();

const mongoose = require('mongoose');

// Training option schema with multiple region prices and description variations
const trainingOptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  buttonText: { type: String },
  name: { type: String }, // optional, only some options have 'name'
  short_desc: {
    paragraph: { type: String },
    listItems: [{ type: String }]
  },
  long_desc: {
    paragraph: { type: String },
    listItems: [{ type: String }]
  },
  tag: { type: String }, // optional
  india_price: { type: String },
  region_3_usd_price: { type: String },
  region_2_usd_price: { type: String },
  region_2_euro: { type: String },
  uk_price: { type: String },
  region_1_usa: { type: String },
  buttonLink: { type: String }, // for items with links like Mock Tests
});

// New product schema
const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // category as a string for now, can still use ref if needed
  title: { type: String, required: true }, // New title field
  description: { type: String },
  course_overview: [{ type: String }], // Array of strings for overview
  target_group: { type: String }, // New field for target group
  concepts_covered: {
    description: { type: String },
    listItems: [{ type: String }]
  },
  exams_and_prerequisites: {
    exam_formats: [{ type: String }],
    prerequisites: [{ type: String }]
  },
  image: { type: String },
  trainingOptions: [trainingOptionSchema], // New training options array
});

// Create model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;

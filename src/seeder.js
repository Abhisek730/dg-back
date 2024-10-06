const mongoose = require('mongoose');
const Category = require('./models/Category'); // Adjust the path if needed
const Product = require('./models/Product'); // Adjust the path if needed

// Connect to MongoDB
mongoose.connect('mongodb+srv://ashuagrawalksj:123@cluster0.e3je7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const categories = [
  { name: 'Scrum and Agile', description: 'Courses related to Scrum and Agile methodologies' },
  { name: 'Project Management', description: 'Courses covering various project management frameworks and methodologies' },
  { name: 'IT Service Management – ITIL ®', description: 'Courses related to IT Service Management based on the ITIL® framework' },
  { name: 'SDI – Service Desk Manager', description: 'Courses focused on Service Desk management and SDI certifications' }
];

const products = [
  {
    name: "Agile Scrum Workshop",
    description: "An in-depth workshop on Agile and Scrum methodologies. This course covers all essential aspects of Agile Scrum including planning, execution, and review. Ideal for professionals looking to enhance their Scrum skills and knowledge in real-world applications.",
    image: "../assets/assets_dg-site/logo/new logo for cources/PRINCE2Agile_ATO logo.png",
    category: "Scrum and Agile",
    options: [
      { type: "Book", price: 50, description: "Printed book edition of the Agile Scrum Workshop." },
      { type: "Online Bootcamp", price: 200, description: "Live instructor-led online bootcamp for Agile Scrum." },
      { type: "Self Learning Course", price: 150, description: "Self-paced online course with video lectures and quizzes." },
      { type: "Mock Test", price: 30, description: "Mock test series to evaluate your understanding of Agile Scrum." }
    ]
  },
  {
    name: "ITIL®4 Create,Deliver and Support",
    description: "ITIL® 4 Create, Deliver and Support addresses the cultural and team management aspects of product and service management; provides an overview of the tools and technologies.",
    image: "../assets/assets_dg-site/logo/new logo for cources/ITIL_ATO logo.png",
    category: "IT Service Management – ITIL ®",
    options: [
      { type: "Book", price: 7950, description: "Printed book edition for ITIL®4 Create,Deliver and Support." },
      { type: "Online Bootcamp", description: "Live instructor-led online bootcamp for ITIL®4 Create,Deliver and Support." },
      { type: "Self Learning Course", price: 34000, description: "Self-paced online course for ITIL®4 Create,Deliver and Support." },
      { type: "Mock Test", price: 0, description: "ITIL® 4: CREATE, DELIVER AND SUPPORT certification exam simulator helps students prepare for the ITIL® 4: CREATE, DELIVER AND SUPPORT examination, based on the actual exam pattern." },
      { type: "Corporate Training", description: "Comprehensive ITIL® 4: Create, Deliver, and Support corporate training program designed to prepare teams for certification. Includes hands-on workshops and an exam simulator based on the actual exam pattern." }
    ]
  },
  {
    name: "MSP ® 5 Foundation",
    description: "MSP (Managing Successful Programmes), 5th edition is designed to align programmes and projects to organizational strategy and enable enterprise agility.",
    image: "../assets/assets_dg-site/logo/new logo for cources/MSP_ATO_Logo.png",
    category: "Project Management",
    options: [
      { type: "Book", price: 7950, description: "Printed book edition for MSP ® 5 Foundation." },
      { type: "Mock Test", price: 0, description: "MANAGING SUCCESSFUL PROGRAMMES certification exam simulator helps students prepare for the MANAGING SUCCESSFUL PROGRAMMES, based on the actual exam pattern." },
      { type: "Corporate Training", description: "Tailored MSP® 5 Foundation corporate training program designed to align your teams with organizational strategy. Includes interactive workshops and a comprehensive exam simulator." }
    ]
  },
  {
    name: "SDI – Service Desk Analyst",
    description: "The Service Desk Institute (SDI) ® is the leading professional organization for everyone working in the IT service and support industry.",
    image: "../assets/assets_dg-site/logo/new logo for cources/MSP_ATO_Logo.png",
    category: "SDI – Service Desk Manager",
    options: [
      { type: "Book", price: 7950, description: "Printed book edition for SDI – Service Desk Analyst." },
      { type: "Mock Test", price: 0, description: "SDI – Service Desk Manager certification exam simulator helps students prepare for the SDI certification examination, based on the actual exam pattern." },
      { type: "Corporate Training", description: "Corporate training program for SDI – Service Desk Manager certification preparation. Includes hands-on experience and exam simulation." }
    ]
  }
];

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
      categoryMap[category.name] = category._id;
    });

    // Assign category IDs to products
    const productsWithCategoryIds = products.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Seed products
    await Product.insertMany(productsWithCategoryIds);

    console.log('Database seeded successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database', error);
    mongoose.disconnect();
  }
};

seedDatabase();

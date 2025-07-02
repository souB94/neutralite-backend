// neutralite-app/backend/routes/PersonalCareProductRoute.js
import express from 'express';
// IMPORTANT: Ensure your model file is named 'PersonalCareProducts.js' (plural 's')
// and that it exports 'PersonalCareProduct' (PascalCase)
import PersonalCareProduct from '../models/PersonalCareProducts.js';

const router = express.Router();

// Route 1: GET all personal products
// This handles requests to /api/personalProducts/
router.get('/', async (req, res) => {
  try {
    const personalProducts = await PersonalCareProduct.find({});
    res.status(200).json(personalProducts);
  } catch (error) {
    console.error('Error fetching personal products:', error);
    res.status(500).json({
      message: 'Failed to fetch personal products',
      error: error.message
    });
  }
});

// Route 2: GET a single personal product by ID
// This handles requests to /api/personalProducts/:id
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id; // Get the ID from the URL parameter

    // Find the product by its MongoDB '_id' field
    // FIX: Changed 'id' to '_id' to match the type of ID being sent in the URL
    const product = await PersonalCareProduct.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Personal product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching single personal product:', error);
    res.status(500).json({
      message: 'Failed to fetch personal product',
      error: error.message
    });
  }
});

// Route 3: POST to add a new personal product
// This handles requests to /api/personalProducts/add
router.post('/add', async (req, res) => {
  try {
    // Destructure properties from the request body
    const { id, name, description, price, imageUrl, category, brand, rating, stock } = req.body;

    // Create a new instance of the PersonalCareProduct model
    const newPersonalProduct = new PersonalCareProduct({
      id, // Make sure your model schema defines 'id' as 'required: true, unique: true'
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      rating,
      stock
    });

    // Save the new product to the database
    await newPersonalProduct.save();

    res.status(201).json({
      message: 'Personal product added successfully!',
      personalProduct: newPersonalProduct // Send back the created product
    });
  } catch (error) {
    console.error('Error adding personal product:', error);
    res.status(500).json({
      message: 'Failed to add personal product',
      error: error.message
    });
  }
});

export default router; // Export the router for use in server.js

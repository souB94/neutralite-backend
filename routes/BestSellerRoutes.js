// neutralite-app/backend/routes/productRoutes.js
import express from 'express';
import BestSeller from '../models/BestSeller.js'; // Ensure this points to your general Product model

const router = express.Router();

// POST route to add a new product (existing)
router.post('/add', async (req, res) => {
  try {
    const { id, name, description, price, imageUrl, category, brand, rating, stock } = req.body;
    const newProduct = new BestSeller({
      id,
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      rating,
      stock
    });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

// GET route to fetch all products (existing)

router.get('/', async (req, res) => {
  try {
    const allProducts = await BestSeller.find({});
    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// <-- FIX: GET a single product by its MongoDB '_id' -->
// Endpoint: /api/products/:id

router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // FIX: Changed from { id: productId } to { _id: productId }
    // This makes the route search by MongoDB's unique _id field.
    const product = await BestSeller.findOne({ _id: productId });

    if (!product) {
      // Provide a clear message if not found
      return res.status(404).json({ message: 'Best seller product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    // This catch block handles cases where the ID format is invalid for MongoDB (_id)
    // or other database errors.
    console.error('Error fetching single best seller product:', error);
    res.status(500).json({
      message: 'Failed to fetch best seller product',
      error: error.message
    });
  }
});

export default router;

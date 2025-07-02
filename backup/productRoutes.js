import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// POST: Add a product
router.post('/add', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: 'Product saved!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); ;
    res.json(products);
  } catch (err) {
     console.error('Error fetching products:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

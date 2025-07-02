import express from 'express';
import ShopCategory from '../models/ShopCategory.js';

const router = express.Router();

// Existing POST route for adding categories
router.post('/add', async (req, res) => {
    try {
        const { name, category, description, image, parent } = req.body;

        const newCategory = new ShopCategory({
            name,
            category,
            description,
            image,
            parent: parent ? parent : null // Ensure parent is optional
        });

        await newCategory.save();

        res.status(201).json({
            message: 'Shop category added successfully!',
            category: newCategory
        });
    } catch (error) {
        console.error('Error adding shop category:', error);
        res.status(500).json({
            message: 'Failed to add shop category',
            error: error.message
        });
    }
});

// **CRITICAL FIX: NEW GET route to fetch all shop categories**
// This route will handle GET requests to /api/shopCategories/
router.get('/', async (req, res) => {
    try {
        const categories = await ShopCategory.find({}); // Fetch all documents from the ShopCategories collection
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching shop categories:', error);
        res.status(500).json({
            message: 'Failed to fetch shop categories',
            error: error.message
        });
    }
});

export default router;
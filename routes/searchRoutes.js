import express from 'express';
const router = express.Router();

// Assuming you have Product, PersonalProduct, BestSeller models
import Product from '../models/Product.js'; // Adjust paths as per your project
import PersonalProduct from '../models/PersonalCareProducts.js';
import BestSeller from '../models/BestSeller.js';

router.get('/', async (req, res) => {

    try{

        const searchQuery = req.query.q // Get the search query from ?q=...

        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Create a regex for case-insensitive partial matching
        const regex = new RegExp(searchQuery, 'i');

        // Search across different collections
        const generalProducts = await Product.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
                // Add other fields you want to search, e.g., category, brand
            ]
        });

        const personalCareProducts = await PersonalProduct.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

         const bestSellerProducts = await BestSeller.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        // Combine results and remove duplicates (if a product might appear in multiple collections)
        // A simple way to remove duplicates if products have unique _id:
        const allResults = [...generalProducts, ...personalCareProducts, ...bestSellerProducts];
        const uniqueResults = Array.from(new Map(allResults.map(item => [item._id.toString(), item])).values());

        res.json(uniqueResults); // Send back the unique matching products

    }catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({ message: 'Server Error during search', error: error.message });
    }

});

export default router;
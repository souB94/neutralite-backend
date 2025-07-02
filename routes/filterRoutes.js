// neutralite-app/backend/routes/filterRoutes.js
import express from 'express';
import Product from '../models/Product.js'; // Import your general Product model
import PersonalCareProduct from '../models/PersonalCareProducts.js'; // Import your Personal Care Product model

const router = express.Router();

// GET route to fetch dynamic filter options
// Endpoint: /api/filters
router.get('/', async (req, res) => {
  try {
    // Fetch all products from both collections
    // This allows us to aggregate filter options across all product types
    const generalProducts = await Product.find({});
    const personalCareProducts = await PersonalCareProduct.find({});

    // Combine all products into a single array for easier processing
    const allProducts = [...generalProducts, ...personalCareProducts];

    // --- Aggregate Data for Filters ---
    let inStockCount = 0;
    let outOfStockCount = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    const categoriesMap = new Map(); // Using a Map to store category counts efficiently

    allProducts.forEach(product => {
      // 1. Availability Filter: Count in-stock and out-of-stock products
      // Assuming products have a 'stock' field (number)
      if (product.stock && product.stock > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }

      // 2. Price Range Filter: Determine the overall min and max prices
      // Assuming 'price' is stored as a string (e.g., "$55.85").
      // We need to parse it to a number for numerical comparison.
      const priceValue = parseFloat(product.price?.replace('$', ''));
      if (!isNaN(priceValue)) { // Check if the parsed value is a valid number
        if (priceValue < minPrice) {
          minPrice = priceValue;
        }
        if (priceValue > maxPrice) {
          maxPrice = priceValue;
        }
      }

      // 3. Category Filter: Count products per category
      // Assuming products have a 'category' field (string)
      if (product.category) {
        const category = product.category.trim(); // Trim whitespace
        if (category) { // Ensure category is not an empty string after trimming
          categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
        }
      }
      // You can extend this logic for other filters like 'brand', 'rating', etc.
    });

    // Format categories from the Map into an array of objects
    // This matches the format expected by your frontend's filter rendering logic.
    const categoriesOptions = Array.from(categoriesMap).map(([label, quantity]) => ({
      label,
      quantity
    }));

    // Construct the final array of filter options to send to the frontend
    const dynamicFilterOptions = [
      {
        label: 'Availability',
        type: 'checkbox', // Type of filter control
        options: [
          { label: 'In stock', quantity: inStockCount },
          { label: 'Out Of Stock', quantity: outOfStockCount },
        ],
      },
      {
        label: 'Price',
        type: 'range', // Type indicating a price range slider/input
        options: [
          // Use Math.floor and Math.ceil for sensible integer price ranges,
          // and provide default values (0, 1000) if no products are found.
          { min: minPrice === Infinity ? 0 : Math.floor(minPrice), max: maxPrice === -Infinity ? 1000 : Math.ceil(maxPrice) }
        ],
      },
      {
        label: 'Category',
        type: 'checkbox', // Type of filter control
        options: categoriesOptions, // Dynamically generated categories
      },
      // More filters can be added here following a similar structure
    ];

    // Send the aggregated filter options as a JSON response
    res.status(200).json(dynamicFilterOptions);

  } catch (error) {
    // Log and send an error response if anything goes wrong during aggregation or database access
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

export default router; // Export the router for use in server.js

// Example: In controllers/productController.js

import Product from '../models/Product.js';
import PersonalCareProduct from '../models/PersonalCareProducts.js';
import Review from '../models/Review.js';
import asyncHandler from 'express-async-handler'; // assuming you're using this middleware

// ... other existing controller functions like getProducts, getProductById ...

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params; // Get product ID from URL params

  const product = await Product.findById(id);

  if (product) {
    // 1. Check if the user has already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: product._id,
    });

    if (alreadyReviewed) {
      res.status(400); // Bad Request
      throw new Error('Product already reviewed');
    }

    // 2. Create the new review
    const review = await Review.create({
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: product._id,
    });

    // 3. Update the Product model with the new review
    product.reviews.push(review._id);
    product.numReviews = product.reviews.length;

    // Calculate the new average rating
    const totalRating = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, sum: { $sum: '$rating' } } },
    ]);
    
    // Check if totalRating is not empty before accessing its elements
    if (totalRating.length > 0) {
      product.rating = totalRating[0].sum / product.numReviews;
    } else {
      product.rating = 0; // Or handle this case as you see fit
    }

    await product.save();
    res.status(201).json({ message: 'Review added' }); // Created
  } else {
    res.status(404); // Not Found
    throw new Error('Product not found');
  }
});

export { 
  // ... other exported functions
  createProductReview 
};
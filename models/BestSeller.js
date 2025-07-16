// neutralite-app/backend/models/Product.js
import mongoose from 'mongoose';

// Define the schema for a product document
const bestSellerSchema = new mongoose.Schema({ 

  // 'name' field for the product (e.g., "Hydrating Serum").
  // This aligns with your actual MongoDB data where you had a 'name' field, not 'title'.
  name: {
    type: String,
    required: true, // Product name is usually mandatory
    trim: true      // Removes whitespace from both ends of the string
  },
  // 'description' field for detailed product information
  description: {
    type: String,
    required: true
  },
  // 'price' field. From your previous screenshots, this was stored as a String (e.g., "$55.85").
  // It's generally better for calculations to store it as a Number, but for immediate compatibility
  // with your existing data, it's set to String. Consider converting to Number on insert/update.
  price: {
    type: String, // Keeping as String to match your existing data format "$XX.XX"
    required: true
  },
  // 'imageUrl' to store the path or full URL to the product's image.
  // Your previous data showed this as a full URL, so ensure your frontend uses it directly.
  imageUrl: {
    type: String,
    required: false // Image might be optional for some products
  },
  // Optional fields to categorize and brand products
  category: {
    type: String,
    required: false
  },
  brand: {
    type: String,
    required: false
  },
  // 'rating' (e.g., "5"). From your previous screenshots, this was stored as a String.
  rating: {
    type: String, // Keeping as String to match your existing data format
    required: false
  },
  // 'stock' to track available quantity (assuming this is a new field you might add or is present)
  stock: {
    type: Number,
    default: 0
  },
    // -----------------------------
  // --- NEW FIELDS FOR REVIEWS ---
      reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review', // Reference to the new Review model
        },
      ],
      rating: {
        type: Number,
        required: true,
        default: 0,
      },
      numReviews: {
        type: Number,
        required: true,
        default: 0,
      },
      // -----------------------------
}, {
  timestamps: true // Mongoose will automatically add 'createdAt' and 'updatedAt' fields
});

// Create the Product model from the schema.
// By default, Mongoose will create a collection named 'products' (lowercase, plural of 'Product').
// IMPORTANT: If your actual MongoDB data is in a collection named 'Top Brands'
// (as indicated in previous debugging), you MUST specify it as the third argument:
// const Product = mongoose.model('Product', productSchema, 'Top Brands');
// If you want to use the default 'products' collection name, ensure your data is there.
const BestSeller = mongoose.model('BestSeller', bestSellerSchema, 'BestSellers');

export default BestSeller;

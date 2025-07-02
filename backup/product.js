// Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: String,          // Matches 'id' from your DB document
  name: String,        // Matches 'name' from your DB document
  price: String,       // Matches 'price' as "$55.85" from your DB document
  description: String,
  rating: String,      // Matches 'rating' from your DB document
  image: String        // Matches 'image' from your DB document
});

const Product = mongoose.model('Product', productSchema, 'Top Brands');

export default Product;
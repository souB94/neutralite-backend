// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv
import connectDB from './config/db.js'; // Import the database connection function
import productRoutes from './routes/productRoutes.js'; // Import product routes
import bannerRoutes from './routes/bannerRoutes.js'; // Import banner routes
import personalProductRoute from './routes/PersonalCareProductRoute.js'; // Import banner routes
import BestSellerRoutes from './routes/BestSellerRoutes.js'; // Import best seller routes
import FilterRoutes from './routes/filterRoutes.js'; // Import best seller routes
import ShopCategoryRoutes from './routes/shopCategoryRoutes.js'; // Import shop category routes
import orderRoutes from './routes/OrderRoutes.js'; // <-- NEW: Import order routes
import blogRoutes from './routes/blogRoutes.js'; // Import blog routes
import commentRoutes from './routes/commentRoutes.js'; // Import comment routes
import userRoutes from './routes/userRoutes.js'; // Import user routes

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// --- CORS Configuration ---
// This must come BEFORE your route definitions.
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN // This will be your Netlify URL
    : ['http://localhost:5000', 'http://localhost:5173']; // Add your frontend's local dev URLs

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman/Insomnia, curl requests)
        if (!origin) return callback(null, true);
        // Allow specific origins
        if (Array.isArray(allowedOrigins)) {
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        } else if (origin === allowedOrigins) {
            return callback(null, true);
        }
        // Block all other origins
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    }
}));


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/personalProducts', personalProductRoute);
app.use('/api/bestSellers', BestSellerRoutes);
app.use('/api/filters', FilterRoutes);
app.use('/api/shopCategories', ShopCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes); // Add comment routes
app.use('/api/users', userRoutes); // Add user routes

// Connect to the database
connectDB();

// Define the port for your server
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Log all the main API endpoints for easy testing (use actual host/URL for deployed)
  console.log(`General Products API: http://localhost:${PORT}/api/products`);
  console.log(`Personal Care Products API: http://localhost:${PORT}/api/personalProducts`);
  console.log(`Banners API: http://localhost:${PORT}/api/banners`);
  console.log(`Dynamic Filters API: http://localhost:${PORT}/api/filters`);
  console.log(`Shop Categories API: http://localhost:${PORT}/api/shopCategories`);
  console.log(`Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`Blogs API: http://localhost:${PORT}/api/blogs`);
  console.log(`Comments API: http://localhost:${PORT}/api/comments`);
  console.log(`User Management API: http://localhost:${PORT}/api/users`);
  console.log(`Example: Single Product by ID: http://localhost:${PORT}/api/products/YOUR_PRODUCT_MONGODB_ID`);
});

// REMOVED the redundant and misplaced `app.use(cors());` and the commented out basic API routes.
// REMOVED the static React build files section as it's for a different deployment scenario.
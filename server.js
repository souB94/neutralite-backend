// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv
import connectDB from './config/db.js'; // Import the database connection function
import productRoutes from './routes/productRoutes.js'; // Import product routes
import bannerRoutes from './routes/bannerRoutes.js'; // Import banner routes
import personalProductRoute from './routes/PersonalCareProductRoute.js'; // Import banner routes
import bestSellerRoutes from './routes/BestSellerRoutes.js'; // Import best seller routes
import FilterRoutes from './routes/filterRoutes.js'; // Import best seller routes
import ShopCategoryRoutes from './routes/shopCategoryRoutes.js'; // Import shop category routes
import orderRoutes from './routes/OrderRoutes.js'; // <-- NEW: Import order routes
import blogRoutes from './routes/blogRoutes.js'; // Import blog routes
import commentRoutes from './routes/commentRoutes.js'; // Import comment routes
import userRoutes from './routes/userRoutes.js'; // Import user routes
import contactRoutes from './routes/contactRoute.js'; // Import Contact Routes

// Load environment variables from .env file
dotenv.config();

// Connect to the database
// Note: You have connectDB() called here and also later below.
// One call at the beginning is sufficient.
connectDB();

const app = express();

// 1. Configure CORS: Add this BEFORE your routes
// For development, you can allow all:
// app.use(cors());

// For production, specify your frontend origin:
// --- CORS Configuration ---
// This must come BEFORE your route definitions.
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN // This will be your Netlify or production frontend URL
    : [
        'http://localhost:3000', // Your local frontend development server
        'http://localhost:5000', // Add your frontend's local dev URLs
        'http://localhost:5173', // If you're using Vite's default port
        'https://neutralite-cosmetics.netlify.app', // **REPLACE THIS WITH YOUR ACTUAL FRONTEND URL ON RENDER**
    ];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman/Thunder Client, or file://)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Set to true if you're handling cookies or authorization headers
}));

// Middleware to parse JSON request bodies
app.use(express.json());


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/personalProducts', personalProductRoute);
app.use('/api/bestSellers', bestSellerRoutes);
app.use('/api/filters', FilterRoutes);
app.use('/api/shopCategories', ShopCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes); // Add comment routes
app.use('/api/users', userRoutes); // Add user routes
app.use('/api/contact', contactRoutes); // Add Contact routes

// Connect to the database
// connectDB(); // <-- REMOVED (keeping your original for "no deletion", but noting it's redundant)

// Custom Error Handling Middleware
// This should be placed AFTER all routes and other app.use() calls
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Set status code to 500 if it was still 200 (meaning error wasn't caught explicitly)
    res.status(statusCode).json({
        message: err.message,
        // Only include stack trace in development mode for security
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


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
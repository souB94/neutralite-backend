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

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// Enable CORS for all origins. This is crucial for your frontend to communicate with the backend.
app.use(cors());
// Enable Express to parse JSON request bodies
app.use(express.json());

app.use('/uploads', express.static('uploads')); // <-- ADD THIS LINE

app.use('/api/products', productRoutes); // Make sure this line is present and correct
app.use('/api/banners', bannerRoutes); // Make sure this line is present and correct
app.use('/api/personalProducts', personalProductRoute); // Make sure this line is present and correct
app.use('/api/bestSellers', BestSellerRoutes); // Make sure this line is present and correct
app.use('/api/filters', FilterRoutes); // Make sure this line is present and correct
app.use('/api/shopCategories', ShopCategoryRoutes); // Make sure this line is present and correct
app.use('/api/orders', orderRoutes); // <-- NEW: Mount order routes
app.use('/api/blogs', blogRoutes); // <-- NEW: Mount blog routes

// This line mounts the product routes at the /api/products endpoint
// Ensure that your productRoutes.js file exports the router correctly
// Define the port for your server
const PORT = process.env.PORT || 5000;
connectDB(); // Connect to the database

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Log all the main API endpoints for easy testing
  console.log(`General Products API: http://localhost:${PORT}/api/products`);
  console.log(`Personal Care Products API: http://localhost:${PORT}/api/personalProducts`);
  console.log(`Banners API: http://localhost:${PORT}/api/banners`);
  console.log(`Dynamic Filters API: http://localhost:${PORT}/api/filters`); // <-- NEW: Log this important endpoint
  console.log(`Shop Categories API: http://localhost:${PORT}/api/shopCategories`); // <-- NEW: Log this important endpoint
  console.log(`Orders API: http://localhost:${PORT}/api/orders`); // <-- NEW: Log this endpoint
  console.log(`Blogs API: http://localhost:${PORT}/api/blogs`); // <-- NEW: Log this endpoint
  console.log(`Example: Single Product by ID: http://localhost:${PORT}/api/products/YOUR_PRODUCT_MONGODB_ID`);
});

// --- CORS Configuration ---
// This is crucial for your frontend to communicate with the backend.

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN // This will be your Netlify URL
    : ['http://localhost:3000', 'http://localhost:5173']; // Add your frontend's local dev URLs

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


// Note: Make sure to run `npm install express cors dotenv` to install the required packages.
// Also, ensure you have a .env file in your project root with any necessary environment variables.

// --- Basic API Route for Testing (Optional but Recommended) ---
// This is a simple route to confirm your backend is working.
/*app.get('/api/products', (req, res) => {
  res.status(200).json({ message: 'Hello from the backend API!' });
});

app.get('/api/banners', (req, res) => {
  res.status(201).json({ message: 'Hello from the backend API!' });
});

app.get('/api/personalProducts', (req, res) => {
  res.status(201).json({ message: 'Hello from the backend API!' });
});

app.get('/api/bestSellers', (req, res) => {
  res.status(201).json({ message: 'Hello from the backend API!' });
});

app.get('/api/filters', (req, res) => {
  res.status(201).json({ message: 'Hello from the backend API!' });
});*/

// --- Serve Static React Build Files (Future Step for Deployment) ---
// IMPORTANT: You'll build your React app (npm run build) and then point this
// to the build folder. For local development, your React dev server
// will handle serving the frontend, so this part isn't active yet.
// However, it's good to include it for when you deploy.

// Example if your React build output is in a 'build' folder inside your backend project:
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, 'build'))); // Replace 'build' with your React build folder name

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
// });




import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import 'dotenv/config'; // This line already configures dotenv

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
// dotenv.config(); // REMOVE THIS LINE - it's redundant when you use import 'dotenv/config';

app.use('/uploads', express.static('uploads'));



// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Routes
app.use('/api/products', productRoutes); // 👈 use the product route

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// neutralite-app/backend/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Import dotenv to access process.env.MONGO_URI

// Load environment variables (important if db.js is run independently or before server.js)
dotenv.config();

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,      // Recommended for new connections
      useUnifiedTopology: true    // Recommended for new connections
      // useCreateIndex: true,    // Deprecated in Mongoose 6.x
      // useFindAndModify: false  // Deprecated in Mongoose 6.x
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit process with failure if connection fails
    process.exit(1);
  }
};

export default connectDB;
// Note: Ensure you have a .env file in your project root with the MONGO_URI variable set.

// backend/routes/userRoutes.js
import express from 'express';
import User from '../models/User.js'; // Import the User model
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import dotenv from 'dotenv'; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// Helper function to generate a JWT (JSON Web Token)
// This function encapsulates the logic for creating the token.
const generateToken = (id) => {
  // jwt.sign() creates a new token.
  // 1. Payload: The data you want to store in the token (usually user ID).
  // 2. Secret: A secret key known only to the server, used to sign the token.
  // 3. Options: e.g., expiresIn for token expiration.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Token expiration (e.g., '1h', '30d')
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // Destructure user data from the request body

  // 1. Basic validation: Check if all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // 2. Check if a user with the given email already exists
    // User.findOne({ email: email }) searches the database for a user matching the email.
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists, send a 400 Bad Request response with an error message.
      return res.status(400).json({ message: 'User already exists.' });
    }

    // 3. Create a new user if one does not already exist
    // User.create() is a Mongoose method that creates and saves a new document in one step.
    // The password hashing (using bcrypt) will automatically happen via the 'pre' save hook
    // we defined in the User model before the user is saved to the database.
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // 4. If user creation is successful, send back user details and a JWT
      // This logs the user in immediately after registration.
      res.status(201).json({ // 201 Created status for successful resource creation
        _id: user._id,       // User's unique ID from MongoDB
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id), // Generate a JWT using the user's ID
      });
    } else {
      // If for some reason user creation fails (e.g., validation errors not caught above)
      res.status(400).json({ message: 'Failed to create user.' });
    }
  } catch (error) {
    // Handle any server-side errors during the process
    console.error('Error during user registration:', error);
    // Check for Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

export default router;
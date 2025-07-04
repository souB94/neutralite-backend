// backend/routes/userRoutes.js
import express from 'express';
import User from '../models/User.js'; // Import the User model
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import { protect } from '../middleware/authMiddleware.js'; // <--- ADD THIS LINE

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

// @desc    Authenticate user & get token (User Login)
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => { // <--- THIS IS THE MISSING PART
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (requires authentication)
router.get('/profile', protect, async (req, res) => {
    // If we reach this point, the 'protect' middleware has successfully
    // authenticated the user and attached the user object to 'req.user'.
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        // You can add more user-specific data here if needed
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (requires authentication)
router.put('/profile', protect, async (req, res) => {
    // 'req.user' is available here because the 'protect' middleware already ran.
    const user = await User.findById(req.user._id); // Fetch the user from DB again (redundant but safe)

    if (user) {
        // Update name if provided in the request body, otherwise keep existing name
        user.name = req.body.name || user.name;

        // Update email if provided in the request body
        // Add validation to ensure email is unique before saving
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Email already in use by another account.' });
            }
            user.email = req.body.email;
        }

        // --- IMPORTANT: Handle password updates separately ---
        // We are NOT allowing password change directly via this route for simplicity and security.
        // Password change usually involves current password confirmation and should be its own endpoint.
        // If you uncomment and enable this, ensure password hashing is handled correctly
        // (the .pre('save') hook in User.js will handle it for updates).
        // if (req.body.password) {
        //     user.password = req.body.password;
        // }

        // Save the updated user document to the database
        const updatedUser = await user.save();

        // Send back the updated user details and a new token (optional, but good for refreshing client state)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id), // Generate a new token if profile fields changed,
                                                  // or just return the old one if nothing sensitive changed.
                                                  // Generating a new one is safer practice to reflect current state.
        });
    } else {
        // This case should ideally not happen if 'protect' middleware works correctly,
        // as 'req.user' should always correspond to an existing user.
        res.status(404).json({ message: 'User not found.' });
    }
});

export default router;
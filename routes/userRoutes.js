// backend/routes/userRoutes.js
import express from 'express';
//import User from '../models/User.js'; // Import the User model
//import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import { protect } from '../middleware/authMiddleware.js'; // Import the authentication middleware

// CORRECTED IMPORT: Ensure all necessary controller functions are imported
// Also, verify the path: 'controllers' instead of 'controller' if that's your directory name
import {
    authUser,
    registerUser,
    getUserProfile,
    updateProfile, // Make sure updateProfile is imported for /profile PUT route
    forgotPassword, // ADDED: for initiating password reset
    resetPassword
} from '../controllers/userController.js'; // <--- CRITICAL: Make sure this path is correct ('controllers' vs 'controller')

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// Public routes
// These now correctly use the imported functions from userController.js
router.post('/login', authUser); // Login route
router.route('/register').post(registerUser); // Registration route

// ADDED: New route for initiating password reset
router.post('/forgotpassword', forgotPassword); // Route to request password reset link

// Existing route for password reset (already present)
router.put('/resetpassword/:token', resetPassword); // This route will handle the password update

// Private routes (require authentication)
router.route('/profile')
    .get(protect, getUserProfile) // Get user profile
    .put(protect, updateProfile); // ADDED: Update user profile

// Helper function to generate a JWT (JSON Web Token)
// This function should ideally be in a separate 'utils' file (e.g., generateToken.js)
// If you already have backend/utils/generateToken.js, this inline block can be removed.
// It's already imported in userController.js, so this one is redundant if you have it in utils.
// Commenting it out to rely on the one imported in userController.js and remove redundancy.
/*
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Token expiration (e.g., '1h', '30d')
  });
};
*/

// --- COMMENTED OUT REDUNDANT INLINE ROUTE IMPLEMENTATIONS ---
// These functions are now handled by the imported controller functions above.
/*
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }
  try {
    const emailLower = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Failed to create user.' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});
*/

/*
// @desc    Authenticate user & get token (User Login)
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
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
*/

/*
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (requires authentication)
router.get('/profile', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
    });
});
*/

/*
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (requires authentication)
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Email already in use by another account.' });
            }
            user.email = req.body.email;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});
*/

// Export the router as a default export for server.js
export default router;
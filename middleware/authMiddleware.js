// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // We need the User model to find the user by ID
import dotenv from 'dotenv'; // To access JWT_SECRET

dotenv.config(); // Load environment variables

// This middleware function will protect routes
const protect = async (req, res, next) => {
  let token; // Declare a variable to hold the token

  // Check if the Authorization header exists and starts with 'Bearer'
  // The token is typically sent in the 'Authorization' header like: "Bearer TOKEN_STRING"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      // Split 'Bearer TOKEN_STRING' into an array ['Bearer', 'TOKEN_STRING'] and take the second element
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      // jwt.verify() decodes the token using the secret key.
      // If the token is invalid or expired, it will throw an error.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find user by ID from the decoded token payload
      // decoded.id contains the user ID that we put into the token when signing it.
      // .select('-password') excludes the password hash from the returned user object for security.
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user was found (e.g., user might have been deleted after token was issued)
      if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found.' });
        return; // Stop execution
      }

      next(); // Move to the next middleware or route handler
    } catch (error) {
      // Handle various token-related errors
      console.error('Authentication error:', error.message);
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Not authorized, token expired.' });
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Not authorized, token failed (invalid token).' });
      } else {
        res.status(401).json({ message: 'Not authorized, token failed.' });
      }
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

export { protect }; // Export the middleware function
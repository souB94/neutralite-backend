// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import the User model
import asyncHandler from 'express-async-handler'; // For handling async errors in middleware
import dotenv from 'dotenv';
dotenv.config();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN_STRING)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from decoded token and attach to request object
      // .select('-password') excludes the password from the returned user object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, user not found.');
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Authentication error:', error.message);
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Not authorized, token expired.');
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Not authorized, invalid token.');
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed.');
      }
    }
  } else {
    res.status(401); // Unauthorized
    throw new Error('Not authorized, no token.');
  }
});

export { protect };
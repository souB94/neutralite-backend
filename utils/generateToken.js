// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; // Import dotenv
dotenv.config(); // Load environment variables here if JWT_SECRET is needed

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // <--- FIX: Ensure this is a string
  });
};

export default generateToken;
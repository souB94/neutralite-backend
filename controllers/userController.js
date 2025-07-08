// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // Required for email sending

// Email Sending Utility (CONFIGURE THIS WITH YOUR ACTUAL EMAIL SERVICE)
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === '465', // Use true if port is 465 (SSL)
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`, error);
        throw new Error('Email sending failed. Check Nodemailer configuration and credentials.');
    }
};

// @desc    Authenticate user & get token (User Login)
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        res.status(400);
        throw new Error('Email already in use by another account.');
      }
      user.email = req.body.email;
    }

    // ✅ ADD this: allow address update
    if (req.body.address !== undefined) {
      user.address = req.body.address;
    }

    // ✅ ADD this: allow password update
    if (req.body.password) {
      user.password = req.body.password; // bcrypt middleware will hash it
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Initiate password reset (send email with token)
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log('[FORGOT PASSWORD] Request received for:', email);

    const user = await User.findOne({ email });

    if (!user) {
        console.log('[FORGOT PASSWORD] No user found with that email.');
        return res.status(200).json({ message: 'If a user with that email exists, a password reset link will be sent.' });
    }

    console.log('[FORGOT PASSWORD] User found:', user.email);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const frontendURL =
    process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_LOCAL;

    const frontendResetURL = `${frontendURL}/reset-password/${resetToken}`;
    console.log('[FORGOT PASSWORD] Reset link generated:', frontendResetURL);

    try {
        await sendEmail({
            email: user.email,
            subject: 'Neutralite Cosmetics: Password Reset Request',
            message: `
                Hello ${user.name},<br /><br />
                You requested a password reset.<br />
                Click this link to reset your password:<br />
                <a href="${frontendResetURL}">${frontendResetURL}</a><br /><br />
                This link will expire in 1 hour.<br /><br />
                If you did not request this, you can ignore this email.
            `,
        });

        console.log('[FORGOT PASSWORD] Email sent successfully.');
        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error('[FORGOT PASSWORD] Error sending email:', err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('There was an error sending the password reset email. Please try again later.');
    }
});

// @desc    Reset user password using token
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Token is invalid or has expired. Please request a new password reset link.');
    }
    if (!password || !confirmPassword) {
        res.status(400);
        throw new Error('Please provide both new password and confirm new password.');
    }
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error('New password and confirm new password do not match.');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long.');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
});

// FIX: Ensure forgotPassword is included in the exports
export {
    authUser,
    registerUser,
    getUserProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
};
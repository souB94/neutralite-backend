import express from 'express';
import Contact from '../models/Contact.js';


const router = express.Router();

// @desc    Create a new Contact Information
// @route   POST /api/contact/add
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }

    try {
        const newContact = new Contact({
            name,
            email,
            message,
        });

        const saveContact = await newContact.save();
        res.status(201).json(saveContact); // 201 Created
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while saving Contact Information.' });
    }
});

export default router;
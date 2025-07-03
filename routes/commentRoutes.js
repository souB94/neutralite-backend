// routes/commentRoutes.js
import express from 'express';
import Comment from '../models/Comments.js'; // You now need to import the Comment model directly here

const router = express.Router();

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Public
router.post('/', async (req, res) => {
    const { blogId, name, email, message } = req.body;

    // Basic validation
    if (!blogId || !name || !email || !message) {
        return res.status(400).json({ message: 'Please enter all fields for the comment.' });
    }

    try {
        const newComment = new Comment({
            blogId,
            name,
            email,
            message,
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment); // 201 Created
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while saving comment.' });
    }
});

// Optional: Get comments for a specific blog post
// @desc    Get comments for a blog post
// @route   GET /api/blogs/:blogId/comments
// @access  Public
router.get('/blog/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments for blog:', error);
        res.status(500).json({ message: 'Server error while fetching comments.' });
    }
});

export default router;
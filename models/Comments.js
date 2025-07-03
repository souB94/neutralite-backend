// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId, // Links the comment to a specific blog post
        ref: 'Blog', // Assuming you have a 'Blog' model
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        // You might add a basic email validation regex here
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
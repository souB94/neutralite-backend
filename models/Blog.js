// neutralite-app/backend/models/Banner.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    blogImage: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Beauty Tips', 'Product Reviews', 'Health & Wellness', 'News', 'How-To', 'Lifestyle'] // Example categories
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Blog = mongoose.model('Blog', blogSchema, 'Blog'); // 'blogs' is the collection name

export default Blog
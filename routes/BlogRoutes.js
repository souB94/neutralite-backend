import express from 'express';
import Blog from '../models/Blog.js'; // Assuming your Blog model is correctly imported

const router = express.Router();

// Route to add a new blog
router.post('/add', async (req, res) => {
    try {
        const { title, description, blogImage, link, category } = req.body;
        const newBlog = new Blog({
            title,
            description,
            blogImage,
            link,
            category
            // createdAt will be added automatically by Mongoose if you have timestamps: true in your schema
        });
        await newBlog.save();
        res.status(201).json({ message: 'Blog added successfully!', blog: newBlog });
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ message: 'Failed to add blog', error: error.message });
    }
});

// Route to get all blogs, with optional filtering for related blogs
// This route now handles:
// - Getting all blogs (default)
// - Filtering by category (e.g., /api/blogs?category=Beauty%20Tips)
// - Excluding a specific blog ID (e.g., /api/blogs?exclude=60c72b2f9e1d2c001c8e4a2d)
// - Limiting the number of results (e.g., /api/blogs?limit=3)
router.get('/', async (req, res) => {
    try {
        const { category, exclude, limit } = req.query; // Extract query parameters

        let query = {}; // Initialize an empty query object for Mongoose

        // Add category filter if provided
        if (category) {
             query.category = new RegExp(category, 'i'); // New line for case-insensitive search
        }

        // Add exclusion filter if provided
        if (exclude) {
            // Mongoose uses $ne (not equal) for exclusion by _id
            query._id = { $ne: exclude };
        }

        // Build the Mongoose query chain
        let blogsQuery = Blog.find(query).sort({ createdAt: -1 }); // Sort by newest first

        // Apply limit if provided
        if (limit) {
            const parsedLimit = parseInt(limit, 10); // Ensure limit is an integer
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                blogsQuery = blogsQuery.limit(parsedLimit);
            }
        }

        const blogs = await blogsQuery.exec(); // Execute the query

        // Process each blog to extract month and day (only if needed for the frontend)
        const processedBlogs = blogs.map(blog => {
            const date = blog.createdAt; // Assuming createdAt is a Date object from Mongoose
            const monthShort = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Jul"
            const day = date.getDate(); // e.g., 2, 15

            return {
                _id: blog._id,
                title: blog.title,
                description: blog.description,
                blogImage: blog.blogImage,
                createdAt: blog.createdAt,
                month: monthShort,
                day: day,
                link: blog.link,
                category: blog.category // Ensure category is included
            };
        });

        res.json(processedBlogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server Error while fetching blogs', error: error.message });
    }
});


// GET a single blog by its MongoDB '_id'
// Endpoint: /api/blogs/:id
router.get('/:id', async (req, res) => {
    try {
        const blogId = req.params.id;

        const blog = await Blog.findOne({ _id: blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Process single blog to include month/day if your frontend expects it consistently
        const date = blog.createdAt;
        const monthShort = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear(); // Include year if needed

        const processedBlog = {
            _id: blog._id,
            title: blog.title,
            description: blog.description,
            blogImage: blog.blogImage,
            createdAt: blog.createdAt,
            month: monthShort,
            day: day,
            year: year,
            link: blog.link,
            category: blog.category
        };


        res.status(200).json(processedBlog); // Send the processed single blog
    } catch (error) {
        // This catch block handles cases where the ID format is invalid for MongoDB (_id)
        // or other database errors.
        console.error('Error fetching single blog:', error);
        res.status(500).json({
            message: 'Failed to fetch blog',
            error: error.message
        });
    }
});

export default router;
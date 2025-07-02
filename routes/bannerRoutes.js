import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        
        const { title, description, bannerProductImage, bannerGirlImage } = req.body;

        const newBanner = new Banner({
            title,
            description,
            bannerProductImage,
            bannerGirlImage,
        });

        await newBanner.save();

        res.status(201).json({
            message: 'Banner added successfully!',
            banner: newBanner
        });
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).json({
            message: 'Failed to add banner',
            error: error.message
        });
    }
});


router.get('/', async (req, res) => {
    try {
        const banner = await Banner.find({});
        res.status(200).json(banner);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            message: 'Failed to fetch banners',
            error: error.message
        });
    }
});

export default router;
// neutralite-app/backend/models/Banner.js
import mongoose from 'mongoose';

const bannerschema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    bannerProductImage: {
        type: String,
        required: true
    },
     bannerGirlImage: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Banner = mongoose.model('Banner', bannerschema, 'Banner'); // 'banners' is the collection name

export default Banner
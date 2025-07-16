import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links the review to a specific user
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product', // This links the review to a specific product
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
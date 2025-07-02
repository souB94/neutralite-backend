// models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String},
    image: { type: String },
    imageUrl: { type: String }, // In case imageUrl is used instead of image
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
});

const OrderSchema = new mongoose.Schema({
    contactMail: {
        email: { type: String, required: true },
        newsletterConsent: { type: Boolean, default: false },
    },
    shippingAddress: {
        country: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: { type: String, required: true },
        apartment: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        saveInformation: { type: Boolean, default: false },
    },
    billingAddress: { // This will store shipping address if useShippingAsBilling is true
        country: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: { type: String, required: true },
        apartment: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
    },
    paymentDetails: {
        // In a real application, you would NOT store raw card details.
        // Instead, you'd store a token from a payment gateway (e.g., Stripe, PayPal).
        // For this example, we'll include fields but emphasize this is for conceptual understanding.
        cardNumber: { type: String, required: true }, // Store last 4 digits and token in production
        expiryDate: { type: String, required: true }, // Store masked value
        securityCode: { type: String, required: true }, // NEVER store this in production
        cardHolderName: { type: String, required: true },
        useShippingAsBilling: { type: Boolean, default: true },
    },
    shippingMethod: { type: String, required: true },
    shippingCost: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    cartItems: [OrderItemSchema], // Array of products in the order
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }, // e.g., Pending, Processed, Shipped, Delivered, Cancelled
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
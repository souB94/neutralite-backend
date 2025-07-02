// routes/orderRoutes.js
import express from 'express';
import Order from '../models/Order.js'; // Import the Order model

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (for now, would typically be private/authenticated)
router.post('/', async (req, res) => {
    try {
        const {
            contactMail,
            shippingAddress,
            billingAddress,
            paymentDetails,
            shippingMethod,
            shippingCost,
            subtotal,
            totalItems,
            grandTotal,
            cartItems
        } = req.body;

        // Basic validation (you should add more robust validation)
        if (!contactMail || !contactMail.email || !shippingAddress || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Missing required order details.' });
        }

        // Create a new order instance
        const newOrder = new Order({
            contactMail,
            shippingAddress,
            billingAddress,
            paymentDetails,
            shippingMethod,
            shippingCost,
            subtotal,
            totalItems,
            grandTotal,
            cartItems,
        });

        // Save the order to the database
        const createdOrder = await newOrder.save();

        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: createdOrder._id,
            order: createdOrder
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while placing order.', error: error.message });
    }
});

// You can add more routes here, e.g., to fetch orders by user, get a single order, etc.
// Example: Get all orders (for admin)
/*
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders.' });
    }
});
*/

export default router;
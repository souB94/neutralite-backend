// models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String },
  image: { type: String },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    // 🔐 Required for user-based order filtering
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

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

    billingAddress: {
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
      cardNumber: { type: String, required: true },
      expiryDate: { type: String, required: true },
      securityCode: { type: String, required: true },
      cardHolderName: { type: String, required: true },
      useShippingAsBilling: { type: Boolean, default: true },
    },

    shippingMethod: { type: String, required: true },
    shippingCost: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    grandTotal: { type: Number, required: true }, // frontend shows this as totalPrice

    cartItems: [OrderItemSchema],

    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },

    // ✅ These are expected by frontend Orders.jsx
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
  }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;

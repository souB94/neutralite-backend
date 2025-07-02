import mongoose from "mongoose";

const shopCategorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "ShopCategory" },
}, { timestamps: true });

const ShopCategory = mongoose.model("ShopCategory", shopCategorySchema, "ShopCategories");

export default ShopCategory;

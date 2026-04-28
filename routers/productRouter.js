const express = require("express");
const {
    createProduct,
    deleteProduct,
    getProductInfo,
    getProducts,
    searchProducts,
    updateProduct,
} = require("../controllers/productControllers");

const productRouter = express.Router();
const { adminOnly } = require('../controllers/userControllers');

productRouter.post("/", adminOnly, createProduct);
productRouter.get("/search/query", searchProducts);
productRouter.get("/", getProducts);
productRouter.get("/:productId", getProductInfo);
productRouter.put("/:productId", adminOnly, updateProduct);
productRouter.delete("/:productId", adminOnly, deleteProduct);

module.exports = productRouter;

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

productRouter.post("/", createProduct);
productRouter.get("/search/:query", searchProducts);
productRouter.get("/", getProducts);
productRouter.get("/:productId", getProductInfo);
productRouter.put("/:productId", updateProduct);
productRouter.delete("/:productId", deleteProduct);

module.exports = productRouter;

const express = require("express");
const {
    createOrder,
    getOrders,
    updateOrder,
} = require("../controllers/orderControllers");

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/:page/:limit", getOrders); // Handles both admin (all) and customer (mine)
orderRouter.get("/", getOrders);
orderRouter.put("/:id", updateOrder); // Admin only status update

module.exports = orderRouter;

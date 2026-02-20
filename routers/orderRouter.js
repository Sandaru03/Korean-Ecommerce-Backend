const express = require("express");
const {
    createOrder,
    getOrders,
    updateOrder,
} = require("../controllers/orderControllers");

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders); // Handles both admin (all) and customer (mine)
orderRouter.put("/:id", updateOrder); // Admin only status update

module.exports = orderRouter;

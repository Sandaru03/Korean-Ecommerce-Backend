const express = require("express");
const {
    createOrder,
    getOrders,
    updateOrder,
    bulkUpdateOrders,
} = require("../controllers/orderControllers");

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/:page/:limit", getOrders);
orderRouter.get("/", getOrders);
orderRouter.put("/bulk/status", bulkUpdateOrders);
orderRouter.put("/:id", updateOrder);

module.exports = orderRouter;

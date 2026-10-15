const express = require("express");
const {
    createOrder,
    getOrders,
    updateOrder,
    bulkUpdateOrders,
} = require("../controllers/orderControllers");
const {
    generateWaybills,
    previewWaybillsHtml,
} = require("../controllers/waybillController");

const orderRouter = express.Router();

orderRouter.post("/courier/generate-waybills", generateWaybills);
orderRouter.get("/courier/preview-waybills", previewWaybillsHtml);

orderRouter.post("/", createOrder);
orderRouter.get("/:page/:limit", getOrders);
orderRouter.get("/", getOrders);
orderRouter.put("/bulk/status", bulkUpdateOrders);
orderRouter.put("/:id", updateOrder);

module.exports = orderRouter;

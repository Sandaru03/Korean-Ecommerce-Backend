const express = require("express");
const {
    createOrder,
    getOrders,
    updateOrder,
    bulkUpdateOrders,
    deleteOrder,
    bulkDeleteOrders,
} = require("../controllers/orderControllers");
const {
    generateWaybills,
    previewWaybillsHtml,
    emailPreviewWaybillPdf,
} = require("../controllers/waybillController");

const orderRouter = express.Router();

orderRouter.post("/courier/generate-waybills", generateWaybills);
orderRouter.get("/courier/preview-waybills", previewWaybillsHtml);
orderRouter.post("/courier/email-preview-pdf", emailPreviewWaybillPdf);

orderRouter.post("/", createOrder);
orderRouter.get("/:page/:limit", getOrders);
orderRouter.get("/", getOrders);
orderRouter.put("/bulk/status", bulkUpdateOrders);
orderRouter.delete("/bulk", bulkDeleteOrders);
orderRouter.put("/:id", updateOrder);
orderRouter.delete("/:id", deleteOrder);

module.exports = orderRouter;

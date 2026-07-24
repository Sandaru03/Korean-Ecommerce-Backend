const express = require("express");
const { createRequest, getAllRequests, deleteRequest } = require("../controllers/productRequestController");

const productRequestRouter = express.Router();
const { adminOnly } = require('../controllers/userControllers');

productRequestRouter.post("/", createRequest);
productRequestRouter.get("/", adminOnly, getAllRequests);
productRequestRouter.delete("/:id", adminOnly, deleteRequest);

module.exports = productRequestRouter;

const express = require("express");
const { getFlashDeal, upsertFlashDeal } = require("../controllers/flashDealController");

const flashDealRouter = express.Router();

flashDealRouter.get("/", getFlashDeal);
flashDealRouter.put("/", upsertFlashDeal);

module.exports = flashDealRouter;

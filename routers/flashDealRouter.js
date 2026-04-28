const express = require("express");
const { getFlashDeal, upsertFlashDeal } = require("../controllers/flashDealController");

const flashDealRouter = express.Router();
const { adminOnly } = require('../controllers/userControllers');

flashDealRouter.get("/", getFlashDeal);
flashDealRouter.put("/", adminOnly, upsertFlashDeal);

module.exports = flashDealRouter;

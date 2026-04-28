const express = require("express");
const { getTimeDeal, upsertTimeDeal } = require("../controllers/timeDealController");

const timeDealRouter = express.Router();
const { adminOnly } = require('../controllers/userControllers');

timeDealRouter.get("/", getTimeDeal);
timeDealRouter.put("/", adminOnly, upsertTimeDeal);

module.exports = timeDealRouter;

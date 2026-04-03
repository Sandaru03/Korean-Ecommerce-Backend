const express = require("express");
const { getTimeDeal, upsertTimeDeal } = require("../controllers/timeDealController");

const timeDealRouter = express.Router();

timeDealRouter.get("/", getTimeDeal);
timeDealRouter.put("/", upsertTimeDeal);

module.exports = timeDealRouter;

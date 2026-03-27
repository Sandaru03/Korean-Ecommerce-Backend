const express = require("express");
const router = express.Router();
const configControllers = require("../controllers/configControllers");

router.get("/", configControllers.getConfig);
router.post("/send-order-email", configControllers.sendOrderEmail);

module.exports = router;

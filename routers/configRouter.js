const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const configControllers = require("../controllers/configControllers");

router.get("/", configControllers.getConfig);
router.post("/send-order-email", configControllers.sendOrderEmail);

module.exports = router;

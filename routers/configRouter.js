const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const configControllers = require("../controllers/configControllers");

router.get("/", configControllers.getConfig);
router.post("/send-order-email", configControllers.sendOrderEmail);
router.get("/debug-env", (req, res) => {
    res.json({
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
        userPrefix: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) : "none",
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
    });
});

router.get("/test-email", async (req, res) => {
    const { sendEmail } = require("../utils/mailer");
    try {
        await sendEmail({
            to: process.env.ORDER_EMAIL || "d.chandima163@gmail.com",
            subject: "Test Email from Server",
            text: "If you are reading this, the SMTP connection is working!",
            html: "<b>SMTP Connection is working!</b>"
        });
        res.json({ success: true, message: "Test email sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

module.exports = router;

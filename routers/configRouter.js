const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const configControllers = require("../controllers/configControllers");

router.get("/", configControllers.getConfig);
router.post("/send-order-email", configControllers.sendOrderEmail);
router.get("/debug-env", (req, res) => {
    const fs = require("fs");
    const path = require("path");
    const { getSmtpConfig } = require("../utils/envHelper");
    const smtp = getSmtpConfig();
    const envPath = path.resolve(__dirname, "../.env");
    
    res.json({
        uptimeSeconds: Math.floor(process.uptime()),
        pid: process.pid,
        hasEnvFile: fs.existsSync(envPath),
        processEnvUser: process.env.SMTP_USER || null,
        activeSmtpUser: smtp.user ? (smtp.user.substring(0, 3) + "***" + smtp.user.substring(smtp.user.indexOf("@"))) : null,
        activeSmtpHost: smtp.host,
        activeSmtpPort: smtp.port,
        hasPass: !!smtp.pass,
        passLength: smtp.pass ? smtp.pass.length : 0,
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
    });
});

router.get("/test-email", async (req, res) => {
    const { sendEmail } = require("../utils/mailer");
    const { getOrderEmail } = require("../utils/envHelper");
    try {
        const targetEmail = getOrderEmail();
        await sendEmail({
            to: targetEmail,
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

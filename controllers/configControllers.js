const { sendEmail } = require("../utils/mailer");

exports.getConfig = async (req, res) => {
    try {
        res.json({
            whatsappNumber: process.env.WHATSAPP_NUMBER || "94771234567",
            orderEmail: process.env.ORDER_EMAIL || "orders@yourbusiness.com"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch config" });
    }
};

exports.sendOrderEmail = async (req, res) => {
    const { summary, email } = req.body;
    
    if (!summary) {
        return res.status(400).json({ message: "Order summary is required" });
    }

    try {
        await sendEmail({
            to: process.env.ORDER_EMAIL || "orders@yourbusiness.com",
            subject: "New Order — Korean Store",
            text: summary.replace(/\*/g, ""),
            html: `<pre style="font-family: inherit;">${summary.replace(/\*/g, "<b>").replace(/\*/g, "</b>")}</pre>`
        });
        res.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Backend email error:", error);
        res.status(500).json({ message: "Failed to send email via server" });
    }
};

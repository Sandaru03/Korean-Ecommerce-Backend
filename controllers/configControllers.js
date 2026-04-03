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
    const { summary, email, slipImageUrl } = req.body;
    
    if (!summary) {
        return res.status(400).json({ message: "Order summary is required" });
    }

    try {
        // Build plain text with slip link
        let plainText = summary.replace(/\*/g, "");
        if (slipImageUrl) {
            plainText += `\n\nPayment Slip: ${slipImageUrl}`;
        }

        // Build HTML body
        let htmlBody = `<pre style="font-family: inherit;">${summary.replace(/\*/g, "<b>").replace(/\*/g, "</b>")}</pre>`;
        if (slipImageUrl) {
            htmlBody += `
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                    <p style="font-weight: bold; margin-bottom: 8px;">📎 Payment Slip:</p>
                    <img src="${slipImageUrl}" alt="Payment Slip" style="max-width: 400px; width: 100%; border-radius: 8px; border: 1px solid #eee;" />
                    <p style="margin-top: 8px;"><a href="${slipImageUrl}" target="_blank" style="color: #4285F4;">View Full Image</a></p>
                </div>
            `;
        }

        await sendEmail({
            to: process.env.ORDER_EMAIL || "orders@yourbusiness.com",
            subject: "New Order — Korean Store",
            text: plainText,
            html: htmlBody
        });
        res.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Backend email error:", error);
        res.status(500).json({ message: "Failed to send email via server" });
    }
};

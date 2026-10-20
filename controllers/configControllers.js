const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { sendEmail } = require("../utils/mailer");
const { renderOrderEmail, getEmailAttachments } = require("../utils/emailTemplates");

function getWaybillEmail() {
    try {
        const envPath = path.resolve(__dirname, "../.env");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            const parsed = dotenv.parse(envContent);
            if (parsed.WAYBILL_EMAIL && parsed.WAYBILL_EMAIL.trim()) {
                return parsed.WAYBILL_EMAIL.trim();
            }
        }
    } catch (e) {}
    return process.env.WAYBILL_EMAIL || "d.chandima163@gmail.com";
}

exports.getConfig = async (req, res) => {
    try {
        res.json({
            whatsappNumber: process.env.WHATSAPP_NUMBER || "94771234567",
            orderEmail: process.env.ORDER_EMAIL || "orders@yourbusiness.com",
            waybillEmail: getWaybillEmail()
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch config" });
    }
};

exports.sendOrderEmail = async (req, res) => {
    console.log("Received send-order-email request:", JSON.stringify(req.body, null, 2));
    const { summary, email, slipImageUrl, orderData } = req.body;

    // Support both legacy (summary-only) and new (orderData) formats
    if (!summary && !orderData) {
        return res.status(400).json({ message: "Order summary or orderData is required" });
    }

    try {
        let adminPlainText = "";
        let adminHtmlBody = "";
        let customerPlainText = "";
        let customerHtmlBody = "";

        if (orderData) {
            const { name, phone, secondaryPhone, address, country, postalCode, items, subtotal, deliveryFee, grandTotal } = orderData;

            // ── Admin Order Notification ──
            const adminEmailResult = renderOrderEmail({
                title: "🛒 New Order Received",
                subtitle: "Samee and Sandu — Store Order Notification",
                customer: {
                    name,
                    phone,
                    secondaryPhone,
                    country,
                    postalCode,
                    address
                },
                items: items || [],
                subtotal,
                deliveryFee,
                grandTotal,
                slipImageUrl: slipImageUrl || null,
                showHelp: false
            });
            adminHtmlBody = adminEmailResult.html;
            adminPlainText = adminEmailResult.text;

            // ── Customer Order Confirmation ──
            const customerEmailResult = renderOrderEmail({
                title: "🛒 Order Confirmation",
                subtitle: "Samee and Sandu — Thank You For Your Order",
                statusAlert: {
                    type: "info",
                    message: `Hello <strong>${name || "Valued Customer"}</strong>,<br/>Thank you for shopping with us! We have received your order details and are preparing your items. You will be notified as soon as your package is dispatched.`
                },
                customer: {
                    name,
                    phone,
                    secondaryPhone,
                    country,
                    postalCode,
                    address
                },
                items: items || [],
                subtotal,
                deliveryFee,
                grandTotal,
                slipImageUrl: slipImageUrl || null,
                showHelp: true
            });
            customerHtmlBody = customerEmailResult.html;
            customerPlainText = customerEmailResult.text;
        } else {
            // ── Legacy fallback (plain summary text) ──
            const summaryText = String(summary || "");
            adminPlainText = summaryText.replace(/\*/g, "");
            if (slipImageUrl) adminPlainText += `\n\nPayment Slip: ${slipImageUrl}`;

            adminHtmlBody = `<pre style="font-family: inherit;">${summaryText.replace(/\*/g, "<b>").replace(/\*/g, "</b>")}</pre>`;
            if (slipImageUrl) {
                adminHtmlBody += `
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                        <p style="font-weight: bold; margin-bottom: 8px;">📎 Payment Slip:</p>
                        <img src="${slipImageUrl}" alt="Payment Slip" style="max-width: 400px; width: 100%; border-radius: 8px; border: 1px solid #eee;" />
                        <p style="margin-top: 8px;"><a href="${slipImageUrl}" target="_blank" style="color: #4285F4;">View Full Image</a></p>
                    </div>
                `;
            }
            customerHtmlBody = adminHtmlBody;
            customerPlainText = adminPlainText;
        }

        // Send to Site Owner
        await sendEmail({
            to: process.env.ORDER_EMAIL || "orders@yourbusiness.com",
            subject: "🛒 New Order — Samee and Sandu",
            text: adminPlainText,
            html: adminHtmlBody,
            attachments: getEmailAttachments()
        });

        // Send Confirmation to Customer
        const customerEmail = email || orderData?.email;
        if (customerEmail) {
            try {
                await sendEmail({
                    to: customerEmail,
                    subject: "🛒 Order Confirmation — Samee and Sandu",
                    text: customerPlainText,
                    html: customerHtmlBody,
                    attachments: getEmailAttachments()
                });
            } catch (customerErr) {
                console.error("Failed to send customer confirmation email:", customerErr);
            }
        }

        res.json({ message: "Order processed and emails sent successfully" });
    } catch (error) {
        console.error("Backend email error:", error);
        res.status(500).json({ 
            message: "Failed to send email via server", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/mailer");
const { renderOrderEmail, getEmailAttachments } = require("../utils/emailTemplates");
const { getWhatsAppNumber, getOrderEmail, getWaybillEmail } = require("../utils/envHelper");

exports.getConfig = async (req, res) => {
    try {
        res.json({
            whatsappNumber: getWhatsAppNumber(),
            orderEmail: getOrderEmail(),
            waybillEmail: getWaybillEmail()
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch config" });
    }
};

exports.sendOrderEmail = async (req, res) => {
    let { summary, email, slipImageUrl, orderData } = req.body;

    if (slipImageUrl) {
        if (slipImageUrl.includes("localhost") || slipImageUrl.includes("127.0.0.1")) {
            slipImageUrl = slipImageUrl.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/gi, "https://sameeandsandu.com");
        } else if (slipImageUrl.startsWith("/uploads")) {
            slipImageUrl = `https://sameeandsandu.com${slipImageUrl}`;
        }
    }

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

            // ── Customer Order Received (Waiting for Payment Confirmation) ──
            const customerEmailResult = renderOrderEmail({
                title: "⏳ Order Received",
                subtitle: "Samee and Sandu — Waiting for Payment Confirmation",
                statusAlert: {
                    type: "pending",
                    message: `Hello <strong>${name || "Valued Customer"}</strong>,<br/>Thank you for your order! We have received your order details and are currently <strong>waiting for bank payment confirmation</strong>. Once our team verifies your payment slip, you will receive a payment confirmation email and we will dispatch your items.`
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
                slipImageUrl: null, // Customer does not need the slip image sent back to them
                showHelp: true
            });
            customerHtmlBody = customerEmailResult.html;
            customerPlainText = customerEmailResult.text;
        } else {
            // ── Legacy fallback (plain summary text) ──
            const summaryText = String(summary || "");
            adminPlainText = summaryText.replace(/\*/g, "");
            customerPlainText = summaryText.replace(/\*/g, "");
            if (slipImageUrl) adminPlainText += `\n\nPayment Slip: ${slipImageUrl}`;

            adminHtmlBody = `<pre style="font-family: inherit;">${summaryText.replace(/\*/g, "<b>").replace(/\*/g, "</b>")}</pre>`;
            customerHtmlBody = adminHtmlBody;
            if (slipImageUrl) {
                adminHtmlBody += `
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                        <p style="font-weight: bold; margin-bottom: 8px;">📎 Payment Slip:</p>
                        <img src="${slipImageUrl}" alt="Payment Slip" style="max-width: 400px; width: 100%; border-radius: 8px; border: 1px solid #eee;" />
                        <p style="margin-top: 8px;"><a href="${slipImageUrl}" target="_blank" style="color: #4285F4;">View Full Image</a></p>
                    </div>
                `;
            }
        }

        // Send to Site Owner
        await sendEmail({
            to: getOrderEmail(),
            subject: "🛒 New Order — Samee and Sandu",
            text: adminPlainText,
            html: adminHtmlBody,
            attachments: getEmailAttachments()
        });

        // Send Initial Order Received Email to Customer
        const customerEmail = email || orderData?.email;
        if (customerEmail) {
            try {
                await sendEmail({
                    to: customerEmail,
                    subject: "⏳ Order Received (Waiting for Payment Confirmation) — Samee and Sandu",
                    text: customerPlainText,
                    html: customerHtmlBody,
                    attachments: getEmailAttachments()
                });
            } catch (customerErr) {
                console.error("Failed to send customer order received email:", customerErr);
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

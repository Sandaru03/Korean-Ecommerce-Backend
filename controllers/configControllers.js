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
    console.log("Received send-order-email request:", JSON.stringify(req.body, null, 2));
    const { summary, email, slipImageUrl, orderData } = req.body;

    // Support both legacy (summary-only) and new (orderData) formats
    if (!summary && !orderData) {
        return res.status(400).json({ message: "Order summary or orderData is required" });
    }

    try {
        let plainText = "";
        let htmlBody = "";

        if (orderData) {
            // ─── New rich email with product images ───
            const { name, phone, address, items, subtotal, deliveryFee, grandTotal, totalItems } = orderData;

            // Helper to format numbers
            const fmt = (n) => {
                try {
                    return new Intl.NumberFormat("en-IN").format(n || 0);
                } catch (e) {
                    return (n || 0).toLocaleString();
                }
            };

            // ── Plain text fallback ──
            plainText = `🛒 New Order\n\n`;
            plainText += `Name: ${name || "—"}\n`;
            plainText += `Phone: ${phone || "—"}\n`;
            plainText += `Address: ${address || "—"}\n\n`;
            plainText += `Items:\n`;
            (items || []).forEach(item => {
                plainText += `• ${item.name} x${item.qty} — LKR ${fmt(item.price * item.qty)}\n`;
            });
            plainText += `\nSubtotal: LKR ${fmt(subtotal)}\n`;
            plainText += deliveryFee > 0 ? `Delivery Fee: LKR ${fmt(deliveryFee)} (${totalItems} items)\n` : `Delivery: Free\n`;
            plainText += `Total: LKR ${fmt(grandTotal)}\n`;
            if (slipImageUrl) plainText += `\nPayment Slip: ${slipImageUrl}`;

            // ── Build item rows with images ──
            let itemRowsHtml = "";
            (items || []).forEach(item => {
                const imgSrc = item.image || "";
                const imgHtml = imgSrc
                    ? `<img src="${imgSrc}" alt="${item.name}" width="80" height="80" style="width:80px;height:80px;object-fit:contain;border-radius:8px;border:1px solid #eee;background:#f9f9f9;display:block;" />`
                    : `<div style="width:80px;height:80px;background:#f5f5f5;border-radius:8px;border:1px solid #eee;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:28px;">📦</div>`;

                itemRowsHtml += `
                <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle;width:96px;">
                        ${imgHtml}
                    </td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;vertical-align:middle;">
                        <p style="margin:0;font-weight:700;font-size:14px;color:#111;">${item.name}</p>
                        <p style="margin:4px 0 0;font-size:12px;color:#777;">Unit Price: LKR ${fmt(item.price)}</p>
                    </td>
                    <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle;text-align:center;width:60px;">
                        <span style="display:inline-block;background:#f5f5f5;border:1px solid #e0e0e0;border-radius:6px;padding:4px 12px;font-weight:700;font-size:14px;color:#333;">×${item.qty}</span>
                    </td>
                    <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle;text-align:right;width:120px;">
                        <span style="font-weight:800;font-size:15px;color:#111;">LKR ${fmt(item.price * item.qty)}</span>
                    </td>
                </tr>`;
            });

            // ── Payment slip section ──
            let slipHtml = "";
            if (slipImageUrl) {
                slipHtml = `
                <div style="margin-top:24px;padding:20px;background:#f0f7ff;border-radius:12px;border:1px solid #d0e3f7;">
                    <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#1a56db;">📎 Payment Slip</p>
                    <img src="${slipImageUrl}" alt="Payment Slip" style="max-width:400px;width:100%;border-radius:8px;border:1px solid #d0e3f7;display:block;" />
                    <p style="margin:10px 0 0;"><a href="${slipImageUrl}" target="_blank" style="color:#1a56db;font-size:13px;font-weight:600;text-decoration:underline;">View Full Image ↗</a></p>
                </div>`;
            }

            // ── Assemble full HTML email ──
            htmlBody = `
            <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333;background:#ffffff;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#c0392b 0%,#e74c3c 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🛒 New Order Received</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Samee and Sandu — Order Notification</p>
                </div>

                <div style="padding:28px 32px;">
                    <!-- Customer Details -->
                    <div style="background:#f8f9fa;border-radius:10px;padding:20px;margin-bottom:24px;border:1px solid #e9ecef;">
                        <h2 style="margin:0 0 14px;font-size:15px;color:#111;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">👤 Customer Details</h2>
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:6px 0;font-size:13px;color:#777;width:90px;vertical-align:top;">Name</td>
                                <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111;">${name || "—"}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:13px;color:#777;vertical-align:top;">Phone</td>
                                <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111;">${phone || "—"}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:13px;color:#777;vertical-align:top;">Address</td>
                                <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111;">${address || "—"}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Order Items -->
                    <h2 style="margin:0 0 16px;font-size:15px;color:#111;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">📦 Order Items</h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                        ${itemRowsHtml}
                    </table>

                    <!-- Totals -->
                    <div style="background:#f8f9fa;border-radius:10px;padding:20px;border:1px solid #e9ecef;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:6px 0;font-size:14px;color:#555;">Subtotal (${totalItems || 0} items)</td>
                                <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111;text-align:right;">LKR ${fmt(subtotal)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:14px;color:#555;">Delivery</td>
                                <td style="padding:6px 0;font-size:14px;font-weight:600;text-align:right;color:${deliveryFee > 0 ? '#c0392b' : '#16a34a'};">${deliveryFee > 0 ? `LKR ${fmt(deliveryFee)}` : 'FREE'}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding:0;"><div style="border-top:2px solid #111;margin:10px 0;"></div></td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:18px;font-weight:800;color:#111;">Total</td>
                                <td style="padding:6px 0;font-size:20px;font-weight:900;color:#c0392b;text-align:right;">LKR ${fmt(grandTotal)}</td>
                            </tr>
                        </table>
                    </div>

                    ${slipHtml}
                </div>

                <!-- Footer -->
                <div style="padding:20px 32px;background:#f8f9fa;border-radius:0 0 12px 12px;border-top:1px solid #e9ecef;">
                    <p style="margin:0;font-size:12px;color:#999;text-align:center;">This email was generated automatically by Samee and Sandu</p>
                </div>
            </div>`;
        } else {
            // ─── Legacy fallback (plain summary text) ───
            const summaryText = String(summary || "");
            plainText = summaryText.replace(/\*/g, "");
            if (slipImageUrl) plainText += `\n\nPayment Slip: ${slipImageUrl}`;

            htmlBody = `<pre style="font-family: inherit;">${summaryText.replace(/\*/g, "<b>").replace(/\*/g, "</b>")}</pre>`;
            if (slipImageUrl) {
                htmlBody += `
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
            to: process.env.ORDER_EMAIL || "orders@yourbusiness.com",
            subject: "🛒 New Order — Samee and Sandu",
            text: plainText,
            html: htmlBody
        });

        // Send Confirmation to Customer
        if (email) {
            try {
                await sendEmail({
                    to: email,
                    subject: "🛒 Order Confirmation — Samee and Sandu",
                    text: plainText,
                    html: htmlBody
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

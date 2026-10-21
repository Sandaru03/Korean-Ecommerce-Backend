const path = require("path");
const fs = require("fs");

/**
 * Format a number with commas (e.g. 12,500)
 */
const fmt = (n) => {
    try {
        return new Intl.NumberFormat("en-IN").format(Math.round(Number(n) || 0));
    } catch (e) {
        return Math.round(Number(n) || 0).toLocaleString();
    }
};

/**
 * Normalize any image URL so localhost or relative links are converted to live domain
 */
const normalizeEmailImageUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    let clean = url.trim().replace(/\\/g, "/");
    if (clean.includes("localhost") || clean.includes("127.0.0.1")) {
        clean = clean.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/gi, "https://sameeandsandu.com");
    } else if (clean.startsWith("/")) {
        clean = `https://sameeandsandu.com${clean}`;
    } else if (clean.startsWith("uploads/")) {
        clean = `https://sameeandsandu.com/${clean}`;
    } else if (clean.startsWith("http://sameeandsandu.com")) {
        clean = clean.replace("http://sameeandsandu.com", "https://sameeandsandu.com");
    }
    return clean;
};

const LOGO_PUBLIC_URL = "https://sameeandsandu.com/assets/email-logo.png";

/**
 * Return the inline logo attachment for Nodemailer
 */
const getLogoAttachment = () => {
    const logoPath = path.resolve(__dirname, "../assets/email-logo.png");
    if (fs.existsSync(logoPath)) {
        return {
            filename: "logo.png",
            path: logoPath,
            cid: "sitelogo",
            contentType: "image/png",
            contentDisposition: "inline"
        };
    }
    return null;
};

/**
 * Return an array of attachments including the logo (if present)
 */
const getEmailAttachments = (extraAttachments = []) => {
    const logo = getLogoAttachment();
    const attachments = [...(extraAttachments || [])];
    if (logo) {
        attachments.push(logo);
    }
    return attachments;
};

/**
 * Build the unified HTML email matching Samee & Sandu brand theme:
 * - Gradient Crimson Header (#c0392b -> #e74c3c)
 * - Site Logo in header
 * - Modern typography and card layout (#f8f9fa)
 * - Rich items table with product thumbnails, qty pill, line totals
 * - Detailed totals summary
 * - Customer & delivery details
 * - Optional status message banner
 * - Optional payment slip preview
 * - Help box with WhatsApp and Email
 * - Automated brand footer
 */
const renderOrderEmail = ({
    title = "🛒 New Order Received",
    subtitle = "Samee and Sandu — Order Notification",
    orderId = null,
    statusAlert = null, // { type: 'pending' | 'success' | 'info', message: string }
    customer = {},      // { name, phone, secondaryPhone, address, country, city, postalCode }
    items = [],         // [{ name / productName, image, price, qty }]
    subtotal = null,
    deliveryFee = null,
    grandTotal = null,
    slipImageUrl = null,
    showHelp = true,
    customContentHtml = null
}) => {
    // ── Parse items safely ──
    let parsedItems = items;
    if (typeof parsedItems === "string") {
        try {
            parsedItems = JSON.parse(parsedItems);
        } catch {
            parsedItems = [];
        }
    }
    if (!Array.isArray(parsedItems)) parsedItems = [];

    // Calculate subtotal if not provided
    let calcSubtotal = 0;
    let totalItemsCount = 0;
    parsedItems.forEach(item => {
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        calcSubtotal += price * qty;
        totalItemsCount += qty;
    });

    const finalSubtotal = subtotal !== null && subtotal !== undefined ? Number(subtotal) : calcSubtotal;
    const finalGrandTotal = grandTotal !== null && grandTotal !== undefined ? Number(grandTotal) : (finalSubtotal + (Number(deliveryFee) || 0));
    const finalDeliveryFee = deliveryFee !== null && deliveryFee !== undefined ? Number(deliveryFee) : (finalGrandTotal > finalSubtotal ? finalGrandTotal - finalSubtotal : 0);

    // ── Customer Details ──
    const custName = customer.name || "—";
    const custPhone = customer.phone ? `${customer.phone}${customer.secondaryPhone ? ` / ${customer.secondaryPhone}` : ""}` : "—";
    const destCountry = customer.country || "Sri Lanka";
    const postalStr = customer.postalCode ? ` (Postal: ${customer.postalCode})` : "";
    const custDest = `${destCountry}${customer.city ? `, ${customer.city}` : ""}${postalStr}`;
    const custAddress = customer.address || "—";

    // ── Build Item Rows HTML ──
    let itemRowsHtml = "";
    parsedItems.forEach(item => {
        const itemName = item.productName || item.name || "Product";
        const itemQty = Number(item.qty) || 1;
        const itemPrice = Number(item.price) || 0;
        const lineTotal = itemPrice * itemQty;
        const rawImg = item.image || (Array.isArray(item.images) ? item.images[0] : null) || "";
        const imgSrc = normalizeEmailImageUrl(rawImg);

        const imgHtml = imgSrc
            ? `<img src="${imgSrc}" alt="${itemName}" width="76" height="76" style="width:76px;height:76px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb;background:#ffffff;display:block;" />`
            : `<div style="width:76px;height:76px;background:#f3f4f6;border-radius:8px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:26px;text-align:center;line-height:76px;">📦</div>`;

        itemRowsHtml += `
        <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;width:86px;">
                ${imgHtml}
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                <p style="margin:0;font-weight:700;font-size:14px;color:#111827;line-height:1.4;">${itemName}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Unit Price: LKR ${fmt(itemPrice)}</p>
            </td>
            <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;text-align:center;width:64px;">
                <span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:4px 10px;font-weight:700;font-size:13px;color:#374151;">×${itemQty}</span>
            </td>
            <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;text-align:right;width:120px;">
                <span style="font-weight:800;font-size:15px;color:#111827;">LKR ${fmt(lineTotal)}</span>
            </td>
        </tr>`;
    });

    // ── Order ID Chip ──
    const orderChipHtml = orderId ? `
        <div style="margin-top:10px;">
            <span style="display:inline-block;background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.4);color:#ffffff;padding:4px 14px;border-radius:20px;font-weight:700;font-size:13px;letter-spacing:0.5px;">Order #${orderId}</span>
        </div>` : "";

    // ── Status Alert Banner ──
    let statusBannerHtml = "";
    if (statusAlert) {
        let borderCol = "#c0392b";
        let bgCol = "#fff5f5";
        let textCol = "#1f2937";
        if (statusAlert.type === "success") {
            borderCol = "#16a34a";
            bgCol = "#f0fdf4";
            textCol = "#14532d";
        } else if (statusAlert.type === "info") {
            borderCol = "#2563eb";
            bgCol = "#eff6ff";
            textCol = "#1e3a8a";
        }
        statusBannerHtml = `
        <div style="background:${bgCol};border-left:4px solid ${borderCol};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;line-height:1.6;color:${textCol};">${statusAlert.message}</p>
        </div>`;
    }

    // ── Payment Slip Section ──
    let slipHtml = "";
    if (slipImageUrl) {
        const cleanSlipUrl = normalizeEmailImageUrl(slipImageUrl);
        slipHtml = `
        <div style="margin-top:24px;padding:20px;background:#f8f9fa;border-radius:12px;border:1px solid #e9ecef;">
            <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#c0392b;">📎 Attached Payment Slip</p>
            <img src="${cleanSlipUrl}" alt="Payment Slip" style="max-width:400px;width:100%;border-radius:8px;border:1px solid #e5e7eb;display:block;" />
            <p style="margin:10px 0 0;"><a href="${cleanSlipUrl}" target="_blank" style="color:#c0392b;font-size:13px;font-weight:600;text-decoration:underline;">View Full Image ↗</a></p>
        </div>`;
    }

    // ── Help Card ──
    let helpHtml = "";
    if (showHelp) {
        const { getWhatsAppNumber, getOrderEmail } = require("./envHelper");
        const whatsappNumber = getWhatsAppNumber();
        const orderEmail = getOrderEmail();
        const cleanWa = whatsappNumber.replace(/[^0-9]/g, "");
        helpHtml = `
        <div style="margin-top:24px;background:#fff8f6;border-radius:12px;padding:20px;border:1px solid #ffdcd4;">
            <h3 style="margin:0 0 10px;font-size:15px;color:#991b1b;font-weight:800;">💬 Need Help with Your Order?</h3>
            <p style="margin:0 0 8px;font-size:13px;color:#4b5563;line-height:1.5;">If you have any questions or need to make changes, our support team is ready to help:</p>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6b7280;width:90px;">WhatsApp:</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:700;"><a href="https://wa.me/${cleanWa}" target="_blank" style="color:#16a34a;text-decoration:none;">📱 +${cleanWa}</a></td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6b7280;">Email:</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:700;"><a href="mailto:${orderEmail}" style="color:#c0392b;text-decoration:none;">✉️ ${orderEmail}</a></td>
                </tr>
            </table>
        </div>`;
    }

    // ── Custom Extra Content (e.g. Waybills or admin specific info) ──
    const customHtml = customContentHtml ? `<div style="margin-bottom:24px;">${customContentHtml}</div>` : "";

    // ── Assemble Full HTML ──
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin:0;padding:24px 0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
            
            <!-- Gradient Crimson Brand Header -->
            <div style="background:linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);padding:30px 32px 26px 32px;text-align:center;">
                <!-- Site Logo -->
                <div style="text-align:center;margin-bottom:12px;">
                    <img src="${LOGO_PUBLIC_URL}" alt="Samee and Sandu" width="160" height="44" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto;display:block;" />
                </div>
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.3;">${title}</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;">${subtitle}</p>
                ${orderChipHtml}
            </div>

            <!-- Email Body Content -->
            <div style="padding:28px 32px;">
                ${statusBannerHtml}
                ${customHtml}

                <!-- Customer Details Card -->
                <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e9ecef;">
                    <h2 style="margin:0 0 14px;font-size:13px;color:#6b7280;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">👤 Customer & Delivery Details</h2>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;width:95px;vertical-align:top;">Name</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111827;">${custName}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;vertical-align:top;">Phone</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111827;">${custPhone}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;vertical-align:top;">Destination</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111827;">${custDest}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;vertical-align:top;">Address</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#111827;line-height:1.4;">${custAddress}</td>
                        </tr>
                    </table>
                </div>

                <!-- Order Items Card -->
                <div style="margin-bottom:24px;">
                    <h2 style="margin:0 0 14px;font-size:13px;color:#6b7280;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">📦 Order Items (${totalItemsCount})</h2>
                    <table style="width:100%;border-collapse:collapse;">
                        ${itemRowsHtml}
                    </table>
                </div>

                <!-- Totals Box -->
                <div style="background:#f8f9fa;border-radius:12px;padding:20px;border:1px solid #e9ecef;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:6px 0;font-size:14px;color:#4b5563;">Subtotal (${totalItemsCount} items)</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;">LKR ${fmt(finalSubtotal)}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:14px;color:#4b5563;">Delivery</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:700;text-align:right;color:${finalDeliveryFee > 0 ? '#c0392b' : '#16a34a'};">${finalDeliveryFee > 0 ? `LKR ${fmt(finalDeliveryFee)}` : 'FREE'}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:0;"><div style="border-top:2px solid #e5e7eb;margin:10px 0;"></div></td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:17px;font-weight:800;color:#111827;">Total Amount</td>
                            <td style="padding:6px 0;font-size:20px;font-weight:900;color:#c0392b;text-align:right;">LKR ${fmt(finalGrandTotal)}</td>
                        </tr>
                    </table>
                </div>

                ${slipHtml}
                ${helpHtml}
            </div>

            <!-- Footer -->
            <div style="padding:22px 32px;background:#f8f9fa;border-radius:0 0 14px 14px;border-top:1px solid #e9ecef;text-align:center;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#374151;">Samee and Sandu • Authentic Korean Cosmetics & Skincare</p>
                <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Thank you for shopping with us! • This email was generated automatically.</p>
            </div>
        </div>
    </body>
    </html>`;

    // ── Assemble Plain Text Fallback ──
    let plainText = `${title}\n${subtitle}\n${orderId ? `Order #${orderId}\n` : ""}\n`;
    if (statusAlert) plainText += `${statusAlert.message.replace(/<[^>]*>?/gm, '')}\n\n`;
    plainText += `CUSTOMER DETAILS:\n`;
    plainText += `Name: ${custName}\nPhone: ${custPhone}\nDestination: ${custDest}\nAddress: ${custAddress}\n\n`;
    plainText += `ORDER ITEMS:\n`;
    parsedItems.forEach(item => {
        const name = item.productName || item.name || "Product";
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        plainText += `• ${name} x${qty} — LKR ${fmt(price * qty)}\n`;
    });
    plainText += `\nSubtotal: LKR ${fmt(finalSubtotal)}\n`;
    plainText += `Delivery: ${finalDeliveryFee > 0 ? `LKR ${fmt(finalDeliveryFee)}` : "FREE"}\n`;
    plainText += `Total: LKR ${fmt(finalGrandTotal)}\n`;
    if (slipImageUrl) plainText += `\nPayment Slip: ${slipImageUrl}\n`;

    return { html: htmlBody, text: plainText };
};

/**
 * Unified Waybill Stickers Email Template
 */
const renderWaybillEmail = ({
    processedCount = 0,
    newlyCreatedCount = 0,
    reusedCount = 0,
    pdfFilename = "waybills.pdf"
}) => {
    const title = "🚚 Custom Waybill Stickers";
    const subtitle = "Samee and Sandu — Logistics Notification";

    const customContentHtml = `
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#14532d;">
            මෙහි ඔබ ඉල්ලූ පරිදි තෝරාගත් ඕඩර් (<strong>${processedCount}</strong>) සඳහා වන ස්ටිකර් PDF ගොනුව අමුණා ඇත.<br/>
            Attached is the generated courier waybill sticker sheet ready for printing.
        </p>
    </div>

    <div style="background:#f8f9fa;border-radius:12px;padding:20px;border:1px solid #e9ecef;">
        <h2 style="margin:0 0 14px;font-size:13px;color:#6b7280;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">📊 Waybill Summary</h2>
        <table style="width:100%;border-collapse:collapse;">
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;">Total Waybills</td>
                <td style="padding:8px 0;font-size:15px;font-weight:800;color:#111827;text-align:right;border-bottom:1px solid #f1f5f9;">${processedCount}</td>
            </tr>
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;">Newly Created</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;color:#16a34a;text-align:right;border-bottom:1px solid #f1f5f9;">${newlyCreatedCount}</td>
            </tr>
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;">Reused Existing</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;color:#2563eb;text-align:right;border-bottom:1px solid #f1f5f9;">${reusedCount}</td>
            </tr>
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Generated Date</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#374151;text-align:right;">${new Date().toLocaleString()}</td>
            </tr>
        </table>
    </div>

    <div style="margin-top:20px;background:#fff8f6;border-radius:10px;padding:14px 18px;border:1px solid #ffdcd4;">
        <p style="margin:0;font-size:12px;color:#7f1d1d;">📄 <strong>Print instructions:</strong> This PDF contains 9 waybills per A4 sheet, formatted precisely for sticker sheet printing.</p>
    </div>`;

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
    </head>
    <body style="margin:0;padding:24px 0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
            <!-- Brand Crimson Header -->
            <div style="background:linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);padding:30px 32px 26px 32px;text-align:center;">
                <div style="text-align:center;margin-bottom:12px;">
                    <img src="${LOGO_PUBLIC_URL}" alt="Samee and Sandu" width="160" height="44" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto;display:block;" />
                </div>
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${title}</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;">${subtitle}</p>
            </div>

            <div style="padding:28px 32px;">
                ${customContentHtml}
            </div>

            <!-- Footer -->
            <div style="padding:22px 32px;background:#f8f9fa;border-radius:0 0 14px 14px;border-top:1px solid #e9ecef;text-align:center;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#374151;">Samee and Sandu • Authentic Korean Cosmetics & Skincare</p>
                <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Automated logistics email.</p>
            </div>
        </div>
    </body>
    </html>`;

    const plainText = `🚚 Custom Waybill Stickers Generated\n\nTotal Orders: ${processedCount}\nNewly Created: ${newlyCreatedCount}\nReused: ${reusedCount}\nDate: ${new Date().toLocaleString()}\n\nAttached is the generated courier waybills sticker PDF sheet (${pdfFilename}).`;

    return { html: htmlBody, text: plainText };
};

module.exports = {
    fmt,
    getLogoAttachment,
    getEmailAttachments,
    renderOrderEmail,
    renderWaybillEmail
};

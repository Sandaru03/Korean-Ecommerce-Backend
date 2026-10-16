const axios = require("axios");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const Order = require("../models/order");
const { sendEmail } = require("../utils/mailer");

/**
 * Locate Chrome or Edge executable on Windows
 */
function getBrowserExecutablePath() {
    const possiblePaths = [
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

/**
 * Helper to extract city from address if city field is empty
 */
function extractCity(address, fallbackCity) {
    if (fallbackCity && fallbackCity.trim()) return fallbackCity.trim();
    if (!address) return "Colombo";
    const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
    // Remove "Sri Lanka" and postal codes if at the end
    const cleaned = parts.filter(
        (p) => !p.toLowerCase().includes("sri lanka") && !/^\d{4,6}$/.test(p)
    );
    if (cleaned.length >= 2) {
        return cleaned[cleaned.length - 1];
    }
    return cleaned[0] || "Colombo";
}

/**
 * Get Waybill background image (local assets file as base64 or remote URL)
 */
function getWaybillBgImage() {
    const assetsDir = path.join(__dirname, "../assets");
    const candidates = [
        "waybill-bg.png",
        "waybill-bg.jpg",
        "waybill-bg.jpeg",
        "waybill-bg.webp",
        "waybill_bg.png",
        "waybill_bg.jpg",
        "waybill-background.png",
        "waybill-background.jpg",
    ];

    for (const name of candidates) {
        const filePath = path.join(assetsDir, name);
        if (fs.existsSync(filePath)) {
            try {
                const ext = path.extname(name).replace(".", "").toLowerCase();
                const mime = ext === "jpg" ? "jpeg" : ext;
                const base64 = fs.readFileSync(filePath).toString("base64");
                return `data:image/${mime};base64,${base64}`;
            } catch (e) {
                console.error("Error reading local waybill background image:", e);
            }
        }
    }

    // Also check uploads directory
    const uploadsDir = path.join(__dirname, "../uploads");
    for (const name of candidates) {
        const filePath = path.join(uploadsDir, name);
        if (fs.existsSync(filePath)) {
            try {
                const ext = path.extname(name).replace(".", "").toLowerCase();
                const mime = ext === "jpg" ? "jpeg" : ext;
                const base64 = fs.readFileSync(filePath).toString("base64");
                return `data:image/${mime};base64,${base64}`;
            } catch (e) {
                console.error("Error reading uploads waybill background image:", e);
            }
        }
    }

    // Fallback to env URL or remote Google Drive image
    return (
        process.env.WAYBILL_BG_URL ||
        "https://lh3.googleusercontent.com/d/1TxRajx-usDbaEg7QvfMlbKqhrhEOCQqg"
    );
}

/**
 * Build 9-per-A4 HTML sticker template
 */
function generateStickersHtml(ordersList) {
    const bgImageUrl = getWaybillBgImage();

    // Split into pages of 9 stickers each
    const pages = [];
    for (let i = 0; i < ordersList.length; i += 9) {
        pages.push(ordersList.slice(i, i + 9));
    }

    let pagesHtml = "";

    pages.forEach((pageOrders, pageIdx) => {
        let stickersHtml = "";

        // Render each order in this page
        pageOrders.forEach((item) => {
            const waybill = item.waybillNo || "PENDING";
            const amount = Number(item.amount || 0);
            const isAlreadyPaid = amount <= 0;

            const qrUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                waybill
            )}&code=QRCode`;
            const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                waybill
            )}&code=Code128&dpi=96`;

            stickersHtml += `
            <div class="sticker">
                <!-- Header Top -->
                <div class="header-top">
                    <div class="fed-brand-box">
                        <div style="display:flex;align-items:center;gap:3px;">
                            <svg class="fed-runner-icon" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#e11d48" d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm3 7a1 1 0 0 0-1-1h-3.5L9.3 6.3A2 2 0 0 0 7.7 5.5H5v2h2.7l1.7 2.1-1.8 3.1-3.3-1.1-.6 1.9 4.3 1.4a2 2 0 0 0 2.2-.7L12 11.4V16h2v-5.6l1.6-1.4H19V7h-4zm-3 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            </svg>
                            <span class="fed-text-main">FED</span>
                        </div>
                        <span class="fed-sub-text">
                            <span class="fed-red">FARDAR EXPRESS</span> <span class="fed-blue">DOMESTIC</span>
                        </span>
                    </div>
                    <span class="waybill-top">Waybill ID : ${waybill}</span>
                </div>

                <!-- Recipient Section -->
                <div class="recipient-section">
                    <div class="section-title-rec">Recipient Details</div>
                    <div class="content-block-rec"><strong>Name:</strong> ${item.name || "Customer"}</div>
                    <div class="content-block-rec"><strong>Address:</strong> ${item.address || "Sri Lanka"}</div>
                    <div class="content-block-rec"><strong>Contact No:</strong> ${item.phone || "—"}${
                item.secondaryPhone ? `, ${item.secondaryPhone}` : ""
            }</div>
                </div>

                <!-- Pickup Section -->
                <div class="pickup-section">
                    <div class="section-title-pick">Pickup Details</div>
                    <div class="pickup-row"><strong>Name:</strong> SAMEE AND SANDU</div>
                    <div class="pickup-row"><strong>Address:</strong> 214-1 KONGODAMULLA KATANA</div>
                    <div class="pickup-row"><strong>Contact No:</strong> 757802149</div>
                    <div class="pickup-row"><strong>Weight:</strong> 1kg</div>
                    <div class="pickup-row"><strong>Order ID:</strong> ${item.orderId}</div>
                    <div class="pickup-row"><strong>Parcel Desc:</strong> ${
                        item.parcelDesc || "Skincare Items"
                    }</div>
                </div>

                <!-- Footer Area -->
                <div class="footer-area">
                    <div class="cod-row ${isAlreadyPaid ? "already-paid" : ""}">
                        ${isAlreadyPaid ? "Already Paid" : `COD : ${amount.toFixed(2)} LKR`}
                    </div>
                    <div class="bottom-content">
                        <img class="qr-img" src="${qrUrl}" alt="QR" />
                        <div class="barcode-wrapper">
                            <img class="barcode-img" src="${barcodeUrl}" alt="Barcode" />
                        </div>
                    </div>
                </div>
            </div>`;
        });

        // Fill empty slots if last page has < 9 stickers to maintain 3x3 geometry
        const emptyCount = 9 - pageOrders.length;
        for (let k = 0; k < emptyCount; k++) {
            stickersHtml += `<div class="sticker empty-sticker"></div>`;
        }

        pagesHtml += `<div class="grid-container">${stickersHtml}</div>`;
    });

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Courier Waybills</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            color: #000;
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(3, 70mm);
            grid-template-rows: repeat(3, 99mm);
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 0;
            page-break-after: always;
        }
        .grid-container:last-child {
            page-break-after: avoid;
        }
        .sticker {
            width: 70mm;
            height: 99mm;
            border: 1px solid #777;
            padding: 3.5mm 4mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-image: linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)), url("${bgImageUrl}");
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
            overflow: hidden;
        }
        .empty-sticker {
            border: 1px dashed #ccc;
            background: #fafafa;
        }
        .header-top {
            height: 12.5mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #777;
            padding-bottom: 1.5mm;
        }
        .fed-brand-box {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .fed-text-main {
            font-size: 4.8mm;
            font-weight: 900;
            color: #0ea5e9;
            letter-spacing: 0.3mm;
            line-height: 1;
            text-shadow: 0.5px 0.5px 0px #e11d48;
        }
        .fed-sub-text {
            font-size: 1.9mm;
            font-weight: 800;
            letter-spacing: 0.15mm;
            margin-top: 0.5mm;
            line-height: 1;
        }
        .fed-red { color: #e11d48; }
        .fed-blue { color: #0ea5e9; }
        .waybill-top {
            font-size: 2.3mm;
            font-weight: bold;
            color: #111;
            white-space: nowrap;
        }
        .recipient-section {
            height: 31mm;
            padding: 1.5mm 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-bottom: 1px solid #777;
        }
        .section-title-rec {
            font-weight: bold;
            font-size: 2.3mm;
            margin-bottom: 0.5mm;
            color: #111;
        }
        .content-block-rec {
            font-size: 2.1mm;
            line-height: 1.15;
            color: #111;
            word-break: break-word;
        }
        .pickup-section {
            height: 27mm;
            padding: 1.5mm 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-bottom: 1px solid #777;
        }
        .section-title-pick {
            font-weight: bold;
            font-size: 2.1mm;
            margin-bottom: 0.5mm;
            color: #111;
        }
        .pickup-row {
            font-size: 1.95mm;
            line-height: 1.1;
            color: #222;
        }
        .footer-area {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-top: 1.5mm;
        }
        .cod-row {
            height: 5.5mm;
            width: 100%;
            text-align: center;
            font-weight: bold;
            font-size: 2.8mm;
            line-height: 5.5mm;
            color: #111;
        }
        .cod-row.already-paid {
            color: #15803d;
            font-size: 3mm;
            font-weight: 900;
        }
        .bottom-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 0 1mm;
            gap: 2mm;
        }
        .qr-img {
            width: 14mm;
            height: 14mm;
            object-fit: contain;
        }
        .barcode-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
        }
        .barcode-img {
            width: 38mm;
            height: 14mm;
            object-fit: contain;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .grid-container { page-break-after: always; }
            .grid-container:last-child { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>`;
}

/**
 * Endpoint: POST /orders/courier/generate-waybills
 * Body: { orderIds: ["ORD00001", "ORD00002", ...] }
 */
exports.generateWaybills = async (req, res) => {
    try {
        const { orderIds } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: "No order IDs provided" });
        }

        console.log(`Generating waybills for ${orderIds.length} orders:`, orderIds);

        // Fetch matching orders
        const orders = await Order.findAll({
            where: { orderId: orderIds },
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: "Selected orders not found" });
        }

        // Filter out non-Sri Lankan orders (Fardar is domestic only)
        const domesticOrders = orders.filter((o) => {
            const country = (o.country || "Sri Lanka").trim().toLowerCase();
            return country === "sri lanka" || country.includes("sri lanka");
        });

        if (domesticOrders.length === 0) {
            return res.status(400).json({
                message:
                    "Fardar Courier Waybills can only be created for Sri Lanka domestic orders.",
            });
        }

        const courierApiUrl = "https://www.fdedomestic.com/api/parcel/new_api_v1.php";
        const processedOrders = [];
        let newlyCreatedCount = 0;
        let reusedCount = 0;
        const errors = [];

        for (const order of domesticOrders) {
            let waybillNo = order.waybillNo;
            const amount = 0; // Default: prepaid via bank transfer / free delivery
            const isFree = order.total >= 20000;
            const parcelDesc = isFree
                ? "Skincare Items - Free Delivery"
                : "Skincare Items";

            // If order already has a valid waybill number, reuse it
            if (
                waybillNo &&
                waybillNo.trim() !== "" &&
                waybillNo.toLowerCase() !== "null" &&
                waybillNo.toLowerCase() !== "skip"
            ) {
                reusedCount++;
                processedOrders.push({
                    orderId: order.orderId,
                    waybillNo: order.waybillNo,
                    amount,
                    parcelDesc,
                    name: order.name,
                    phone: order.phone,
                    secondaryPhone: order.secondaryPhone,
                    address: order.address,
                    city: extractCity(order.address, order.city),
                });
                continue;
            }

            // Otherwise, call courier API to register parcel and get waybill
            try {
                const recipientCity = extractCity(order.address, order.city);
                const payload = new URLSearchParams({
                    api_key: process.env.FED_API_KEY || "250d649ca4df67b4e1b0",
                    client_id: process.env.FED_CLIENT_ID || "19384",
                    waybill_no: "",
                    order_id: order.orderId,
                    parcel_weight: "1",
                    parcel_description: parcelDesc,
                    recipient_name: order.name,
                    recipient_contact_1: order.phone,
                    recipient_contact_2: order.secondaryPhone || order.phone,
                    recipient_address: order.address,
                    recipient_city: recipientCity,
                    pickup_name: process.env.FED_PICKUP_NAME || "SAMEE AND SANDU",
                    pickup_address:
                        process.env.FED_PICKUP_ADDRESS ||
                        "214-1 KONGODAMULLA KATANA",
                    pickup_contact_1: process.env.FED_PICKUP_PHONE || "757802149",
                    amount: String(amount),
                    exchange: "0",
                });

                console.log(
                    `Sending order ${order.orderId} to Fardar Courier API...`
                );
                const courierRes = await axios.post(
                    courierApiUrl,
                    payload.toString(),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        timeout: 15000,
                    }
                );

                const resData = courierRes.data;
                console.log(`Courier API response for ${order.orderId}:`, resData);

                if (
                    resData &&
                    (resData.status == 200 ||
                        resData.status === "200" ||
                        resData.waybill_no)
                ) {
                    const receivedWb = String(resData.waybill_no || "").trim();
                    if (receivedWb) {
                        waybillNo = receivedWb;
                        newlyCreatedCount++;
                        // Save waybill to order in database
                        await order.update({
                            waybillNo: receivedWb,
                            waybillStatus: "sent",
                        });
                    }
                } else {
                    const errMsg = resData?.message || `Status ${resData?.status}`;
                    errors.push({ orderId: order.orderId, error: errMsg });
                }
            } catch (err) {
                console.error(
                    `Courier API call error for ${order.orderId}:`,
                    err.message
                );
                errors.push({ orderId: order.orderId, error: err.message });
            }

            if (waybillNo) {
                processedOrders.push({
                    orderId: order.orderId,
                    waybillNo: waybillNo,
                    amount,
                    parcelDesc,
                    name: order.name,
                    phone: order.phone,
                    secondaryPhone: order.secondaryPhone,
                    address: order.address,
                    city: extractCity(order.address, order.city),
                });
            }
        }

        if (processedOrders.length === 0) {
            return res.status(500).json({
                message: "Failed to generate any waybills from courier API.",
                errors,
            });
        }

        // Build HTML template
        const fullHtml = generateStickersHtml(processedOrders);

        // Generate PDF using puppeteer-core with Edge / Chrome
        let pdfBuffer = null;
        let pdfUrl = null;
        let pdfFilename = `Waybills_${Date.now()}_${processedOrders.length}orders.pdf`;

        const browserPath = getBrowserExecutablePath();
        if (browserPath) {
            try {
                console.log("Launching browser for PDF generation:", browserPath);
                const browser = await puppeteer.launch({
                    executablePath: browserPath,
                    headless: "new",
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-gpu",
                        "--disable-dev-shm-usage",
                    ],
                });
                const page = await browser.newPage();
                await page.setContent(fullHtml, { waitUntil: "networkidle0" });
                pdfBuffer = await page.pdf({
                    format: "A4",
                    printBackground: true,
                    margin: { top: 0, bottom: 0, left: 0, right: 0 },
                });
                await browser.close();
                console.log("PDF generated successfully, size:", pdfBuffer.length);

                // Save PDF to downloads directory
                const downloadDir = path.join(
                    __dirname,
                    "../downloads/waybills"
                );
                if (!fs.existsSync(downloadDir)) {
                    fs.mkdirSync(downloadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(downloadDir, pdfFilename), pdfBuffer);

                const backendBaseUrl =
                    process.env.BASE_URL || "http://localhost:5000";
                pdfUrl = `${backendBaseUrl}/downloads/waybills/${pdfFilename}`;
            } catch (pdfErr) {
                console.error("PDF generation error:", pdfErr);
            }
        } else {
            console.warn(
                "Browser binary not found. PDF creation skipped, HTML preview available."
            );
        }

        // Send Email with PDF attachment if buffer exists
        const recipientEmail =
            process.env.WAYBILL_EMAIL || "sameeandsandu@gmail.com";
        let emailSent = false;

        try {
            const subject = `Custom Waybill Stickers (${processedOrders.length} Orders) - ${new Date().toLocaleDateString(
                "en-GB"
            )}`;
            const mailText = `මෙහි ඔබ ඉල්ලූ පරිදි තෝරාගත් ඕඩර් (${processedOrders.length}) සඳහා වන ස්ටිකර් PDF එක අමුණා ඇත.\n\nAttached is the generated courier waybills sticker PDF sheet.\n\nTotal Orders: ${processedOrders.length}\nNewly Created: ${newlyCreatedCount}\nReused: ${reusedCount}`;
            const mailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #0ea5e9; margin-top: 0;">🚚 Custom Waybill Stickers Generated</h2>
                    <p>මෙහි ඔබ ඉල්ලූ පරිදි තෝරාගත් ඕඩර් සඳහා වන ස්ටිකර් PDF එක අමුණා ඇත.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Waybills:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${processedOrders.length}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Newly Created:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${newlyCreatedCount}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Reused Existing:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${reusedCount}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td></tr>
                    </table>
                    <p style="margin-top: 20px; font-size: 13px; color: #666;">This PDF contains 9 stickers per A4 page, ready for direct sticker printing.</p>
                </div>
            `;

            const attachments = [];
            if (pdfBuffer) {
                attachments.push({
                    filename: pdfFilename,
                    content: pdfBuffer,
                });
            }

            await sendEmail({
                to: recipientEmail,
                subject,
                text: mailText,
                html: mailHtml,
                attachments,
            });
            emailSent = true;
            console.log(`Waybill PDF email sent to ${recipientEmail}`);
        } catch (emailErr) {
            console.error("Failed to email waybill PDF:", emailErr);
        }

        res.json({
            success: true,
            message: `Successfully processed ${processedOrders.length} waybills (${newlyCreatedCount} new, ${reusedCount} reused).`,
            count: processedOrders.length,
            newlyCreatedCount,
            reusedCount,
            pdfUrl,
            pdfFilename,
            emailSent,
            recipientEmail,
            orders: processedOrders.map((o) => ({
                orderId: o.orderId,
                waybillNo: o.waybillNo,
                name: o.name,
            })),
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Critical error in generateWaybills:", error);
        res.status(500).json({
            message: "Failed to generate waybills",
            error: error.message,
        });
    }
};

/**
 * Endpoint: GET /orders/courier/preview-waybills?orderIds=ORD00001,ORD00002
 * Returns printable HTML directly for browser printing
 */
exports.previewWaybillsHtml = async (req, res) => {
    try {
        const orderIdsParam = req.query.orderIds;
        if (!orderIdsParam) {
            return res.status(400).send("No order IDs provided");
        }

        const orderIds = orderIdsParam.split(",").map((s) => s.trim());
        const orders = await Order.findAll({
            where: { orderId: orderIds },
        });

        const list = orders.map((o) => ({
            orderId: o.orderId,
            waybillNo: o.waybillNo || "14759504",
            amount: 0,
            parcelDesc:
                o.total >= 20000
                    ? "Skincare Items - Free Delivery"
                    : "Skincare Items",
            name: o.name,
            phone: o.phone,
            secondaryPhone: o.secondaryPhone,
            address: o.address,
            city: extractCity(o.address, o.city),
        }));

        const html = generateStickersHtml(list);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    } catch (error) {
        res.status(500).send("Error rendering waybill preview: " + error.message);
    }
};

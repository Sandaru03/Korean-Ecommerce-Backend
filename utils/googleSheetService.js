const axios = require("axios");

/**
 * Format order details and send to Google Sheet via Apps Script Webhook URL.
 * Non-blocking & fail-safe: will not throw or break order creation if Google is unreachable.
 *
 * @param {Object} order - Order model instance or plain object
 * @param {Object} extra - Extra context (subtotal, deliveryFee, paymentMethod)
 */
async function syncOrderToGoogleSheet(order, extra = {}) {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.trim()) {
        console.log("[Google Sheets] GOOGLE_SHEET_WEBHOOK_URL is not configured in .env. Skipping sync.");
        return;
    }

    try {
        // Parse items if string
        let itemsList = order.items;
        if (typeof itemsList === "string") {
            try {
                itemsList = JSON.parse(itemsList);
            } catch (e) {
                itemsList = [];
            }
        }
        if (!Array.isArray(itemsList)) itemsList = [];

        // Format items summary: "Product A x2, Product B x1"
        const itemsSummary = itemsList.map(item => {
            const name = item.productName || item.name || "Item";
            const qty = item.qty || item.quantity || 1;
            return `${name} x${qty}`;
        }).join(", ");

        // Format Date/Time (Sri Lanka timezone)
        const orderDate = order.date ? new Date(order.date) : new Date();
        const formattedDate = orderDate.toLocaleString("en-US", {
            timeZone: "Asia/Colombo",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        const subtotal = extra.subtotal || 0;
        const deliveryFee = extra.deliveryFee !== undefined ? extra.deliveryFee : (order.total - subtotal);
        const grandTotal = order.total || (subtotal + deliveryFee);

        const payload = {
            dateTime: formattedDate,
            orderId: order.orderId || "",
            customerName: order.name || "",
            phone: order.phone || "",
            secondaryPhone: order.secondaryPhone || "N/A",
            email: order.email || "",
            country: order.country || "Sri Lanka",
            city: order.city || "",
            postalCode: order.postalCode || "N/A",
            address: order.address || "",
            items: itemsSummary,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            grandTotal: grandTotal,
            paymentMethod: extra.paymentMethod || "Bank Transfer",
            status: order.status || "pending"
        };

        // Send to Google Apps Script Webhook
        const response = await axios.post(webhookUrl.trim(), JSON.stringify(payload), {
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            timeout: 10000,
            maxRedirects: 5
        });

        console.log(`[Google Sheets] Order ${order.orderId} synced successfully:`, response.data);
    } catch (err) {
        console.error(`[Google Sheets] Error syncing order ${order.orderId}:`, err.message);
        if (err.response && err.response.status === 403) {
            console.error(`[Google Sheets] ⚠️ Permission Denied (403): In Google Apps Script, click Deploy > Manage deployments > Edit ✏️ and set 'Who has access' to 'Anyone'!`);
        }
    }
}

module.exports = { syncOrderToGoogleSheet };

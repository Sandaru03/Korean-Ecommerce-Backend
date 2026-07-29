const Order = require("../models/order");
const Product = require("../models/product");
const { isAdmin } = require("./userControllers");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/mailer");

const sendBankTransferPendingEmail = async (order) => {
    try {
        if (!order.email) return;

        let orderLinesHtml = "";
        let orderLinesText = "";

        let parsedItems = [];
        if (order.items) {
            parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        }

        if (Array.isArray(parsedItems)) {
            for (const item of parsedItems) {
                const itemTotal = item.price * item.qty;
                orderLinesText += `• ${item.productName} x${item.qty} — LKR ${itemTotal.toLocaleString()}\n`;
                orderLinesHtml += `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p style="margin: 0; font-weight: bold; color: #111;">${item.productName}</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Qty: ${item.qty}</p>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #111;">
                            LKR ${itemTotal.toLocaleString()}
                        </td>
                    </tr>
                `;
            }
        }

        const plainText = `⏳ Order Pending Bank Transfer Verification\n\nHello ${order.name},\n\nYour order ${order.orderId} has been placed successfully. We are currently checking your bank transfer. Your order will be fully processed and a confirmation email will be sent as soon as it is approved.\n\nOrder Details:\n${orderLinesText}\nTotal: LKR ${Number(order.total || 0).toLocaleString()}\n\nAddress: ${order.address}\n\nNeed Help?\nWhatsApp: ${process.env.WHATSAPP_NUMBER || "Not available"}\nEmail: ${process.env.ORDER_EMAIL || "Not available"}\n\nThank you for shopping with Samee and Sandu!`;

        const htmlBody = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; background-color: #fff;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Order Pending Verification ⏳</h1>
                </div>
                
                <div style="padding: 32px 24px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${order.name}</strong>,</p>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">Your order <strong>${order.orderId}</strong> has been placed successfully! We are currently verifying your bank transfer. Your order will be fully processed and a confirmation email will be sent as soon as the transfer is approved.</p>
                    
                    <div style="margin-top: 32px; background: #f8f9fa; border-radius: 12px; padding: 24px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111; border-bottom: 2px solid #eee; padding-bottom: 12px;">Order Summary</h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                ${orderLinesHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td style="padding: 16px 12px 0 12px; text-align: right; font-weight: bold; color: #555; font-size: 16px;">Total:</td>
                                    <td style="padding: 16px 12px 0 12px; text-align: right; font-weight: 900; color: #111; font-size: 20px;">LKR ${Number(order.total || 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div style="margin-top: 24px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #111;">Delivery Address</h3>
                        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">${order.address}</p>
                    </div>

                    <div style="margin-top: 32px; background: #fff8f1; border-radius: 12px; padding: 24px; border: 1px solid #ffedd5;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #9a3412;">Need Help?</h3>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">If you have any questions about your order, please contact us:</p>
                        <p style="margin: 0 0 4px 0; color: #333; font-size: 14px;"><strong>WhatsApp:</strong> ${process.env.WHATSAPP_NUMBER || "Not available"}</p>
                        <p style="margin: 0; color: #333; font-size: 14px;"><strong>Email:</strong> ${process.env.ORDER_EMAIL || "Not available"}</p>
                    </div>
                </div>
                
                <div style="padding: 20px 32px; background: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999;">Thank you for shopping with Samee and Sandu</p>
                </div>
            </div>
        `;

        await sendEmail({
            to: order.email,
            subject: "Order Pending Bank Transfer — Samee and Sandu",
            text: plainText,
            html: htmlBody
        });
        console.log(`Pending bank transfer email sent for order ${order.orderId}`);
    } catch (error) {
        console.error("Error sending pending bank transfer email:", error);
    }
};

const sendPaymentConfirmation = async (order) => {
    try {
        if (!order.email) return;

        let orderLinesHtml = "";
        let orderLinesText = "";

        let parsedItems = [];
        if (order.items) {
            parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        }

        if (Array.isArray(parsedItems)) {
            for (const item of parsedItems) {
                const itemTotal = item.price * item.qty;
                orderLinesText += `• ${item.productName} x${item.qty} — LKR ${itemTotal.toLocaleString()}\n`;
                orderLinesHtml += `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p style="margin: 0; font-weight: bold; color: #111;">${item.productName}</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Qty: ${item.qty}</p>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #111;">
                            LKR ${itemTotal.toLocaleString()}
                        </td>
                    </tr>
                `;
            }
        }

        const plainText = `🛒 Payment Confirmed!

Hello ${order.name},

Great news! Your payment for order ${order.orderId} has been confirmed. We are now processing your order.

Order Details:
${orderLinesText}
Total: LKR ${Number(order.total || 0).toLocaleString()}

Address: ${order.address}

Need Help?
WhatsApp: ${process.env.WHATSAPP_NUMBER || "Not available"}
Email: ${process.env.ORDER_EMAIL || "Not available"}

Thank you for shopping with Samee and Sandu!`;

        const htmlBody = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; background-color: #fff;">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Payment Confirmed! 🎉</h1>
                </div>
                
                <div style="padding: 32px 24px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${order.name}</strong>,</p>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">Great news! We have successfully received your payment for order <strong>${order.orderId}</strong>. We're now processing your items.</p>
                    
                    <div style="margin-top: 32px; background: #f8f9fa; border-radius: 12px; padding: 24px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111; border-bottom: 2px solid #eee; padding-bottom: 12px;">Order Summary</h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                ${orderLinesHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td style="padding: 16px 12px 0 12px; text-align: right; font-weight: bold; color: #555; font-size: 16px;">Total:</td>
                                    <td style="padding: 16px 12px 0 12px; text-align: right; font-weight: 900; color: #111; font-size: 20px;">LKR ${Number(order.total || 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div style="margin-top: 24px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #111;">Delivery Address</h3>
                        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">${order.address}</p>
                    </div>

                    <div style="margin-top: 32px; background: #eff6ff; border-radius: 12px; padding: 24px; border: 1px solid #dbeafe;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e40af;">Need Help?</h3>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">If you have any questions about your order, please contact us:</p>
                        <p style="margin: 0 0 4px 0; color: #333; font-size: 14px;"><strong>WhatsApp:</strong> ${process.env.WHATSAPP_NUMBER || "Not available"}</p>
                        <p style="margin: 0; color: #333; font-size: 14px;"><strong>Email:</strong> ${process.env.ORDER_EMAIL || "Not available"}</p>
                    </div>
                </div>
                
                <div style="padding: 20px 32px; background: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999;">Thank you for shopping with Samee and Sandu</p>
                </div>
            </div>
        `;

        await sendEmail({
            to: order.email,
            subject: "Payment Confirmed — Samee and Sandu",
            text: plainText,
            html: htmlBody
        });
        console.log(`Payment confirmation email sent for order ${order.orderId}`);
    } catch (error) {
        console.error("Error sending payment confirmation email:", error);
    }
};

exports.createOrder = async (req, res) => {
    try {
        if (req.user == null) {
            return res.status(401).json({ message: "Please Login to create an order" });
        }

        // Generate next orderId
        const latestOrder = await Order.findOne({ order: [["date", "DESC"]] });
        let orderId = "ORD00001";

        if (latestOrder) {
            const lastNum = parseInt(latestOrder.orderId.replace("ORD", ""));
            if (!isNaN(lastNum)) {
                orderId = "ORD" + (lastNum + 1).toString().padStart(5, "0");
            }
        }

        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).json({ message: "Invalid item format" });
        }

        const items = [];
        let total = 0;

        for (const item of req.body.items) {
            const product = await Product.findOne({ where: { productId: item.productId } });
            if (!product) {
                return res.status(400).json({ message: "Invalid product Id : " + item.productId });
            }

            // Parse images safely — DB may return a JSON string instead of array
            let productImages = product.images;
            if (typeof productImages === "string") {
                try { productImages = JSON.parse(productImages); } catch { productImages = [productImages]; }
            }
            if (!Array.isArray(productImages)) productImages = [];

            items.push({
                productId: product.productId,
                productName: product.name,
                image: productImages[0] || null,
                price: product.price,
                qty: item.qty,
            });

            total += product.price * item.qty;
        }

        const newOrder = await Order.create({
            orderId,
            email: req.body.email || req.user.email,
            name: (req.body.firstName && req.body.lastName) ? (req.body.firstName + " " + req.body.lastName) : (req.user.firstName + " " + req.user.lastName),
            address: req.body.address,
            phone: req.body.phone,
            items,
            total,
        });

        if (req.body.paymentMethod === 'bank') {
            await sendBankTransferPendingEmail(newOrder);
        }

        res.json({ message: "Order Created Successfully", result: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;
    const search = req.query.search || "";
    const fromDate = req.query.fromDate || "";
    const toDate = req.query.toDate || "";

    console.log("Fetching orders with query:", { page, limit, search, fromDate, toDate });

    if (req.user == null) {
        return res.status(401).json({ message: "Please Login to view orders" });
    }

    try {
        let where = req.user.role === "admin" ? {} : { email: req.user.email };

        if (search) {
            where.orderId = { [Op.like]: `%${search}%` };
        }

        if (fromDate || toDate) {
            const dateClause = {};
            if (fromDate) {
                dateClause[Op.gte] = `${fromDate} 00:00:00`;
            }
            if (toDate) {
                dateClause[Op.lte] = `${toDate} 23:59:59`;
            }
            where.date = dateClause;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            order: [["date", "DESC"]],
            limit,
            offset: (page - 1) * limit,
        });

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

exports.updateOrder = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const orderId = req.params.id;
        const { status, notes } = req.body;

        const previousOrder = await Order.findOne({ where: { orderId } });
        if (!previousOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const [count] = await Order.update(
            { status, notes },
            { where: { orderId } }
        );

        if (count === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const updatedOrder = await Order.findOne({ where: { orderId } });
        
        if (status === "payment_completed" && previousOrder.status !== "payment_completed") {
            await sendPaymentConfirmation(updatedOrder);
        }

        res.json({ message: "Order updated successfully", order: updatedOrder });
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).json({ message: "Failed to update order" });
    }
};

exports.bulkUpdateOrders = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { orderIds, status } = req.body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: "No order IDs provided" });
        }

        let ordersToEmail = [];
        if (status === "payment_completed") {
            ordersToEmail = await Order.findAll({
                where: { 
                    orderId: { [Op.in]: orderIds },
                    status: { [Op.ne]: "payment_completed" }
                }
            });
        }

        const [count] = await Order.update(
            { status },
            { where: { orderId: { [Op.in]: orderIds } } }
        );

        if (status === "payment_completed" && ordersToEmail.length > 0) {
            for (const order of ordersToEmail) {
                await sendPaymentConfirmation(order);
            }
        }

        res.json({ message: `${count} orders updated successfully` });
    } catch (err) {
        console.error("Error bulk updating orders:", err);
        res.status(500).json({ message: "Failed to bulk update orders" });
    }
};

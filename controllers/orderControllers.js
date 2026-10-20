const Order = require("../models/order");
const Product = require("../models/product");
const { isAdmin } = require("./userControllers");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/mailer");
const { syncOrderToGoogleSheet, updateGoogleSheetOrderStatus } = require("../utils/googleSheetService");
const { renderOrderEmail, getEmailAttachments } = require("../utils/emailTemplates");

const sendBankTransferPendingEmail = async (order) => {
    try {
        if (!order.email) return;

        let parsedItems = [];
        if (order.items) {
            parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        }

        const { html, text } = renderOrderEmail({
            title: "⏳ Order Pending Verification",
            subtitle: "Samee and Sandu — Order Verification",
            orderId: order.orderId,
            statusAlert: {
                type: "pending",
                message: `Hello <strong>${order.name || "Valued Customer"}</strong>,<br/>Your order <strong>${order.orderId}</strong> has been placed successfully! We are currently checking your bank transfer. Your items will be processed and dispatched as soon as the transfer is approved.`
            },
            customer: {
                name: order.name,
                phone: order.phone,
                secondaryPhone: order.secondaryPhone,
                country: order.country,
                city: order.city,
                postalCode: order.postalCode,
                address: order.address
            },
            items: parsedItems,
            grandTotal: order.total,
            showHelp: true
        });

        await sendEmail({
            to: order.email,
            subject: `Order Pending Verification (${order.orderId}) — Samee and Sandu`,
            text,
            html,
            attachments: getEmailAttachments()
        });
        console.log(`Pending bank transfer email sent for order ${order.orderId}`);
    } catch (error) {
        console.error("Error sending pending bank transfer email:", error);
    }
};

const sendPaymentConfirmation = async (order) => {
    try {
        if (!order.email) return;

        let parsedItems = [];
        if (order.items) {
            parsedItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        }

        const { html, text } = renderOrderEmail({
            title: "✅ Payment Confirmed!",
            subtitle: "Samee and Sandu — Order Processing",
            orderId: order.orderId,
            statusAlert: {
                type: "success",
                message: `Hello <strong>${order.name || "Valued Customer"}</strong>,<br/>Great news! We have successfully received and verified your payment for order <strong>${order.orderId}</strong>. We are now processing and packing your items for delivery.`
            },
            customer: {
                name: order.name,
                phone: order.phone,
                secondaryPhone: order.secondaryPhone,
                country: order.country,
                city: order.city,
                postalCode: order.postalCode,
                address: order.address
            },
            items: parsedItems,
            grandTotal: order.total,
            showHelp: true
        });

        await sendEmail({
            to: order.email,
            subject: `Payment Confirmed (${order.orderId}) — Samee and Sandu`,
            text,
            html,
            attachments: getEmailAttachments()
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

        const country = req.body.country || "Sri Lanka";
        const isDomestic = !country || country.trim().toLowerCase().includes("sri lanka");
        const district = req.body.district || null;

        // Sri Lanka 25 Districts Delivery Rates (LKR)
        const DISTRICT_DELIVERY_FEES = {
            "Colombo": 400, "Gampaha": 400, "Kalutara": 400,
            "Kandy": 450, "Matale": 450, "Nuwara Eliya": 450,
            "Galle": 450, "Matara": 450, "Hambantota": 450,
            "Trincomalee": 450, "Kurunegala": 450, "Puttalam": 450,
            "Anuradhapura": 450, "Polonnaruwa": 450, "Badulla": 450,
            "Ratnapura": 450, "Kegalle": 450,
            "Jaffna": 500, "Kilinochchi": 500, "Mannar": 500,
            "Vavuniya": 500, "Mullaitivu": 500, "Batticaloa": 500,
            "Ampara": 500, "Monaragala": 500
        };

        // Delivery fee calculation: Free for orders >= 20,000 LKR or International; otherwise exact district rate
        let deliveryFee = 0;
        if (isDomestic && total > 0 && total < 20000) {
            if (district && DISTRICT_DELIVERY_FEES[district]) {
                deliveryFee = DISTRICT_DELIVERY_FEES[district];
            } else if (req.body.deliveryFee !== undefined && !isNaN(Number(req.body.deliveryFee))) {
                deliveryFee = Number(req.body.deliveryFee);
            } else {
                deliveryFee = 400; // standard base rate fallback
            }
        }
        const grandTotal = total + deliveryFee;

        const city = req.body.city || null;
        const postalCode = req.body.postalCode || null;

        const newOrder = await Order.create({
            orderId,
            email: req.body.email || req.user.email,
            name: (req.body.firstName && req.body.lastName) ? (req.body.firstName + " " + req.body.lastName) : (req.user.firstName + " " + req.user.lastName),
            address: req.body.address,
            country,
            city,
            postalCode,
            phone: req.body.phone,
            secondaryPhone: req.body.secondaryPhone || null,
            items,
            total: grandTotal,
        });

        if (req.body.paymentMethod === 'bank') {
            await sendBankTransferPendingEmail(newOrder);
        }

        // Asynchronously sync order to Google Sheets (non-blocking)
        syncOrderToGoogleSheet(newOrder, {
            subtotal: total,
            deliveryFee,
            paymentMethod: req.body.paymentMethod || "Bank Transfer"
        }).catch(err => console.error("Google Sheets sync failed:", err.message));

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
    const destination = req.query.destination || "all"; // 'all' | 'srilanka' | 'international'

    console.log("Fetching orders with query:", { page, limit, search, fromDate, toDate, destination });

    if (req.user == null) {
        return res.status(401).json({ message: "Please Login to view orders" });
    }

    try {
        let where = req.user.role === "admin" ? {} : { email: req.user.email };
        const andConditions = [];

        if (search) {
            andConditions.push({
                [Op.or]: [
                    { orderId: { [Op.like]: `%${search}%` } },
                    { name: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                    { country: { [Op.like]: `%${search}%` } }
                ]
            });
        }

        if (destination === "srilanka") {
            andConditions.push({
                [Op.or]: [
                    { country: "Sri Lanka" },
                    { country: { [Op.like]: "%Sri Lanka%" } }
                ]
            });
        } else if (destination === "international") {
            andConditions.push({
                country: {
                    [Op.and]: [
                        { [Op.ne]: "Sri Lanka" },
                        { [Op.notLike]: "%Sri Lanka%" }
                    ]
                }
            });
        }

        if (fromDate || toDate) {
            const dateClause = {};
            if (fromDate) {
                dateClause[Op.gte] = `${fromDate} 00:00:00`;
            }
            if (toDate) {
                dateClause[Op.lte] = `${toDate} 23:59:59`;
            }
            andConditions.push({ date: dateClause });
        }

        if (andConditions.length > 0) {
            where[Op.and] = andConditions;
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
        console.error("Failed to fetch orders:", err);
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

        // Sync to Google Sheet only for payment_completed, cancelled, or pending
        // (Other statuses like processing, shipped, in_transit, delivered leave the sheet as Payment Complete)
        if (status === "payment_completed") {
            updateGoogleSheetOrderStatus(orderId, "Payment Complete");
        } else if (status === "cancelled") {
            updateGoogleSheetOrderStatus(orderId, "Cancelled");
        } else if (status === "pending") {
            updateGoogleSheetOrderStatus(orderId, "Pending");
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

        // Sync to Google Sheet only for payment_completed, cancelled, or pending
        if (status === "payment_completed") {
            orderIds.forEach(id => updateGoogleSheetOrderStatus(id, "Payment Complete"));
        } else if (status === "cancelled") {
            orderIds.forEach(id => updateGoogleSheetOrderStatus(id, "Cancelled"));
        } else if (status === "pending") {
            orderIds.forEach(id => updateGoogleSheetOrderStatus(id, "Pending"));
        }

        res.json({ message: `${count} orders updated successfully` });
    } catch (err) {
        console.error("Error bulk updating orders:", err);
        res.status(500).json({ message: "Failed to bulk update orders" });
    }
};

const Order = require("../models/order");
const Product = require("../models/product");
const { isAdmin } = require("./userControllers");
const { Op } = require("sequelize");

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
            email: req.user.email,
            name: req.user.firstName + " " + req.user.lastName,
            address: req.body.address,
            phone: req.body.phone,
            items,
            total,
        });

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

        const [count] = await Order.update(
            { status, notes },
            { where: { orderId } }
        );

        if (count === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const updatedOrder = await Order.findOne({ where: { orderId } });
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

        const [count] = await Order.update(
            { status },
            { where: { orderId: { [Op.in]: orderIds } } }
        );

        res.json({ message: `${count} orders updated successfully` });
    } catch (err) {
        console.error("Error bulk updating orders:", err);
        res.status(500).json({ message: "Failed to bulk update orders" });
    }
};

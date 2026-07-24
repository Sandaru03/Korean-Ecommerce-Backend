const ProductRequest = require("../models/ProductRequest");

// POST /product-requests - Public endpoint to create a request
exports.createRequest = async (req, res) => {
    try {
        const { productName, sourceUrl, message, name, mobileNumber } = req.body;
        
        if (!productName || !name || !mobileNumber) {
            return res.status(400).json({ success: false, message: "Product Name, Name, and Mobile Number are required." });
        }

        const newRequest = await ProductRequest.create({
            productName,
            sourceUrl,
            message,
            name,
            mobileNumber,
        });

        return res.status(201).json({ success: true, message: "Product request submitted successfully.", data: newRequest });
    } catch (err) {
        console.error("Error creating product request:", err);
        return res.status(500).json({ success: false, message: "Server error creating product request" });
    }
};

// GET /product-requests - Admin endpoint to get all requests
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await ProductRequest.findAll({ order: [["createdAt", "DESC"]] });
        return res.status(200).json({ success: true, data: requests });
    } catch (err) {
        console.error("Error fetching product requests:", err);
        return res.status(500).json({ success: false, message: "Server error fetching product requests" });
    }
};

// DELETE /product-requests/:id - Admin endpoint to delete a request
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ProductRequest.findByPk(id);
        
        if (!request) {
            return res.status(404).json({ success: false, message: "Product request not found." });
        }
        
        await request.destroy();
        return res.status(200).json({ success: true, message: "Product request deleted successfully." });
    } catch (err) {
        console.error("Error deleting product request:", err);
        return res.status(500).json({ success: false, message: "Server error deleting product request" });
    }
};

const Reel = require('../models/Reel');
const Product = require('../models/product');
const cloudinary = require('../utils/cloudinary');

// Define association
Reel.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

const reelsController = {
  // Get all active reels (for homepage)
  getActiveReels: async (req, res) => {
    try {
      const reels = await Reel.findAll({
        where: { isActive: true },
        include: [{ 
          model: Product, 
          as: 'product',
          attributes: ['id', 'name', 'price', 'labellPrice', 'images'] 
        }],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, reels });
    } catch (error) {
      console.error("Error fetching active reels:", error);
      res.status(500).json({ success: false, message: "Failed to fetch reels" });
    }
  },

  // Get all reels (for admin dashboard)
  getAllReels: async (req, res) => {
    try {
      const reels = await Reel.findAll({
        include: [{ 
          model: Product, 
          as: 'product',
          attributes: ['id', 'name', 'price', 'labellPrice', 'images'] 
        }],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, reels });
    } catch (error) {
      console.error("Error fetching all reels:", error);
      res.status(500).json({ success: false, message: "Failed to fetch reels" });
    }
  },

  // Get single reel by ID
  getReelById: async (req, res) => {
    try {
      const { id } = req.params;
      const reel = await Reel.findByPk(id, {
        include: [{ 
          model: Product, 
          as: 'product',
          attributes: ['id', 'name', 'price', 'labellPrice', 'images'] 
        }]
      });

      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }

      res.json({ success: true, reel });
    } catch (error) {
      console.error("Error fetching reel:", error);
      res.status(500).json({ success: false, message: "Failed to fetch reel" });
    }
  },

  // Create new reel and upload video (and optional product image) to Cloudinary
  createReel: async (req, res) => {
    try {
      const { title, description, brandName, productName, productPrice, discountPercentage, taglines, productId } = req.body;

      if (!req.files || !req.files.video) {
        return res.status(400).json({ success: false, message: "No video file provided" });
      }

      const videoFile = req.files.video[0];
      const productImageFile = req.files.productImage ? req.files.productImage[0] : null;

      // Upload Video to Cloudinary
      const videoUploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "reels" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(videoFile.buffer);
      });

      // Upload Product Image to Cloudinary (if provided)
      let productImageUrl = null;
      if (productImageFile) {
        const imageUploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "reels/products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(productImageFile.buffer);
        });
        productImageUrl = await imageUploadPromise;
      }

      const videoUrl = await videoUploadPromise;

      // Save to database
      const newReel = await Reel.create({
        title: title || "New Reel",
        description,
        videoUrl,
        brandName,
        productName,
        productPrice,
        discountPercentage,
        productImageUrl,
        taglines,
        productId: productId || null,
        isActive: true,
      });

      res.status(201).json({ success: true, reel: newReel, message: "Reel created successfully" });
    } catch (error) {
      console.error("Error creating reel:", error);
      res.status(500).json({ success: false, message: "Failed to create reel", error: error.message });
    }
  },

  // Toggle reel active status
  toggleReelStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const reel = await Reel.findByPk(id);

      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }

      reel.isActive = !reel.isActive;
      await reel.save();

      res.json({ success: true, reel, message: "Reel status updated" });
    } catch (error) {
      console.error("Error toggling reel status:", error);
      res.status(500).json({ success: false, message: "Failed to update reel status" });
    }
  },

  // Delete a reel
  deleteReel: async (req, res) => {
    try {
      const { id } = req.params;
      const reel = await Reel.findByPk(id);

      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }

      await reel.destroy();
      res.json({ success: true, message: "Reel deleted successfully" });
    } catch (error) {
      console.error("Error deleting reel:", error);
      res.status(500).json({ success: false, message: "Failed to delete reel" });
    }
  },

  // Update reel details (title, productId)
  updateReel: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, productId, isActive } = req.body;
      const reel = await Reel.findByPk(id);

      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }

      if (title !== undefined) reel.title = title;
      if (productId !== undefined) reel.productId = productId || null;
      if (isActive !== undefined) reel.isActive = isActive;

      await reel.save();

      const updatedReel = await Reel.findByPk(id, {
        include: [{ 
          model: Product, 
          as: 'product',
          attributes: ['id', 'name', 'price', 'labellPrice', 'images'] 
        }]
      });

      res.json({ success: true, reel: updatedReel, message: "Reel updated successfully" });
    } catch (error) {
      console.error("Error updating reel:", error);
      res.status(500).json({ success: false, message: "Failed to update reel" });
    }
  },
};

module.exports = reelsController;

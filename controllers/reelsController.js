const Reel = require('../models/Reel');
const Product = require('../models/product');
const { deleteLocalFile } = require('../utils/localFileHelper');

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

  // Create new reel — video and product image are saved to disk by Multer
  createReel: async (req, res) => {
    try {
      const { title, description, brandName, productName, productPrice, discountPercentage, taglines, productId } = req.body;

      if (!req.files || !req.files.video) {
        return res.status(400).json({ success: false, message: "No video file provided" });
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      
      const videoFile = req.files.video[0];
      const productImageFile = req.files.productImage ? req.files.productImage[0] : null;

      // Build public URLs from saved file paths
      const videoUrl = `${baseUrl}/uploads/reels/${videoFile.filename}`;
      let productImageUrl = null;
      if (productImageFile) {
        productImageUrl = `${baseUrl}/uploads/reels/products/${productImageFile.filename}`;
      }

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

      // Delete video and product image from local storage before removing DB record
      if (reel.videoUrl) {
        await deleteLocalFile(reel.videoUrl, 'video');
      }
      if (reel.productImageUrl) {
        await deleteLocalFile(reel.productImageUrl, 'image');
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

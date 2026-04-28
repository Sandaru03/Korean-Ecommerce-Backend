const HomePageTopic = require('../models/homePageTopic');
const Product = require('../models/product');
const { Op } = require('sequelize');
const { deleteLocalFile, deleteLocalFiles } = require('../utils/localFileHelper');

// Helper: safely parse a JSON products field into an array of numbers
function safeProductIds(raw) {
    let ids = raw;
    if (typeof ids === 'string') {
        try { ids = JSON.parse(ids); } catch { return []; }
    }
    if (!Array.isArray(ids)) return [];
    return ids.map(Number).filter(n => !isNaN(n));
}

exports.getAllTopics = async (req, res) => {
    try {
        const query = req.query.admin ? {} : { active: true };
        const topics = await HomePageTopic.findAll({ where: query });

        // Fetch full product objects for each topic
        const topicsWithProducts = await Promise.all(topics.map(async (topic) => {
            const productIds = safeProductIds(topic.products);
            if (productIds.length > 0) {
                const fetchedProducts = await Product.findAll({
                    where: { id: { [Op.in]: productIds } }
                });
                return { ...topic.toJSON(), products: fetchedProducts };
            }
            return { ...topic.toJSON(), products: [] };
        }));

        res.status(200).json({ success: true, topics: topicsWithProducts });
    } catch (error) {
        console.error("Error fetching topics:", error);
        res.status(500).json({ success: false, message: 'Server error fetching topics.' });
    }
};

exports.createTopic = async (req, res) => {
    try {
    const { title, active, products, bannerImage, bannerImages } = req.body;
    const newTopic = await HomePageTopic.create({ 
        title, 
        active, 
        products: products || [], 
        bannerImage, 
        bannerImages: bannerImages || [] 
    });
        res.status(201).json({ success: true, topic: newTopic });
    } catch (error) {
        console.error("Error creating topic:", error);
        res.status(500).json({ success: false, message: 'Server error creating topic.' });
    }
};

exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, active, products, bannerImage, bannerImages } = req.body;
        const topic = await HomePageTopic.findByPk(id);
        
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found.' });
        }

        // Delete old bannerImage if it's changed or cleared
        if (bannerImage !== undefined && bannerImage !== topic.bannerImage && topic.bannerImage) {
            await deleteLocalFile(topic.bannerImage, 'image');
        }

        // Delete removed images from bannerImages array
        if (bannerImages !== undefined) {
            const oldImages = Array.isArray(topic.bannerImages) ? topic.bannerImages : [];
            const newImages = Array.isArray(bannerImages) ? bannerImages : [];
            const removedImages = oldImages.filter(img => !newImages.includes(img) && img);
            if (removedImages.length > 0) {
                await deleteLocalFiles(removedImages);
            }
        }

        topic.title = title !== undefined ? title : topic.title;
        topic.active = active !== undefined ? active : topic.active;
        topic.bannerImage = bannerImage !== undefined ? bannerImage : topic.bannerImage;
        topic.bannerImages = bannerImages !== undefined ? bannerImages : topic.bannerImages;
        // Always store product IDs as plain integers
        if (products !== undefined) {
            topic.products = safeProductIds(products);
        }

        await topic.save();
        res.status(200).json({ success: true, topic });
    } catch (error) {
        const fs = require('fs');
        fs.appendFileSync('crash.log', new Date().toISOString() + ' UpdateTopic Error: ' + error.stack + '\n');
        console.error("Error updating topic:", error);
        res.status(500).json({ success: false, message: 'Server error updating topic.' });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await HomePageTopic.findByPk(id);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found.' });
        }

        // Delete banner images from local storage
        if (topic.bannerImage) {
            await deleteLocalFile(topic.bannerImage, 'image');
        }
        const extraImages = Array.isArray(topic.bannerImages) ? topic.bannerImages : [];
        await deleteLocalFiles(extraImages);

        await topic.destroy();
        res.status(200).json({ success: true, message: 'Topic deleted successfully.' });
    } catch (error) {
        console.error("Error deleting topic:", error);
        res.status(500).json({ success: false, message: 'Server error deleting topic.' });
    }
};

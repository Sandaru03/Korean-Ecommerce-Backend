const BannerSection = require('../models/bannerSection');
const Product = require('../models/product');
const { Op } = require('sequelize');

function safeProductIds(raw) {
    let ids = raw;
    if (typeof ids === 'string') {
        try { ids = JSON.parse(ids); } catch { return []; }
    }
    if (!Array.isArray(ids)) return [];
    return ids.map(Number).filter(n => !isNaN(n));
}

// GET /banner-sections?bannerId=1
exports.getSectionsForBanner = async (req, res) => {
    try {
        const { bannerId } = req.query;
        const where = bannerId ? { bannerId: Number(bannerId) } : {};
        const sections = await BannerSection.findAll({
            where,
            order: [['order', 'ASC'], ['createdAt', 'ASC']],
        });

        const sectionsWithProducts = await Promise.all(sections.map(async (section) => {
            const productIds = safeProductIds(section.products);
            if (productIds.length > 0) {
                const fetchedProducts = await Product.findAll({
                    where: { id: { [Op.in]: productIds } }
                });
                return { ...section.toJSON(), products: fetchedProducts };
            }
            return { ...section.toJSON(), products: [] };
        }));

        res.status(200).json({ success: true, sections: sectionsWithProducts });
    } catch (error) {
        console.error('Error fetching banner sections:', error);
        res.status(500).json({ success: false, message: 'Server error fetching banner sections.' });
    }
};

// POST /banner-sections
exports.createSection = async (req, res) => {
    try {
        const { bannerId, title, badge, description, products, order } = req.body;
        if (!bannerId || !title) {
            return res.status(400).json({ success: false, message: 'bannerId and title are required.' });
        }
        const section = await BannerSection.create({
            bannerId,
            title,
            badge: badge || '',
            description: description || '',
            products: safeProductIds(products || []),
            order: order || 0,
        });
        res.status(201).json({ success: true, section });
    } catch (error) {
        console.error('Error creating banner section:', error);
        res.status(500).json({ success: false, message: 'Server error creating banner section.' });
    }
};

// PUT /banner-sections/:id
exports.updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, badge, description, products, order } = req.body;
        const section = await BannerSection.findByPk(id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found.' });
        }

        if (title !== undefined) section.title = title;
        if (badge !== undefined) section.badge = badge;
        if (description !== undefined) section.description = description;
        if (order !== undefined) section.order = order;
        if (products !== undefined) section.products = safeProductIds(products);

        await section.save();
        res.status(200).json({ success: true, section });
    } catch (error) {
        console.error('Error updating banner section:', error);
        res.status(500).json({ success: false, message: 'Server error updating banner section.' });
    }
};

// DELETE /banner-sections/:id
exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BannerSection.destroy({ where: { id } });
        if (deleted === 0) {
            return res.status(404).json({ success: false, message: 'Section not found.' });
        }
        res.status(200).json({ success: true, message: 'Section deleted.' });
    } catch (error) {
        console.error('Error deleting banner section:', error);
        res.status(500).json({ success: false, message: 'Server error deleting banner section.' });
    }
};

const HomePageTopic = require('../models/homePageTopic');
const Product = require('../models/product');

exports.getAllTopics = async (req, res) => {
    try {
        const query = req.query.admin ? {} : { active: true };
        const topics = await HomePageTopic.findAll({ where: query });
        
        // Fetch products for each topic if stored as JSON array of IDs
        const topicsWithProducts = await Promise.all(topics.map(async (topic) => {
            const productIds = topic.products || [];
            if (productIds.length > 0) {
                const fetchedProducts = await Product.findAll({
                    where: { id: productIds }
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
        const { title, active, products } = req.body;
        const newTopic = await HomePageTopic.create({ title, active, products: products || [] });
        res.status(201).json({ success: true, topic: newTopic });
    } catch (error) {
        console.error("Error creating topic:", error);
        res.status(500).json({ success: false, message: 'Server error creating topic.' });
    }
};

exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, active, products } = req.body;
        const topic = await HomePageTopic.findByPk(id);
        
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found.' });
        }

        topic.title = title !== undefined ? title : topic.title;
        topic.active = active !== undefined ? active : topic.active;
        topic.products = products !== undefined ? products : topic.products;

        await topic.save();
        res.status(200).json({ success: true, topic });
    } catch (error) {
        console.error("Error updating topic:", error);
        res.status(500).json({ success: false, message: 'Server error updating topic.' });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTopicCount = await HomePageTopic.destroy({ where: { id } });
        if (deletedTopicCount === 0) {
            return res.status(404).json({ success: false, message: 'Topic not found.' });
        }
        res.status(200).json({ success: true, message: 'Topic deleted successfully.' });
    } catch (error) {
        console.error("Error deleting topic:", error);
        res.status(500).json({ success: false, message: 'Server error deleting topic.' });
    }
};

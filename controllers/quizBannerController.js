const QuizBannerConfig = require('../models/QuizBannerConfig');

exports.getQuizBanner = async (req, res) => {
    try {
        let banner = await QuizBannerConfig.findOne();
        if (!banner) {
            // Return default config if nothing exists
            return res.json({
                success: true,
                banner: {
                    image: '/Skin.jpg.jpeg',
                    quizPageImage: '/skin 2.jpg.jpeg',
                    link: '/quiz',
                    isActive: true
                }
            });
        }
        res.json({ success: true, banner });
    } catch (error) {
        console.error("Error fetching quiz banner:", error);
        res.status(500).json({ success: false, message: "Failed to fetch quiz banner" });
    }
};

exports.updateQuizBanner = async (req, res) => {
    try {
        const { image, quizPageImage, link, isActive } = req.body;
        
        let banner = await QuizBannerConfig.findOne();
        
        if (banner) {
            if (image !== undefined) banner.image = image;
            if (quizPageImage !== undefined) banner.quizPageImage = quizPageImage;
            if (link !== undefined) banner.link = link;
            if (isActive !== undefined) banner.isActive = isActive;
            await banner.save();
        } else {
            banner = await QuizBannerConfig.create({
                image,
                quizPageImage,
                link: link || '/quiz',
                isActive: isActive !== undefined ? isActive : true
            });
        }
        
        res.json({ success: true, banner, message: "Quiz banner updated successfully" });
    } catch (error) {
        console.error("Error updating quiz banner:", error);
        res.status(500).json({ success: false, message: "Failed to update quiz banner" });
    }
};

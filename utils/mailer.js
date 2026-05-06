const nodemailer = require("nodemailer");

/**
 * Reusable mailer utility
 * Configures a transporter using environment variables and provides a sendEmail function.
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 * @returns {Promise} - Resolves with info if successful
 */
const sendEmail = async (options) => {
    const mailOptions = {
        from: `"Samee and Sandu" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendEmail };

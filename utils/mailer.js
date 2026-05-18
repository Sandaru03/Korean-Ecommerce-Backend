const nodemailer = require("nodemailer");

/**
 * Reusable mailer utility
 * Configures a transporter using environment variables and provides a sendEmail function.
 */

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("CRITICAL: SMTP_USER or SMTP_PASS is missing from environment variables!");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("SMTP Verification Error:", error);
    } else {
        console.log("SMTP Server is ready to take our messages");
    }
});

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 * @returns {Promise} - Resolves with info if successful
 */
const sendEmail = async (options) => {
    const fromEmail = process.env.SMTP_USER || "noreply@sameeandsandu.com";
    const mailOptions = {
        from: `"Samee and Sandu" <${fromEmail}>`,
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

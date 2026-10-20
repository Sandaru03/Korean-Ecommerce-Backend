const nodemailer = require("nodemailer");
const { getSmtpConfig } = require("./envHelper");

/**
 * Reusable dynamic mailer utility
 * Dynamically updates SMTP credentials if changed in .env without server restart.
 */

let currentTransporter = null;
let currentKey = "";

function getTransporter() {
    const config = getSmtpConfig();
    const key = `${config.host}:${config.port}:${config.user}:${config.pass}`;

    if (!currentTransporter || currentKey !== key) {
        if (!config.user || !config.pass) {
            console.warn("[Mailer] Warning: SMTP_USER or SMTP_PASS is missing in .env");
        }
        currentTransporter = nodemailer.createTransport({
            host: config.host || "smtp.gmail.com",
            port: config.port || 587,
            secure: config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        currentKey = key;
        console.log(`[Mailer] Initialized SMTP transporter for user: ${config.user || 'none'}`);
    }
    return currentTransporter;
}

// Initial transporter initialization
getTransporter();

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 * @returns {Promise} - Resolves with info if successful
 */
const sendEmail = async (options) => {
    const transporter = getTransporter();
    const config = getSmtpConfig();
    const fromEmail = config.user || "noreply@sameeandsandu.com";
    const mailOptions = {
        from: `"Samee and Sandu" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || [],
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

module.exports = { sendEmail, getTransporter };

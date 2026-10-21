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

        // Note: Do NOT use service: "gmail" on cPanel hosts because it defaults to port 465,
        // which is blocked by most cPanel host firewalls (causing ECONNREFUSED).
        // Port 587 with STARTTLS (secure: false) works reliably across all hosting providers.
        const port = parseInt(config.port, 10) || 587;
        const transportOptions = {
            host: config.host || "smtp.gmail.com",
            port: port,
            secure: port === 465, // true for 465, false for 587
            auth: {
                user: config.user,
                pass: config.pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        currentTransporter = nodemailer.createTransport(transportOptions);
        currentKey = key;
        console.log(`[Mailer] Initialized SMTP transporter (${config.host}:${port}) for user: ${config.user || 'none'}`);
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

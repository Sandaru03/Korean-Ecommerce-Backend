const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env");

let cachedEnv = {};
let lastMtime = 0;

/**
 * Reads and parses the latest .env file from disk.
 * Uses file modification timestamp (mtime) caching so disk I/O only occurs when .env is actually edited.
 */
function getFreshEnv() {
    try {
        if (fs.existsSync(envPath)) {
            const stats = fs.statSync(envPath);
            if (!cachedEnv || stats.mtimeMs > lastMtime) {
                const envContent = fs.readFileSync(envPath, "utf-8");
                const parsed = dotenv.parse(envContent);
                cachedEnv = parsed;
                lastMtime = stats.mtimeMs;
                // Synchronize into process.env so third-party access also gets the latest values
                for (const [k, v] of Object.entries(parsed)) {
                    if (v !== undefined) {
                        process.env[k] = v;
                    }
                }
            }
            return cachedEnv;
        }
    } catch (err) {
        console.error("Error reading .env dynamically:", err.message);
    }
    return process.env;
}

function getOrderEmail() {
    const env = getFreshEnv();
    return (env.ORDER_EMAIL && env.ORDER_EMAIL.trim()) || process.env.ORDER_EMAIL || "d.chandima163@gmail.com";
}

function getWhatsAppNumber() {
    const env = getFreshEnv();
    return (env.WHATSAPP_NUMBER && env.WHATSAPP_NUMBER.trim()) || process.env.WHATSAPP_NUMBER || "94713592022";
}

function getWaybillEmail() {
    const env = getFreshEnv();
    return (env.WAYBILL_EMAIL && env.WAYBILL_EMAIL.trim()) || process.env.WAYBILL_EMAIL || "d.chandima163@gmail.com";
}

function getSmtpConfig() {
    const env = getFreshEnv();
    return {
        host: env.SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(env.SMTP_PORT || process.env.SMTP_PORT) || 587,
        user: env.SMTP_USER || process.env.SMTP_USER || "",
        pass: env.SMTP_PASS || process.env.SMTP_PASS || ""
    };
}

module.exports = {
    getFreshEnv,
    getOrderEmail,
    getWhatsAppNumber,
    getWaybillEmail,
    getSmtpConfig
};

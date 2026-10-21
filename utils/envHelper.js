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
                // Only set process.env if not already defined in system environment (e.g. cPanel)
                for (const [k, v] of Object.entries(parsed)) {
                    if (v !== undefined && !process.env[k]) {
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
    return (process.env.ORDER_EMAIL && process.env.ORDER_EMAIL.trim()) || (env.ORDER_EMAIL && env.ORDER_EMAIL.trim()) || "d.chandima163@gmail.com";
}

function getWhatsAppNumber() {
    const env = getFreshEnv();
    return (process.env.WHATSAPP_NUMBER && process.env.WHATSAPP_NUMBER.trim()) || (env.WHATSAPP_NUMBER && env.WHATSAPP_NUMBER.trim()) || "94713592022";
}

function getWaybillEmail() {
    const env = getFreshEnv();
    return (process.env.WAYBILL_EMAIL && process.env.WAYBILL_EMAIL.trim()) || (env.WAYBILL_EMAIL && env.WAYBILL_EMAIL.trim()) || "d.chandima163@gmail.com";
}

function getSmtpConfig() {
    const env = getFreshEnv();
    // Prioritize process.env (cPanel Setup Node.js App environment variables) over disk .env
    const rawUser = (process.env.SMTP_USER || env.SMTP_USER || "").trim();
    let rawPass = (process.env.SMTP_PASS || env.SMTP_PASS || "").trim();

    // Strip surrounding quotes if present in .env
    if ((rawPass.startsWith('"') && rawPass.endsWith('"')) || (rawPass.startsWith("'") && rawPass.endsWith("'"))) {
        rawPass = rawPass.slice(1, -1).trim();
    }

    // For Gmail 16-character App Passwords (e.g., 'xxxx xxxx xxxx xxxx'), strip internal spaces
    const host = process.env.SMTP_HOST || env.SMTP_HOST || "smtp.gmail.com";
    const isGmail = host.includes("gmail") || rawUser.endsWith("@gmail.com");
    if (isGmail && rawPass.replace(/\s+/g, '').length === 16) {
        rawPass = rawPass.replace(/\s+/g, '');
    }

    return {
        host,
        port: parseInt(process.env.SMTP_PORT || env.SMTP_PORT, 10) || 587,
        user: rawUser,
        pass: rawPass
    };
}

module.exports = {
    getFreshEnv,
    getOrderEmail,
    getWhatsAppNumber,
    getWaybillEmail,
    getSmtpConfig
};

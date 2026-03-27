require("dotenv").config();
const { sendEmail } = require("./utils/mailer");

async function testMail() {
    console.log("Testing email configuration...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_USER:", process.env.SMTP_USER);

    try {
        await sendEmail({
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from Korean Ecommerce",
            text: "If you are receiving this, your SMTP configuration is working correctly!",
            html: "<b>If you are receiving this, your SMTP configuration is working correctly!</b>",
        });
        console.log("SUCCESS: Test email sent successfully.");
    } catch (error) {
        console.error("FAILED: Could not send test email.");
        console.error(error.message);
    }
}

testMail();

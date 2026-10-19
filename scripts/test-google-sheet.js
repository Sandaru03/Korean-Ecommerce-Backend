require("dotenv").config();
const { syncOrderToGoogleSheet } = require("../utils/googleSheetService");

async function runTest() {
    console.log("==================================================");
    console.log("  Testing Google Sheets Order Sync Integration");
    console.log("==================================================");

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.trim()) {
        console.error("\n❌ ERROR: GOOGLE_SHEET_WEBHOOK_URL is not set in your .env file!");
        console.log("Please add your Google Web App URL to your .env file like this:");
        console.log("GOOGLE_SHEET_WEBHOOK_URL=\"https://script.google.com/macros/s/your_script_id/exec\"\n");
        process.exit(1);
    }

    console.log(`\nWebhook URL found: ${webhookUrl.substring(0, 45)}...`);
    console.log("Sending sample test order to Google Sheets...\n");

    const sampleOrder = {
        orderId: `TEST-${Math.floor(100000 + Math.random() * 900000)}`,
        name: "Test Customer",
        phone: "0771234567",
        secondaryPhone: "0719876543",
        email: "test.customer@example.com",
        country: "Sri Lanka",
        city: "Colombo",
        postalCode: "00500",
        address: "No. 123, Sample Street, Colombo 05",
        items: [
            { productName: "Medicube Age-R Vitamin C Ampoule (15ml)", qty: 1 },
            { productName: "Anua Heartleaf 77% Soothing Toner", qty: 2 }
        ],
        total: 15400,
        status: "pending",
        date: new Date()
    };

    const extra = {
        subtotal: 15000,
        deliveryFee: 400,
        paymentMethod: "Bank Transfer"
    };

    try {
        await syncOrderToGoogleSheet(sampleOrder, extra);
        console.log("\n✅ Test finished! Open your Google Sheet to verify that the new row appeared.");
    } catch (err) {
        console.error("\n❌ Test failed with error:", err.message);
        if (err.message && err.message.includes("403")) {
            console.log("\n👉 TIP: A 403 error means your Apps Script deployment permission is set to 'Only myself'.");
            console.log("In Google Apps Script, click: Deploy > Manage deployments > Edit ✏️");
            console.log("Change 'Who has access' to 'Anyone' and click Deploy again!\n");
        }
    }
}

runTest();

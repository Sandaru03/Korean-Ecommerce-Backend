# Google Sheets Real-Time Order Sync — Complete Setup & Verification Guide

This guide explains how to connect your **Samee & Sandu** store orders directly to a **Google Sheet** in real-time, how to test it, and how to view your data.

---

## 1. How It Works

```
Customer places order (WhatsApp / Email / Bank Transfer)
                      │
                      ▼
        Backend creates order in database
                      │
                      ▼
        Backend pushes order data via HTTP POST
                      │
                      ▼
         Google Apps Script Webhook
                      │
                      ▼
   Google Sheet adds a new row in real-time! 📊
```

- **Non-blocking**: Even if Google servers are slow or offline, your store's orders will never fail or freeze.
- **Configurable**: Managed purely by adding your Google Web App URL to `Korean-Ecommerce-Backend/.env`.

---

## 2. Step-by-Step Setup Guide

### Step 1: Create Your Google Sheet
1. Open your browser and go to: [https://sheets.new](https://sheets.new) (or open Google Drive and create a new Google Sheet).
2. Give the sheet a name at the top left, for example: `Samee & Sandu - Store Orders`.

---

### Step 2: Open Google Apps Script
1. In the Google Sheets top menu bar, click:  
   **Extensions** > **Apps Script**
2. A new browser tab will open showing the code editor with a default `function myFunction() { ... }`.
3. Select and **delete** all existing code in the editor.

---

### Step 3: Paste the Webhook Script
Copy and paste the exact code below into the Apps Script editor:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create header row if sheet is brand new / empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date & Time",
        "Order ID",
        "Customer Name",
        "Phone Number",
        "Secondary Phone",
        "Email",
        "Country",
        "City",
        "Postal Code",
        "Full Address",
        "Items Ordered",
        "Subtotal (LKR)",
        "Delivery Fee (LKR)",
        "Grand Total (LKR)",
        "Payment Method",
        "Order Status"
      ]);
      
      // Format headers with bold text and soft gray background
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
    
    // Append the new order details
    sheet.appendRow([
      data.dateTime || new Date().toLocaleString(),
      data.orderId || "",
      data.customerName || "",
      data.phone || "",
      data.secondaryPhone || "N/A",
      data.email || "",
      data.country || "",
      data.city || "",
      data.postalCode || "N/A",
      data.address || "",
      data.items || "",
      data.subtotal || 0,
      data.deliveryFee || 0,
      data.grandTotal || 0,
      data.paymentMethod || "",
      data.status || "pending"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Click the **Save** icon (💾) or press `Ctrl + S`.

---

### Step 4: Deploy as a Web App
1. At the top right of the Apps Script window, click the blue **Deploy** button > **New deployment**.
2. In the modal that opens, click the gear icon (⚙️) on the left next to *Select type* and choose **Web app**.
3. Fill in the fields:
   - **Description**: `Order Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(⚠️ Crucial: Must be "Anyone" so your website backend can send orders without needing login credentials)*
4. Click **Deploy**.
5. If Google asks for permissions:
   - Click **Authorize access**.
   - Choose your Google account.
   - Click **Advanced** (at the bottom of the security warning) > click **Go to Untitled project (unsafe)**.
   - Click **Allow**.
6. Google will give you a **Web app URL**.  
   It looks like this:  
   `https://script.google.com/macros/s/AKfycbx.../exec`
7. Click **Copy** to copy this URL.

---

### Step 5: Add the URL to Your Backend `.env`
Open your `Korean-Ecommerce-Backend/.env` file and add the URL:

```env
GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_COPIED_ID/exec"
```

Save the `.env` file.

---

## 3. How to Check and Test Your Data

There are **two easy ways** to test and verify that your Google Sheet is receiving orders:

### Option A: Instant 5-Second Terminal Test (Recommended)
You can test the connection immediately without placing a real store order:

1. Open your terminal in `Korean-Ecommerce-Backend`.
2. Run this test command:
   ```bash
   node scripts/test-google-sheet.js
   ```
3. You will see output like this:
   ```
   ==================================================
     Testing Google Sheets Order Sync Integration
   ==================================================

   Webhook URL found: https://script.google.com/macros/s/AKfycb...
   Sending sample test order to Google Sheets...

   [Google Sheets] Order TEST-728192 synced successfully: { status: 'success' }

   ✅ Test completed! Open your Google Sheet to verify that the new row appeared.
   ```
4. Switch to your Google Sheet — you will immediately see the header row and a new test order row with all columns filled!

---

### Option B: Real Store Checkout Test
1. Go to your store frontend (`http://localhost:5173/`).
2. Add any product to your cart and go to **Checkout**.
3. Select your delivery destination (e.g. Sri Lanka or Another Country).
4. Fill in customer details and submit the order.
5. Watch your Google Sheet: a new row will appear automatically within 1 to 2 seconds!

---

## 4. How to View and Manage Incoming Data

### In Google Sheets
- **Live Updates**: Incoming orders appear row-by-row in real-time.
- **Sorting & Filtering**: You can turn on Google Sheet filters (**Data** > **Create a filter**) to filter by Country, City, Payment Method, or Date.
- **Formulas & Summaries**: You can use formulas (e.g. `=SUM(N2:N)`) to calculate total store revenue.

### In Google Apps Script (Execution Logs)
If you ever want to verify incoming HTTP requests:
1. In your Google Sheet, go to **Extensions** > **Apps Script**.
2. Click **Executions** (the clock icon with an arrow on the left sidebar).
3. You will see a log of every order POST request that arrived, its timestamp, and its execution status (`Completed`).

---

## 5. Columns Reference

| Column | Header | Example Content | Notes |
|---|---|---|---|
| A | **Date & Time** | `Oct 19, 2026, 11:45 AM` | Formatted in Sri Lanka timezone |
| B | **Order ID** | `ORD-1729318590` | Matches website database ID |
| C | **Customer Name** | `Kasun Perera` | Full name |
| D | **Phone Number** | `0771234567` | Primary phone |
| E | **Secondary Phone** | `0719876543` / `N/A` | Optional contact |
| F | **Email** | `kasun@example.com` | Customer email |
| G | **Country** | `Sri Lanka` / `Australia` | Delivery destination |
| H | **City** | `Colombo` | City / Town |
| I | **Postal Code** | `00500` / `N/A` | Required for international |
| J | **Full Address** | `No 45, Galle Road, Apt 3B` | Complete delivery address |
| K | **Items Ordered** | `Medicube Ampoule x1, Anua Toner x2` | All items with quantities |
| L | **Subtotal (LKR)** | `7500` | Items total |
| M | **Delivery Fee (LKR)**| `400` / `0` | Calculated delivery fee |
| N | **Grand Total (LKR)** | `7900` | Final amount payable |
| O | **Payment Method** | `Bank Transfer` | Payment choice |
| P | **Order Status** | `pending` | Initial status |

---

## 6. Troubleshooting

- **Error: "GOOGLE_SHEET_WEBHOOK_URL is not set"**:
  Make sure you pasted the full URL into `Korean-Ecommerce-Backend/.env` and that your backend server was restarted (`nodemon` restarts automatically on `.env` changes).

- **Nothing appears in the Sheet when testing**:
  In Google Apps Script, click **Deploy** > **Manage deployments** and ensure:
  - **Who has access** is set to **"Anyone"** (NOT "Only myself").
  - If you edit the script code in the future, you must click **Deploy** > **New deployment** (or update the version under Manage deployments) for changes to take effect.

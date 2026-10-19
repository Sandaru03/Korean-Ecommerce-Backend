const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

function getBrowserExecutablePath() {
    const possiblePaths = [
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Google Sheets Order Sync Guide - Samee & Sandu</title>
    <style>
        @page {
            size: A4;
            margin: 12mm 14mm 12mm 14mm;
            @bottom-right {
                content: counter(page);
                font-size: 8.5pt;
                color: #888;
            }
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            line-height: 1.45;
            font-size: 9.5pt;
            background: #fff;
            margin: 0;
            padding: 0;
        }
        .header-bar {
            border-bottom: 2px solid #ef4444;
            padding-bottom: 8px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .brand-title {
            font-size: 18pt;
            font-weight: 900;
            color: #111827;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .brand-subtitle {
            font-size: 10pt;
            color: #dc2626;
            font-weight: 700;
            margin-top: 2px;
        }
        .doc-meta {
            text-align: right;
            font-size: 8pt;
            color: #6b7280;
        }
        h2 {
            font-size: 12pt;
            font-weight: 800;
            color: #111827;
            margin-top: 14px;
            margin-bottom: 8px;
            border-left: 4px solid #ef4444;
            padding-left: 8px;
            page-break-after: avoid;
        }
        h3 {
            font-size: 10pt;
            font-weight: 700;
            color: #374151;
            margin-top: 10px;
            margin-bottom: 4px;
            page-break-after: avoid;
        }
        p {
            margin: 0 0 6px 0;
        }
        .alert-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            border-radius: 6px;
            padding: 8px 12px;
            margin: 8px 0;
            font-size: 8.8pt;
            color: #991b1b;
            page-break-inside: avoid;
        }
        .alert-box strong {
            color: #7f1d1d;
        }
        .tip-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            border-radius: 6px;
            padding: 8px 12px;
            margin: 8px 0;
            font-size: 8.8pt;
            color: #166534;
            page-break-inside: avoid;
        }
        .tip-box strong {
            color: #14532d;
        }
        .step-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 6px;
            page-break-inside: avoid;
        }
        .step-num {
            display: inline-block;
            background: #ef4444;
            color: #fff;
            font-size: 8pt;
            font-weight: 800;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            text-align: center;
            line-height: 18px;
            margin-right: 6px;
        }
        .step-title {
            font-size: 9.5pt;
            font-weight: 800;
            color: #111827;
        }
        pre {
            background: #1e293b;
            color: #f8fafc;
            padding: 10px 12px;
            border-radius: 6px;
            font-family: Consolas, Monaco, "Courier New", monospace;
            font-size: 7.8pt;
            line-height: 1.38;
            overflow-x: hidden;
            white-space: pre-wrap;
            margin: 6px 0;
            page-break-inside: avoid;
        }
        code {
            font-family: Consolas, Monaco, monospace;
            font-size: 8.5pt;
            background: #f3f4f6;
            color: #c026d3;
            padding: 1px 4px;
            border-radius: 3px;
        }
        pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 8.5pt;
            page-break-inside: avoid;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 5px 8px;
            text-align: left;
        }
        th {
            background: #f3f4f6;
            font-weight: 800;
            color: #374151;
        }
        tr:nth-child(even) td {
            background: #f9fafb;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>

    <!-- PAGE 1: SETUP -->
    <div class="header-bar">
        <div>
            <div class="brand-title">Samee & Sandu</div>
            <div class="brand-subtitle">Google Sheets Real-Time Order Sync — Setup & Verification Guide</div>
        </div>
        <div class="doc-meta">
            <div><strong>Version:</strong> 1.0 (Production)</div>
            <div><strong>System:</strong> Node.js Backend & Google Apps Script</div>
        </div>
    </div>

    <p>
        This document provides the complete guide to connecting all incoming customer orders (WhatsApp, Email, Bank Transfer) directly into your Google Sheet in real-time.
    </p>

    <div class="tip-box">
        <strong>✨ Fully Automated & Non-Blocking:</strong> Every order placed on your store is captured instantly in Google Sheets without delaying the customer's checkout process or database storage.
    </div>

    <h2>1. 5-Minute Quick Setup Guide</h2>

    <div class="step-card">
        <div><span class="step-num">1</span> <span class="step-title">Create a New Google Sheet</span></div>
        <p style="margin-top:4px; font-size: 8.8pt; color: #4b5563;">
            Go to <a href="https://sheets.new" style="color: #ef4444; font-weight: bold;">sheets.new</a> in your browser and name the spreadsheet (e.g. <code>Samee & Sandu - Store Orders</code>).
        </p>
    </div>

    <div class="step-card">
        <div><span class="step-num">2</span> <span class="step-title">Open Google Apps Script</span></div>
        <p style="margin-top:4px; font-size: 8.8pt; color: #4b5563;">
            In the top menu bar of your Google Sheet, click <strong>Extensions</strong> &gt; <strong>Apps Script</strong>. Delete any default code in the editor.
        </p>
    </div>

    <div class="step-card">
        <div><span class="step-num">3</span> <span class="step-title">Paste the Webhook Script</span></div>
        <p style="margin-top:4px; font-size: 8.8pt; color: #4b5563;">
            Copy and paste the Google Apps Script code provided in <strong>Section 2</strong> of this document into the editor, then press <code>Ctrl + S</code> to save.
        </p>
    </div>

    <div class="step-card">
        <div><span class="step-num">4</span> <span class="step-title">Deploy as a Web App (Critical Permission Setting)</span></div>
        <p style="margin-top:4px; font-size: 8.8pt; color: #4b5563;">
            At the top right, click <strong>Deploy</strong> &gt; <strong>New deployment</strong>.<br>
            • Click the gear icon (⚙️) next to <em>Select type</em> and pick: <strong>Web app</strong><br>
            • Description: <code>Order Webhook</code><br>
            • Execute as: <strong>Me</strong><br>
            • Who has access: <strong style="color: #b91c1c;">Anyone</strong> <em>(Must be "Anyone" so your website backend can push orders)</em><br>
            Click <strong>Deploy</strong>, authorize access with your Google account, and copy the generated <strong>Web app URL</strong>.
        </p>
    </div>

    <div class="step-card">
        <div><span class="step-num">5</span> <span class="step-title">Add Webhook URL to Backend .env</span></div>
        <p style="margin-top:4px; font-size: 8.8pt; color: #4b5563;">
            Open <code>Korean-Ecommerce-Backend/.env</code> and paste your Web App URL:
        </p>
        <pre><code>GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"</code></pre>
    </div>

    <div class="alert-box">
        <strong>⚠️ Crucial Troubleshooting Note (Error 403 Forbidden):</strong><br>
        If running a test returns <em>Request failed with status code 403</em>, your deployment permission was left on <em>"Only myself"</em>. To fix it in 20 seconds: In Google Apps Script, click <strong>Deploy</strong> &gt; <strong>Manage deployments</strong> &gt; click the <strong>pencil (Edit ✏️)</strong> icon &gt; change <strong>Who has access</strong> to <strong>Anyone</strong> &gt; click Deploy!
    </div>

    <div class="page-break"></div>

    <!-- PAGE 2: CODE & TESTING -->
    <h2>2. Google Apps Script Webhook Code</h2>
    <p>Copy and paste this script into <strong>Extensions &gt; Apps Script</strong>:</p>

<pre><code>function doPost(e) {
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
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
    
    // ─── ACTION: Status Update (Find row by Order ID and update Status column) ───
    if (data.action === "updateStatus") {
      var orderId = data.orderId;
      var newStatus = data.status;
      var lastRow = sheet.getLastRow();
      
      if (lastRow > 1 && orderId) {
        var orderIdValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // Column 2 = Order ID
        for (var i = 0; i < orderIdValues.length; i++) {
          if (String(orderIdValues[i][0]).trim() === String(orderId).trim()) {
            var rowIndex = i + 2;
            sheet.getRange(rowIndex, 16).setValue(newStatus); // Column 16 = Order Status
            return ContentService.createTextOutput(JSON.stringify({ 
              status: "success", 
              action: "updated", 
              orderId: orderId, 
              newStatus: newStatus, 
              row: rowIndex 
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found", orderId: orderId }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ─── ACTION: New Order (Append new row) ───
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
      data.paymentMethod || "Bank Transfer",
      data.status || "Pending"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "created" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}</code></pre>

    <h2>3. How to Test & Verify Immediately</h2>
    
    <h3>Method 1: Instant Terminal Verification Test (Recommended)</h3>
    <p>Open your command line in <code>Korean-Ecommerce-Backend</code> and run:</p>
    <pre><code>node scripts/test-google-sheet.js</code></pre>
    <p style="font-size: 8.8pt; color: #4b5563;">
        The script sends a mock order (<code>TEST-XXXXXX</code>) using the URL in your <code>.env</code> file. When it succeeds, it prints <code>status: 'success'</code> and the new row immediately appears in your Google Sheet!
    </p>

    <h3>Method 2: Live Store Checkout Test</h3>
    <p style="font-size: 8.8pt; color: #4b5563;">
        Place an order on your live website (via WhatsApp, Email, or Bank Transfer). Within 1 to 2 seconds, the customer's details and ordered items will automatically populate in your Google Sheet.
    </p>

    <div class="page-break"></div>

    <!-- PAGE 3: COLUMNS & EXECUTION LOGS -->
    <h2>4. Google Sheet Columns Reference</h2>
    <p>The automated script creates and formats these 16 columns for every order:</p>

    <table>
        <thead>
            <tr>
                <th style="width: 7%;">Col</th>
                <th style="width: 23%;">Header Name</th>
                <th style="width: 35%;">Example Data</th>
                <th style="width: 35%;">Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>A</strong></td>
                <td>Date & Time</td>
                <td><code>Oct 19, 2026, 11:35 AM</code></td>
                <td>Sri Lanka local timestamp</td>
            </tr>
            <tr>
                <td><strong>B</strong></td>
                <td>Order ID</td>
                <td><code>ORD-1729318590</code></td>
                <td>Unique website tracking ID</td>
            </tr>
            <tr>
                <td><strong>C</strong></td>
                <td>Customer Name</td>
                <td>Kasun Perera</td>
                <td>Full customer name</td>
            </tr>
            <tr>
                <td><strong>D</strong></td>
                <td>Phone Number</td>
                <td>0771234567</td>
                <td>Primary contact phone</td>
            </tr>
            <tr>
                <td><strong>E</strong></td>
                <td>Secondary Phone</td>
                <td>0719876543 / N/A</td>
                <td>Optional backup phone</td>
            </tr>
            <tr>
                <td><strong>F</strong></td>
                <td>Email</td>
                <td>kasun@example.com</td>
                <td>Customer email address</td>
            </tr>
            <tr>
                <td><strong>G</strong></td>
                <td>Country</td>
                <td>Sri Lanka / Australia</td>
                <td>Delivery destination</td>
            </tr>
            <tr>
                <td><strong>H</strong></td>
                <td>City</td>
                <td>Colombo</td>
                <td>City or town</td>
            </tr>
            <tr>
                <td><strong>I</strong></td>
                <td>Postal Code</td>
                <td>00500 / N/A</td>
                <td>Postal / ZIP code (for international)</td>
            </tr>
            <tr>
                <td><strong>J</strong></td>
                <td>Full Address</td>
                <td>No 45, Galle Road, Apt 3B</td>
                <td>Street, apartment, and house details</td>
            </tr>
            <tr>
                <td><strong>K</strong></td>
                <td>Items Ordered</td>
                <td>Medicube Ampoule x1, Anua Toner x2</td>
                <td>Clean summary of items and counts</td>
            </tr>
            <tr>
                <td><strong>L</strong></td>
                <td>Subtotal (LKR)</td>
                <td>15,000</td>
                <td>Product total before delivery</td>
            </tr>
            <tr>
                <td><strong>M</strong></td>
                <td>Delivery Fee (LKR)</td>
                <td>400 (or 0 for Free)</td>
                <td>Calculated delivery cost</td>
            </tr>
            <tr>
                <td><strong>N</strong></td>
                <td>Grand Total (LKR)</td>
                <td>15,400</td>
                <td>Final payable amount</td>
            </tr>
            <tr>
                <td><strong>O</strong></td>
                <td>Payment Method</td>
                <td>Bank Transfer / Online</td>
                <td>Customer selected payment</td>
            </tr>
            <tr>
                <td><strong>P</strong></td>
                <td>Order Status</td>
                <td>pending</td>
                <td>Initial order fulfillment status</td>
            </tr>
        </tbody>
    </table>

    <h2>5. How to View Logs & Execution History</h2>
    <p>
        Google Apps Script records every incoming order attempt in its execution dashboard:
    </p>
    <ul>
        <li>In your Google Sheet, click <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
        <li>On the left sidebar, click <strong>Executions ⏱️</strong> (clock with an arrow).</li>
        <li>You will see a list of every POST request received, its arrival timestamp, and execution status (<strong>Completed</strong> or <strong>Failed</strong>).</li>
    </ul>

    <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        Samee & Sandu E-Commerce Platform • Engineering Documentation • All Rights Reserved
    </div>

</body>
</html>
`;

async function generatePdf() {
    const browserPath = getBrowserExecutablePath();
    if (!browserPath) {
        console.error("❌ Could not find Chrome or Edge executable on this system.");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        executablePath: browserPath,
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
        ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const outputPath = path.join(__dirname, "../GOOGLE_SHEETS_SETUP_GUIDE.pdf");
    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: {
            top: "10mm",
            bottom: "10mm",
            left: "12mm",
            right: "12mm",
        },
    });

    await browser.close();
    console.log("✅ PDF regenerated successfully at:", outputPath);
}

generatePdf().catch(err => {
    console.error("❌ PDF generation failed:", err);
    process.exit(1);
});

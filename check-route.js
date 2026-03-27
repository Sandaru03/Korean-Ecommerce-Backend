const axios = require("axios");

async function check() {
    try {
        console.log("Checking /config/send-order-email...");
        const res = await axios.post("http://localhost:5000/config/send-order-email", { summary: "test" });
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (err) {
        console.log("Error Status:", err.response?.status);
        console.log("Error Data:", err.response?.data);
    }
}

check();

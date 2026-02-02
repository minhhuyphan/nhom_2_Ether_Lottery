#!/usr/bin/env node

const http = require("http");

// Get admin token from user or environment
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "your_admin_token_here";

function makeRequest(endpoint, method = "GET") {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: endpoint,
      method: method,
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log("🧪 Testing Finance API Endpoints\n");

  try {
    console.log("📊 Testing GET /api/lottery/admin/finance-stats...");
    const statsResult = await makeRequest("/api/lottery/admin/finance-stats");
    console.log(`Status: ${statsResult.status}`);
    console.log("Response:", JSON.stringify(statsResult.data, null, 2));
    console.log("");

    console.log("📋 Testing GET /api/lottery/admin/transactions...");
    const txResult = await makeRequest("/api/lottery/admin/transactions");
    console.log(`Status: ${txResult.status}`);
    console.log("Response:", JSON.stringify(txResult.data, null, 2));
    console.log("");

    console.log("✅ API endpoints test completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testEndpoints();

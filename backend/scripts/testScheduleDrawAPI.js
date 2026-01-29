async function testScheduleDrawAPI() {
  const adminToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTZmNDM2YWZjNWY2OTAwMmY0MzQ1YWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzE1OTQyOTAsImV4cCI6MTczMjE5OTQ5MH0.6Z7_MaB9lN7ZZ_C9kA3n6y2X1Q5vR8uW4eD2fG3hI8k";

  const payload = {
    scheduledTime: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    winningNumbers: ["1", "2", "3", "4", "5", "6"],
  };

  try {
    console.log("🎯 Testing POST /api/lottery/schedule-draw");
    console.log("Token:", adminToken.substring(0, 50) + "...");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Try with http-server proxy or direct to localhost:5000
    const response = await fetch(
      "http://127.0.0.1:5000/api/lottery/schedule-draw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    console.log(`\n📊 Response Status: ${response.status}`);
    const data = await response.json();
    console.log("📄 Response Body:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ SUCCESS: Schedule draw API worked!");
    } else {
      console.log("\n❌ FAILED: " + data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

testScheduleDrawAPI();

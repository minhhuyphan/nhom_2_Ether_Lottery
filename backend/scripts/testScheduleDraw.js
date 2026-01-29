async function testScheduleDraw() {
  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTZmNDM2YWZjNWY2OTAwMmY0MzQ1YWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzE1OTQyOTAsImV4cCI6MTczMjE5OTQ5MH0.6Z7_MaB9lN7ZZ_C9kA3n6y2X1Q5vR8uW4eD2fG3hI8k"; // Admin token

  const payload = {
    scheduledTime: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    winningNumbers: ["1", "2", "3", "4", "5", "6"],
  };

  try {
    console.log("🎯 Testing POST /api/lottery/schedule-draw");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      "http://[::1]:5000/api/lottery/schedule-draw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    console.log("\n✅ Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testScheduleDraw();

// Test script specifically for your MongoDB Atlas cluster
// This verifies connection to cluster0.itunucz.mongodb.net
import { connectToDatabase, getCollection } from "../lib/mongodb"

/**
 * Tests connection to your specific MongoDB Atlas cluster
 * Cluster: shivrajambhore01@cluster0.itunucz.mongodb.net
 * Project: 68a8981f7ff34f6f6f923ed8
 */
async function testAtlasConnection() {
  try {
    console.log("[v0] Testing MongoDB Atlas connection...")
    console.log("[v0] Target cluster: cluster0.itunucz.mongodb.net")
    console.log("[v0] Username: shivrajambhore01")
    console.log("[v0] Database: healthspeak")

    // Test basic connection
    const db = await connectToDatabase()
    console.log(`[v0] ✅ Connected to database: ${db.databaseName}`)

    // Test admin access and get cluster info
    const admin = db.admin()
    const serverStatus = await admin.serverStatus()
    console.log(`[v0] 📊 MongoDB version: ${serverStatus.version}`)
    console.log(`[v0] 🖥️  Host: ${serverStatus.host}`)
    console.log(`[v0] ⏰ Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`)

    // Test collections access
    const collections = await db.listCollections().toArray()
    console.log(`[v0] 📁 Available collections: ${collections.map((c) => c.name).join(", ")}`)

    // Test history collection operations
    const historyCollection = await getCollection("history")
    const historyCount = await historyCollection.countDocuments()
    console.log(`[v0] 📋 History collection: ${historyCount} documents`)

    // Test medicines collection operations
    const medicinesCollection = await getCollection("medicines")
    const medicineCount = await medicinesCollection.countDocuments()
    console.log(`[v0] 💊 Medicines collection: ${medicineCount} documents`)

    // Test write operation
    const testDoc = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "Atlas connection test successful",
    }

    const testCollection = await getCollection("connection_test")
    const insertResult = await testCollection.insertOne(testDoc)
    console.log(`[v0] ✍️  Test write successful: ${insertResult.insertedId}`)

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("[v0] 🧹 Test document cleaned up")

    console.log("[v0] 🎉 All Atlas connection tests passed!")
    console.log("[v0] 🚀 Your HealthSpeak backend is ready to use")
  } catch (error) {
    console.error("[v0] ❌ Atlas connection test failed:", error)

    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        console.error("[v0] 🔐 Authentication failed - check username/password")
      } else if (error.message.includes("network")) {
        console.error("[v0] 🌐 Network error - check IP whitelist in Atlas")
      } else if (error.message.includes("timeout")) {
        console.error("[v0] ⏱️  Connection timeout - check network connectivity")
      }
    }

    process.exit(1)
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testAtlasConnection()
    .then(() => {
      console.log("[v0] Connection test completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("[v0] Connection test failed:", error)
      process.exit(1)
    })
}

export { testAtlasConnection }

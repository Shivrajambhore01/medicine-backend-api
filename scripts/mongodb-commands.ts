// MongoDB Atlas management commands and utilities
// This file contains helpful commands for database administration
import { connectToDatabase, getCollection } from "../lib/mongodb"

/**
 * Collection of MongoDB management commands
 * Run these functions to perform database administration tasks
 */

/**
 * Creates all necessary indexes for optimal query performance
 * Run this after setting up your MongoDB Atlas cluster
 */
export async function createAllIndexes() {
  try {
    console.log("[v0] Creating MongoDB indexes for optimal performance...")

    const db = await connectToDatabase()
    const historyCollection = await getCollection("history")

    // 1. Compound index for chronological queries with status filtering
    // Supports: db.history.find({processingStatus: "completed"}).sort({createdAt: -1})
    await historyCollection.createIndex(
      {
        processingStatus: 1,
        createdAt: -1,
      },
      {
        name: "status_date_idx",
        background: true,
      },
    )

    // 2. Text search index for full-text search across prescription content
    // Supports: db.history.find({$text: {$search: "paracetamol fever"}})
    await historyCollection.createIndex(
      {
        originalText: "text",
        simplifiedText: "text",
        "prescription.diagnosis": "text",
        "prescription.items.medicine.name": "text",
        tags: "text",
      },
      {
        name: "fulltext_search_idx",
        background: true,
        weights: {
          "prescription.items.medicine.name": 10, // Medicine names are most important
          "prescription.diagnosis": 8, // Diagnosis is very important
          tags: 6, // Tags are important
          simplifiedText: 4, // Simplified text is moderately important
          originalText: 2, // Original text is least important
        },
      },
    )

    // 3. Sparse index for user-specific queries (future authentication)
    // Supports: db.history.find({userId: "user123"}).sort({createdAt: -1})
    await historyCollection.createIndex(
      {
        userId: 1,
        createdAt: -1,
      },
      {
        name: "user_date_idx",
        sparse: true, // Only index documents that have userId field
        background: true,
      },
    )

    // 4. Index for tag-based filtering
    // Supports: db.history.find({tags: {$in: ["fever", "headache"]}})
    await historyCollection.createIndex(
      {
        tags: 1,
      },
      {
        name: "tags_idx",
        background: true,
      },
    )

    // 5. Index for date range queries
    // Supports: db.history.find({createdAt: {$gte: "2024-01-01", $lte: "2024-12-31"}})
    await historyCollection.createIndex(
      {
        createdAt: 1,
      },
      {
        name: "created_date_idx",
        background: true,
      },
    )

    console.log("[v0] ✅ All MongoDB indexes created successfully!")

    // List all indexes to verify
    const indexes = await historyCollection.listIndexes().toArray()
    console.log("[v0] Current indexes:")
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`)
    })
  } catch (error) {
    console.error("[v0] ❌ Error creating indexes:", error)
    throw error
  }
}

/**
 * Drops all custom indexes (keeps default _id index)
 * Use this to reset indexes during development
 */
export async function dropAllIndexes() {
  try {
    console.log("[v0] Dropping all custom MongoDB indexes...")

    const historyCollection = await getCollection("history")

    // Drop all indexes except _id (which cannot be dropped)
    await historyCollection.dropIndexes()

    console.log("[v0] ✅ All custom indexes dropped successfully!")
  } catch (error) {
    console.error("[v0] ❌ Error dropping indexes:", error)
    throw error
  }
}

/**
 * Analyzes collection statistics and query performance
 * Use this to monitor database performance
 */
export async function analyzeCollectionStats() {
  try {
    console.log("[v0] Analyzing MongoDB collection statistics...")

    const db = await connectToDatabase()
    const historyCollection = await getCollection("history")

    // Get collection statistics
    const stats = await db.command({ collStats: "history" })

    console.log("[v0] Collection Statistics:")
    console.log(`  📊 Document count: ${stats.count}`)
    console.log(`  💾 Storage size: ${formatBytes(stats.size)}`)
    console.log(`  🗂️  Average document size: ${formatBytes(stats.avgObjSize)}`)
    console.log(`  📇 Index count: ${stats.nindexes}`)
    console.log(`  🔍 Total index size: ${formatBytes(stats.totalIndexSize)}`)

    // Get index usage statistics
    const indexStats = await historyCollection.aggregate([{ $indexStats: {} }]).toArray()

    console.log("\n[v0] Index Usage Statistics:")
    indexStats.forEach((index) => {
      console.log(`  📋 ${index.name}:`)
      console.log(`    - Operations: ${index.accesses.ops}`)
      console.log(`    - Since: ${new Date(index.accesses.since).toISOString()}`)
    })
  } catch (error) {
    console.error("[v0] ❌ Error analyzing collection stats:", error)
    throw error
  }
}

/**
 * Performs database cleanup operations
 * Removes old test data and optimizes storage
 */
export async function cleanupDatabase() {
  try {
    console.log("[v0] Starting database cleanup...")

    const historyCollection = await getCollection("history")

    // Remove test prescriptions older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const testDataFilter = {
      $and: [{ tags: { $in: ["test", "sample", "demo"] } }, { createdAt: { $lt: thirtyDaysAgo.toISOString() } }],
    }

    const deleteResult = await historyCollection.deleteMany(testDataFilter)
    console.log(`[v0] 🗑️  Removed ${deleteResult.deletedCount} old test prescriptions`)

    // Remove prescriptions with failed processing status older than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const failedDataFilter = {
      $and: [{ processingStatus: "failed" }, { createdAt: { $lt: sevenDaysAgo.toISOString() } }],
    }

    const failedDeleteResult = await historyCollection.deleteMany(failedDataFilter)
    console.log(`[v0] ❌ Removed ${failedDeleteResult.deletedCount} failed prescriptions`)

    console.log("[v0] ✅ Database cleanup completed!")
  } catch (error) {
    console.error("[v0] ❌ Error during database cleanup:", error)
    throw error
  }
}

/**
 * Exports all prescription data to JSON for backup
 * Use this for data migration or backup purposes
 */
export async function exportAllData() {
  try {
    console.log("[v0] Exporting all prescription data...")

    const historyCollection = await getCollection("history")

    // Get all documents
    const allData = await historyCollection.find({}).toArray()

    // Convert ObjectIds to strings for JSON serialization
    const exportData = allData.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }))

    // Create export filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `healthspeak_export_${timestamp}.json`

    // In a real application, you would write this to a file
    console.log(`[v0] 📤 Export data ready (${exportData.length} prescriptions)`)
    console.log(`[v0] 📁 Suggested filename: ${filename}`)

    return {
      filename,
      data: exportData,
      count: exportData.length,
      exportDate: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[v0] ❌ Error exporting data:", error)
    throw error
  }
}

// Utility function to format bytes (same as in healthcheck)
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Command line interface for running these functions
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case "create-indexes":
      createAllIndexes()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    case "drop-indexes":
      dropAllIndexes()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    case "analyze":
      analyzeCollectionStats()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    case "cleanup":
      cleanupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    case "export":
      exportAllData()
        .then((result) => {
          console.log("[v0] Export completed:", result)
          process.exit(0)
        })
        .catch(() => process.exit(1))
      break

    default:
      console.log("[v0] Available commands:")
      console.log("  npm run tsx scripts/mongodb-commands.ts create-indexes")
      console.log("  npm run tsx scripts/mongodb-commands.ts drop-indexes")
      console.log("  npm run tsx scripts/mongodb-commands.ts analyze")
      console.log("  npm run tsx scripts/mongodb-commands.ts cleanup")
      console.log("  npm run tsx scripts/mongodb-commands.ts export")
      process.exit(1)
  }
}

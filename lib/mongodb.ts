// MongoDB Atlas connection and configuration
// This file handles the database connection to MongoDB Atlas cloud service
import { MongoClient, type Db, type Collection } from "mongodb"

// Global variables to maintain single connection instance across API calls
// This prevents creating multiple connections which can exhaust database limits
let client: MongoClient | null = null
let db: Db | null = null

// MongoDB Atlas connection string from environment variables
// Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || "healthspeak"

// Validate required environment variables on module load
// This ensures we fail fast if configuration is missing
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

/**
 * Establishes connection to MongoDB Atlas
 * Uses singleton pattern to reuse existing connection
 * @returns Promise<Db> - Connected database instance
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    // Return existing connection if already established
    // This prevents creating multiple connections in serverless environment
    if (client && db) {
      console.log("[v0] Reusing existing MongoDB connection")
      return db
    }

    console.log("[v0] Creating new MongoDB connection to Atlas...")

    // Create new MongoDB client with connection options
    // These options optimize for serverless environments like Vercel
    client = new MongoClient(MONGODB_URI!, {
      maxPoolSize: 10, // Limit connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    })

    // Establish connection to MongoDB Atlas
    await client.connect()

    // Get database instance
    db = client.db(DB_NAME)

    console.log("[v0] Successfully connected to MongoDB Atlas")

    // Create indexes for better query performance
    await createIndexes(db)

    return db
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    throw new Error("Failed to connect to MongoDB Atlas")
  }
}

/**
 * Creates database indexes for optimized queries
 * Indexes improve query performance for frequently searched fields
 * @param db - Database instance
 */
async function createIndexes(db: Db) {
  try {
    const historyCollection = db.collection("history")

    // Create compound index for efficient querying and sorting
    // This index supports queries by createdAt (for chronological order)
    await historyCollection.createIndex({ createdAt: -1 })

    // Text index for full-text search across prescription content
    // Enables searching within originalText, simplifiedText, and prescription data
    await historyCollection.createIndex({
      originalText: "text",
      simplifiedText: "text",
      "prescription.diagnosis": "text",
      "prescription.items.medicine.name": "text",
    })

    // Index for filtering by processing status
    // Useful for finding pending, completed, or failed prescriptions
    await historyCollection.createIndex({ processingStatus: 1 })

    // Index for user-specific queries (if implementing user authentication later)
    await historyCollection.createIndex({ userId: 1, createdAt: -1 })

    console.log("[v0] Database indexes created successfully")
  } catch (error) {
    console.error("[v0] Error creating indexes:", error)
    // Don't throw error here as indexes are optimization, not critical
  }
}

/**
 * Gets a specific collection from the database
 * @param collectionName - Name of the collection to retrieve
 * @returns Promise<Collection> - MongoDB collection instance
 */
export async function getCollection(collectionName: string): Promise<Collection> {
  const database = await connectToDatabase()
  return database.collection(collectionName)
}

/**
 * Gracefully closes MongoDB connection
 * Should be called when application shuts down
 */
export async function closeConnection(): Promise<void> {
  try {
    if (client) {
      await client.close()
      client = null
      db = null
      console.log("[v0] MongoDB connection closed")
    }
  } catch (error) {
    console.error("[v0] Error closing MongoDB connection:", error)
  }
}

// Handle process termination to close database connection
// This ensures clean shutdown in production environments
process.on("SIGINT", closeConnection)
process.on("SIGTERM", closeConnection)

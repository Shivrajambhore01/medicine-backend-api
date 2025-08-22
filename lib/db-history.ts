// MongoDB-based history storage for prescription data
// Replaces JSON file storage with scalable cloud database solution
import { ObjectId } from "mongodb"
import { getCollection } from "./mongodb"
import type { HistoryItem } from "@/utils/types"

// Collection name in MongoDB for storing prescription history
const COLLECTION_NAME = "history"

/**
 * Retrieves all prescription history items from MongoDB
 * Sorted by creation date (newest first) for better user experience
 * @param limit - Maximum number of items to return (default: 100)
 * @param skip - Number of items to skip for pagination (default: 0)
 * @returns Promise<HistoryItem[]> - Array of history items
 */
export async function getHistory(limit = 100, skip = 0): Promise<HistoryItem[]> {
  try {
    console.log(`[v0] Fetching history from MongoDB (limit: ${limit}, skip: ${skip})`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Query database with sorting and pagination
    // Sort by createdAt descending to show newest prescriptions first
    const cursor = collection
      .find({}) // Find all documents (no filter)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .limit(limit) // Limit number of results
      .skip(skip) // Skip items for pagination

    // Convert MongoDB documents to HistoryItem objects
    const documents = await cursor.toArray()

    // Transform MongoDB _id to string id for frontend compatibility
    const historyItems: HistoryItem[] = documents.map((doc) => ({
      ...doc,
      id: doc._id.toString(), // Convert ObjectId to string
      _id: undefined, // Remove MongoDB _id field
    }))

    console.log(`[v0] Successfully retrieved ${historyItems.length} history items`)
    return historyItems
  } catch (error) {
    console.error("[v0] Error fetching history from MongoDB:", error)
    return [] // Return empty array on error to prevent app crashes
  }
}

/**
 * Adds new prescription to history in MongoDB
 * Automatically generates ID and timestamps
 * @param item - Prescription data without id, createdAt, updatedAt
 * @returns Promise<HistoryItem> - Created history item with generated fields
 */
export async function addHistory(item: Omit<HistoryItem, "id" | "createdAt" | "updatedAt">): Promise<HistoryItem> {
  try {
    console.log("[v0] Adding new prescription to MongoDB history")

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Create new document with timestamps and metadata
    const newItem = {
      ...item,
      createdAt: new Date().toISOString(), // ISO timestamp for creation
      updatedAt: new Date().toISOString(), // ISO timestamp for last update
      // MongoDB will automatically generate _id field
    }

    // Insert document into MongoDB collection
    const result = await collection.insertOne(newItem)

    // Return the created item with string ID for frontend
    const createdItem: HistoryItem = {
      ...newItem,
      id: result.insertedId.toString(), // Convert ObjectId to string
    }

    console.log(`[v0] Successfully added prescription with ID: ${createdItem.id}`)
    return createdItem
  } catch (error) {
    console.error("[v0] Error adding prescription to MongoDB:", error)
    throw new Error("Failed to save prescription to database")
  }
}

/**
 * Updates existing prescription in MongoDB
 * Only updates provided fields, preserves others
 * @param id - String ID of the prescription to update
 * @param updates - Partial data to update
 * @returns Promise<HistoryItem | null> - Updated item or null if not found
 */
export async function updateHistory(id: string, updates: Partial<HistoryItem>): Promise<HistoryItem | null> {
  try {
    console.log(`[v0] Updating prescription in MongoDB with ID: ${id}`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Prepare update data with new timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(), // Update the modification timestamp
      id: undefined, // Remove id from update data
      _id: undefined, // Remove _id from update data
    }

    // Update document in MongoDB using ObjectId
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) }, // Find by MongoDB ObjectId
      { $set: updateData }, // Set new field values
      { returnDocument: "after" }, // Return updated document
    )

    // Check if document was found and updated
    if (!result.value) {
      console.log(`[v0] Prescription not found with ID: ${id}`)
      return null
    }

    // Transform result for frontend compatibility
    const updatedItem: HistoryItem = {
      ...result.value,
      id: result.value._id.toString(), // Convert ObjectId to string
      _id: undefined, // Remove MongoDB _id field
    }

    console.log(`[v0] Successfully updated prescription with ID: ${id}`)
    return updatedItem
  } catch (error) {
    console.error(`[v0] Error updating prescription in MongoDB:`, error)
    throw new Error("Failed to update prescription in database")
  }
}

/**
 * Deletes prescription from MongoDB
 * Permanently removes the document from database
 * @param id - String ID of the prescription to delete
 * @returns Promise<boolean> - True if deleted, false if not found
 */
export async function deleteHistory(id: string): Promise<boolean> {
  try {
    console.log(`[v0] Deleting prescription from MongoDB with ID: ${id}`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Delete document from MongoDB using ObjectId
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    // Check if document was actually deleted
    const wasDeleted = result.deletedCount > 0

    if (wasDeleted) {
      console.log(`[v0] Successfully deleted prescription with ID: ${id}`)
    } else {
      console.log(`[v0] Prescription not found for deletion with ID: ${id}`)
    }

    return wasDeleted
  } catch (error) {
    console.error(`[v0] Error deleting prescription from MongoDB:`, error)
    throw new Error("Failed to delete prescription from database")
  }
}

/**
 * Retrieves single prescription by ID from MongoDB
 * @param id - String ID of the prescription to find
 * @returns Promise<HistoryItem | null> - Found item or null if not exists
 */
export async function getHistoryById(id: string): Promise<HistoryItem | null> {
  try {
    console.log(`[v0] Fetching prescription from MongoDB with ID: ${id}`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Find single document by ObjectId
    const document = await collection.findOne({ _id: new ObjectId(id) })

    // Return null if document not found
    if (!document) {
      console.log(`[v0] Prescription not found with ID: ${id}`)
      return null
    }

    // Transform document for frontend compatibility
    const historyItem: HistoryItem = {
      ...document,
      id: document._id.toString(), // Convert ObjectId to string
      _id: undefined, // Remove MongoDB _id field
    }

    console.log(`[v0] Successfully retrieved prescription with ID: ${id}`)
    return historyItem
  } catch (error) {
    console.error(`[v0] Error fetching prescription by ID from MongoDB:`, error)
    return null
  }
}

/**
 * Searches prescriptions using MongoDB text search
 * Searches across multiple fields for comprehensive results
 * @param query - Search query string
 * @param limit - Maximum results to return (default: 50)
 * @returns Promise<HistoryItem[]> - Array of matching prescriptions
 */
export async function searchHistory(query: string, limit = 50): Promise<HistoryItem[]> {
  try {
    console.log(`[v0] Searching prescriptions in MongoDB with query: "${query}"`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Create search filter using MongoDB text search and regex
    const searchFilter = {
      $or: [
        // MongoDB full-text search (requires text index)
        { $text: { $search: query } },

        // Regex search for partial matches (case-insensitive)
        { originalText: { $regex: query, $options: "i" } },
        { simplifiedText: { $regex: query, $options: "i" } },
        { "prescription.diagnosis": { $regex: query, $options: "i" } },
        { "prescription.items.medicine.name": { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    }

    // Execute search query with sorting and limit
    const cursor = collection
      .find(searchFilter) // Apply search filter
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit) // Limit results

    // Convert results to HistoryItem array
    const documents = await cursor.toArray()

    const searchResults: HistoryItem[] = documents.map((doc) => ({
      ...doc,
      id: doc._id.toString(), // Convert ObjectId to string
      _id: undefined, // Remove MongoDB _id field
    }))

    console.log(`[v0] Found ${searchResults.length} prescriptions matching query: "${query}"`)
    return searchResults
  } catch (error) {
    console.error("[v0] Error searching prescriptions in MongoDB:", error)
    return [] // Return empty array on error
  }
}

/**
 * Generates statistics about prescription history
 * Provides insights for dashboard and analytics
 * @returns Promise<object> - Statistics object with counts and metrics
 */
export async function getHistoryStats() {
  try {
    console.log("[v0] Generating prescription statistics from MongoDB")

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Calculate date ranges for time-based statistics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Use MongoDB aggregation pipeline for efficient statistics
    const stats = await collection
      .aggregate([
        {
          // Group all documents and calculate various counts
          $group: {
            _id: null,
            total: { $sum: 1 }, // Total count
            thisWeek: {
              $sum: {
                $cond: [{ $gte: [{ $dateFromString: { dateString: "$createdAt" } }, oneWeekAgo] }, 1, 0],
              },
            },
            thisMonth: {
              $sum: {
                $cond: [{ $gte: [{ $dateFromString: { dateString: "$createdAt" } }, oneMonthAgo] }, 1, 0],
              },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$processingStatus", "completed"] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$processingStatus", "failed"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$processingStatus", "pending"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray()

    // Return statistics or default values if no data
    const result = stats[0] || {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    }

    console.log("[v0] Successfully generated prescription statistics:", result)
    return result
  } catch (error) {
    console.error("[v0] Error generating statistics from MongoDB:", error)
    // Return default statistics on error
    return {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    }
  }
}

/**
 * Creates backup of all prescription data
 * Exports data for backup or migration purposes
 * @returns Promise<HistoryItem[]> - All prescription data
 */
export async function backupHistory(): Promise<HistoryItem[]> {
  try {
    console.log("[v0] Creating backup of all prescription data from MongoDB")

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Fetch all documents without pagination
    const documents = await collection.find({}).toArray()

    // Transform all documents for export
    const backupData: HistoryItem[] = documents.map((doc) => ({
      ...doc,
      id: doc._id.toString(), // Convert ObjectId to string
      _id: undefined, // Remove MongoDB _id field
    }))

    console.log(`[v0] Successfully created backup of ${backupData.length} prescriptions`)
    return backupData
  } catch (error) {
    console.error("[v0] Error creating backup from MongoDB:", error)
    throw new Error("Failed to create backup of prescription data")
  }
}

/**
 * Restores prescription data from backup
 * Imports data for restoration or migration purposes
 * @param backupData - Array of prescription data to restore
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function restoreHistory(backupData: HistoryItem[]): Promise<boolean> {
  try {
    console.log(`[v0] Restoring ${backupData.length} prescriptions to MongoDB`)

    // Get MongoDB collection for history data
    const collection = await getCollection(COLLECTION_NAME)

    // Prepare data for insertion (remove id field, MongoDB will generate _id)
    const documentsToInsert = backupData.map((item) => {
      const { id, ...document } = item // Remove string id field
      return document
    })

    // Insert all documents in batch operation
    const result = await collection.insertMany(documentsToInsert)

    const success = result.insertedCount === backupData.length

    if (success) {
      console.log(`[v0] Successfully restored ${result.insertedCount} prescriptions`)
    } else {
      console.log(`[v0] Partial restore: ${result.insertedCount}/${backupData.length} prescriptions`)
    }

    return success
  } catch (error) {
    console.error("[v0] Error restoring backup to MongoDB:", error)
    return false
  }
}

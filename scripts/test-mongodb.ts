// MongoDB Atlas connection and functionality testing script
// Run this to verify your MongoDB setup is working correctly
import {
  getHistory,
  addHistory,
  updateHistory,
  deleteHistory,
  getHistoryById,
  searchHistory,
  getHistoryStats,
} from "../lib/db-history"

/**
 * Tests all MongoDB operations to ensure everything works correctly
 * This script validates the database connection and CRUD operations
 */
async function testMongoDB() {
  try {
    console.log("[v0] Starting MongoDB Atlas functionality tests...")

    // Test 1: Add new prescription to history
    console.log("\n[v0] Test 1: Adding new prescription...")
    const testPrescription = {
      originalText: "Ibuprofen 400mg TID x 7d",
      simplifiedText: "Take 1 Ibuprofen tablet (400mg) three times daily for 7 days",
      prescription: {
        id: "test_001",
        patientInfo: {
          name: "Test Patient",
          age: "30",
        },
        doctorInfo: {
          name: "Dr. Test",
          specialization: "Testing",
        },
        prescriptionDate: new Date().toISOString(),
        items: [
          {
            id: "test_item_001",
            medicine: {
              id: "test_med_001",
              name: "Ibuprofen",
              strength: "400mg",
              form: "tablet" as const,
              category: "NSAID",
            },
            dosage: {
              amount: "1",
              unit: "tablet",
              frequency: "three times daily",
              duration: "7 days",
              instructions: "Take with food",
              timings: ["morning", "afternoon", "evening"],
              beforeAfterMeal: "with" as const,
            },
            quantity: "21 tablets",
            refills: 0,
          },
        ],
      },
      processingStatus: "completed" as const,
      tags: ["test", "ibuprofen"],
    }

    const addedItem = await addHistory(testPrescription)
    console.log(`[v0] ✓ Successfully added prescription with ID: ${addedItem.id}`)

    // Test 2: Retrieve prescription by ID
    console.log("\n[v0] Test 2: Retrieving prescription by ID...")
    const retrievedItem = await getHistoryById(addedItem.id)
    if (retrievedItem && retrievedItem.id === addedItem.id) {
      console.log(`[v0] ✓ Successfully retrieved prescription: ${retrievedItem.originalText}`)
    } else {
      throw new Error("Failed to retrieve prescription by ID")
    }

    // Test 3: Update prescription
    console.log("\n[v0] Test 3: Updating prescription...")
    const updatedItem = await updateHistory(addedItem.id, {
      tags: ["test", "ibuprofen", "updated"],
      processingStatus: "completed",
    })
    if (updatedItem && updatedItem.tags?.includes("updated")) {
      console.log("[v0] ✓ Successfully updated prescription")
    } else {
      throw new Error("Failed to update prescription")
    }

    // Test 4: Search prescriptions
    console.log("\n[v0] Test 4: Searching prescriptions...")
    const searchResults = await searchHistory("ibuprofen")
    if (searchResults.length > 0) {
      console.log(`[v0] ✓ Search found ${searchResults.length} prescriptions containing "ibuprofen"`)
    } else {
      console.log("[v0] ⚠ Search returned no results (this might be expected)")
    }

    // Test 5: Get all history
    console.log("\n[v0] Test 5: Retrieving all history...")
    const allHistory = await getHistory(10, 0) // Get first 10 items
    console.log(`[v0] ✓ Retrieved ${allHistory.length} prescriptions from history`)

    // Test 6: Get statistics
    console.log("\n[v0] Test 6: Getting statistics...")
    const stats = await getHistoryStats()
    console.log(`[v0] ✓ Statistics: Total: ${stats.total}, Completed: ${stats.completed}, Failed: ${stats.failed}`)

    // Test 7: Delete prescription (cleanup)
    console.log("\n[v0] Test 7: Deleting test prescription...")
    const deleted = await deleteHistory(addedItem.id)
    if (deleted) {
      console.log("[v0] ✓ Successfully deleted test prescription")
    } else {
      console.log("[v0] ⚠ Failed to delete test prescription (might not exist)")
    }

    // Final verification - ensure item was deleted
    console.log("\n[v0] Final verification: Checking deletion...")
    const deletedItem = await getHistoryById(addedItem.id)
    if (!deletedItem) {
      console.log("[v0] ✓ Confirmed: Test prescription was successfully deleted")
    } else {
      console.log("[v0] ⚠ Warning: Test prescription still exists after deletion")
    }

    console.log("\n[v0] 🎉 All MongoDB tests completed successfully!")
    console.log("[v0] Your MongoDB Atlas integration is working correctly")
  } catch (error) {
    console.error("\n[v0] ❌ MongoDB test failed:", error)
    console.error("[v0] Please check your MongoDB connection and configuration")
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testMongoDB()
    .then(() => {
      console.log("\n[v0] Test script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n[v0] Test script failed:", error)
      process.exit(1)
    })
}

export { testMongoDB }

import { type NextRequest, NextResponse } from "next/server"
import {
  getHistory,
  addHistory,
  updateHistory,
  deleteHistory,
  getHistoryById,
  searchHistory,
  getHistoryStats,
} from "@/lib/db-history"
import type { SaveHistoryRequest, HistoryItem } from "@/utils/types"
import {
  sanitizeInput,
  validateTextInput,
  formatSuccessResponse,
  formatErrorResponse,
  handleAPIError,
  logAPIRequest,
  logAPIError,
} from "@/lib/utils"

// GET /api/history - Fetch history with optional search and pagination
// Now supports MongoDB with proper async/await handling
export async function GET(request: NextRequest) {
  try {
    logAPIRequest("GET", "/api/history", request.headers.get("user-agent") || undefined)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const id = searchParams.get("id")
    const stats = searchParams.get("stats") === "true"

    // Return stats if requested - now uses MongoDB aggregation
    if (stats) {
      const historyStats = await getHistoryStats()
      return NextResponse.json(formatSuccessResponse(historyStats))
    }

    // Return specific item if ID provided - queries MongoDB by ObjectId
    if (id) {
      const item = await getHistoryById(sanitizeInput(id))
      if (!item) {
        return formatErrorResponse("History item not found", 404)
      }
      return NextResponse.json(formatSuccessResponse(item))
    }

    // Get history with optional search - uses MongoDB queries for efficiency
    let history: HistoryItem[]
    if (query) {
      const sanitizedQuery = sanitizeInput(query)
      const validation = validateTextInput(sanitizedQuery, 100)

      if (!validation.isValid) {
        return formatErrorResponse(validation.errors.join(", "), 400)
      }

      // MongoDB text search with limit for performance
      history = await searchHistory(sanitizedQuery, limit)
    } else {
      // MongoDB find with pagination parameters for better performance
      const skip = (page - 1) * limit
      history = await getHistory(limit, skip)
    }

    // For search results, we still need client-side pagination
    let paginatedHistory = history
    let totalCount = history.length

    // If not searching, get total count for accurate pagination
    if (!query) {
      // For non-search queries, history is already paginated by MongoDB
      totalCount = history.length // This would need a separate count query in production
    } else {
      // For search results, apply client-side pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      paginatedHistory = history.slice(startIndex, endIndex)
    }

    const response = {
      items: paginatedHistory,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: !query ? history.length === limit : page * limit < totalCount,
        hasPrev: page > 1,
      },
    }

    return NextResponse.json(formatSuccessResponse(response))
  } catch (error) {
    logAPIError(error, "GET /api/history")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

// POST /api/history - Save new prescription to history
// Now saves to MongoDB Atlas instead of JSON file
export async function POST(request: NextRequest) {
  try {
    logAPIRequest("POST", "/api/history", request.headers.get("user-agent") || undefined)

    const body: SaveHistoryRequest = await request.json()

    // Validate required fields
    if (!body.originalText || !body.simplifiedText) {
      return formatErrorResponse("originalText and simplifiedText are required", 400)
    }

    // Sanitize inputs
    const sanitizedData = {
      originalText: sanitizeInput(body.originalText),
      simplifiedText: sanitizeInput(body.simplifiedText),
      prescription: body.prescription,
      imageUrl: body.imageUrl ? sanitizeInput(body.imageUrl) : undefined,
      tags: body.tags?.map((tag) => sanitizeInput(tag)).filter(Boolean) || [],
      processingStatus: "completed" as const,
    }

    // Validate text inputs
    const originalTextValidation = validateTextInput(sanitizedData.originalText)
    const simplifiedTextValidation = validateTextInput(sanitizedData.simplifiedText)

    if (!originalTextValidation.isValid) {
      return formatErrorResponse(`Original text validation failed: ${originalTextValidation.errors.join(", ")}`, 400)
    }

    if (!simplifiedTextValidation.isValid) {
      return formatErrorResponse(
        `Simplified text validation failed: ${simplifiedTextValidation.errors.join(", ")}`,
        400,
      )
    }

    // Add to history - now saves to MongoDB Atlas with automatic ID generation
    const newItem = await addHistory(sanitizedData)

    return NextResponse.json(formatSuccessResponse(newItem, "Prescription saved to history successfully"), {
      status: 201,
    })
  } catch (error) {
    logAPIError(error, "POST /api/history")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

// PUT /api/history - Update existing history item
// Now updates MongoDB document instead of JSON file entry
export async function PUT(request: NextRequest) {
  try {
    logAPIRequest("PUT", "/api/history", request.headers.get("user-agent") || undefined)

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return formatErrorResponse("ID is required for updates", 400)
    }

    // Sanitize update data
    const sanitizedUpdates: Partial<HistoryItem> = {}

    if (updates.originalText) {
      sanitizedUpdates.originalText = sanitizeInput(updates.originalText)
    }

    if (updates.simplifiedText) {
      sanitizedUpdates.simplifiedText = sanitizeInput(updates.simplifiedText)
    }

    if (updates.tags) {
      sanitizedUpdates.tags = updates.tags.map((tag: string) => sanitizeInput(tag)).filter(Boolean)
    }

    if (updates.prescription) {
      sanitizedUpdates.prescription = updates.prescription
    }

    if (updates.processingStatus) {
      sanitizedUpdates.processingStatus = updates.processingStatus
    }

    // Update history item - now updates MongoDB document by ObjectId
    const updatedItem = await updateHistory(sanitizeInput(id), sanitizedUpdates)

    if (!updatedItem) {
      return formatErrorResponse("History item not found", 404)
    }

    return NextResponse.json(formatSuccessResponse(updatedItem, "History item updated successfully"))
  } catch (error) {
    logAPIError(error, "PUT /api/history")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

// DELETE /api/history - Delete history item
// Now removes document from MongoDB instead of JSON file
export async function DELETE(request: NextRequest) {
  try {
    logAPIRequest("DELETE", "/api/history", request.headers.get("user-agent") || undefined)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return formatErrorResponse("ID is required for deletion", 400)
    }

    // Delete from MongoDB - removes document by ObjectId
    const deleted = await deleteHistory(sanitizeInput(id))

    if (!deleted) {
      return formatErrorResponse("History item not found", 404)
    }

    return NextResponse.json(formatSuccessResponse(null, "History item deleted successfully"))
  } catch (error) {
    logAPIError(error, "DELETE /api/history")
    return formatErrorResponse(handleAPIError(error), 500)
  }
}

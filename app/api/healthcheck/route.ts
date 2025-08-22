import { type NextRequest, NextResponse } from "next/server"
import { formatSuccessResponse, logAPIRequest } from "@/lib/utils"
import { getHistoryStats } from "@/lib/db-history"
import { connectToDatabase } from "@/lib/mongodb"
import fs from "fs"
import path from "path"

interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database: {
      status: "up" | "down"
      responseTime?: number
      type: "mongodb" | "json"
      connection?: string
    }
    fileSystem: {
      status: "up" | "down"
      freeSpace?: string
    }
    memory: {
      used: string
      free: string
      total: string
    }
  }
  stats?: {
    totalPrescriptions: number
    recentActivity: number
  }
}

export async function GET(request: NextRequest) {
  try {
    logAPIRequest("GET", "/api/healthcheck", request.headers.get("user-agent") || undefined)

    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get("detailed") === "true"

    // Basic health check data
    const healthData: HealthCheckResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: "up",
          type: "mongodb",
          connection: process.env.MONGODB_URI ? "configured" : "missing",
        },
        fileSystem: { status: "up" },
        memory: {
          used: formatBytes(process.memoryUsage().heapUsed),
          free: formatBytes(process.memoryUsage().heapTotal - process.memoryUsage().heapUsed),
          total: formatBytes(process.memoryUsage().heapTotal),
        },
      },
    }

    // Test MongoDB Atlas connection and get statistics
    try {
      const dbStartTime = Date.now()
      console.log("[v0] Testing MongoDB Atlas connection for health check...")
      await connectToDatabase()
      console.log("[v0] MongoDB Atlas connection successful")
      const stats = await getHistoryStats()
      healthData.services.database.responseTime = Date.now() - dbStartTime

      if (detailed) {
        healthData.stats = {
          totalPrescriptions: stats.total,
          recentActivity: stats.thisWeek,
        }
      }
      console.log(`[v0] Database health check completed in ${healthData.services.database.responseTime}ms`)
    } catch (error) {
      console.error("[v0] MongoDB Atlas health check failed:", error)
      healthData.services.database.status = "down"
      healthData.status = "degraded"
      if (error instanceof Error) {
        healthData.services.database.connection = `error: ${error.message}`
      }
    }

    // Test file system access (still needed for temporary files and uploads)
    try {
      const dataDir = path.join(process.cwd(), "data")
      if (fs.existsSync(dataDir)) {
        const stats = fs.statSync(dataDir)
        healthData.services.fileSystem.freeSpace = "Available"
      } else {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log("[v0] Created data directory for temporary files")
      }
    } catch (error) {
      console.error("[v0] File system health check failed:", error)
      healthData.services.fileSystem.status = "down"
      healthData.status = "degraded"
    }

    // Check memory usage - important for MongoDB connections
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

    if (memoryUsagePercent > 85) {
      healthData.status = "degraded"
      console.log(`[v0] High memory usage detected: ${memoryUsagePercent.toFixed(2)}%`)
    }

    // Check if any critical services are down
    const criticalServices = [healthData.services.database, healthData.services.fileSystem]
    const hasDownServices = criticalServices.some((service) => service.status === "down")

    if (hasDownServices) {
      healthData.status = "unhealthy"
    }

    // Add response time
    const responseTime = Date.now() - startTime

    const response = {
      ...healthData,
      responseTime: `${responseTime}ms`,
    }

    // Return appropriate HTTP status based on health
    const httpStatus = healthData.status === "healthy" ? 200 : healthData.status === "degraded" ? 200 : 503

    console.log(`[v0] Health check completed: ${healthData.status} (${responseTime}ms)`)
    return NextResponse.json(formatSuccessResponse(response), { status: httpStatus })
  } catch (error) {
    console.error("[v0] Health check error:", error)

    const errorResponse: HealthCheckResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "unknown",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: "down",
          type: "mongodb",
          connection: "failed",
        },
        fileSystem: { status: "down" },
        memory: {
          used: "unknown",
          free: "unknown",
          total: "unknown",
        },
      },
    }

    return NextResponse.json(
      {
        success: false,
        data: errorResponse,
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}

// Utility function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// HEAD method for simple ping
export async function HEAD(request: NextRequest) {
  try {
    // Quick MongoDB connection test for lightweight health check
    try {
      await connectToDatabase()
      console.log("[v0] Quick MongoDB health check passed")
    } catch (error) {
      console.error("[v0] Quick MongoDB health check failed:", error)
      return new NextResponse(null, {
        status: 503,
        headers: {
          "X-Health-Status": "unhealthy",
          "X-Database-Status": "down",
          "X-Timestamp": new Date().toISOString(),
        },
      })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Health-Status": "healthy",
        "X-Database-Status": "up",
        "X-Database-Type": "mongodb",
        "X-Timestamp": new Date().toISOString(),
      },
    })
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "X-Health-Status": "unhealthy",
        "X-Database-Status": "down",
        "X-Timestamp": new Date().toISOString(),
      },
    })
  }
}

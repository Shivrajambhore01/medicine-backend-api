import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ValidationResult, APIError } from "@/utils/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Input sanitization functions
export function sanitizeInput(str: string): string {
  if (!str || typeof str !== "string") return ""

  // Remove HTML tags and potentially dangerous characters
  return str
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/[<>'"&]/g, "") // Remove potentially dangerous characters
    .trim()
}

export function sanitizeFileName(fileName: string): string {
  if (!fileName) return ""

  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[/\\:*?"<>|]/g, "") // Remove dangerous file characters
    .replace(/\.\./g, "") // Remove path traversal
    .trim()
}

// Validation functions
export function validateFileUpload(file: File, maxSizeMB = 5): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`)
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    errors.push("File type not supported. Please upload JPEG, PNG, GIF, or WebP images.")
  }

  // Check file name
  if (!file.name || file.name.length > 255) {
    errors.push("Invalid file name")
  }

  // Warnings for large files
  if (file.size > 2 * 1024 * 1024) {
    // 2MB
    warnings.push("Large file may take longer to process")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateTextInput(text: string, maxLength = 10000): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!text || typeof text !== "string") {
    errors.push("Text input is required")
    return { isValid: false, errors }
  }

  if (text.length > maxLength) {
    errors.push(`Text exceeds maximum length of ${maxLength} characters`)
  }

  if (text.length < 10) {
    warnings.push("Text seems very short, results may not be accurate")
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /data:text\/html/i]

  if (suspiciousPatterns.some((pattern) => pattern.test(text))) {
    errors.push("Text contains potentially harmful content")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Error handling functions
export function createAPIError(message: string, code?: string, details?: any): APIError {
  return {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  }
}

export function handleAPIError(error: unknown): APIError {
  console.error("[v0] API Error:", error)

  if (error instanceof Error) {
    return createAPIError(error.message, "INTERNAL_ERROR", {
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }

  return createAPIError("An unexpected error occurred", "UNKNOWN_ERROR")
}

// Response formatting functions
export function formatSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function formatErrorResponse(error: string | APIError, statusCode = 400) {
  const errorObj = typeof error === "string" ? createAPIError(error) : error

  return Response.json(errorObj, { status: statusCode })
}

// Text processing utilities
export function extractMedicalTerms(text: string): string[] {
  // Common medical term patterns
  const medicalPatterns = [
    /\b\d+\s*mg\b/gi, // Dosages like "500mg"
    /\b\d+\s*mcg\b/gi, // Micrograms
    /\b\d+\s*ml\b/gi, // Milliliters
    /\btablet[s]?\b/gi, // Tablets
    /\bcapsule[s]?\b/gi, // Capsules
    /\bsyrup\b/gi, // Syrup
    /\binjection\b/gi, // Injection
    /\bdaily\b/gi, // Daily
    /\btwice\s+daily\b/gi, // Twice daily
    /\bthree\s+times\s+daily\b/gi, // Three times daily
    /\bbefore\s+meals?\b/gi, // Before meals
    /\bafter\s+meals?\b/gi, // After meals
    /\bat\s+bedtime\b/gi, // At bedtime
  ]

  const terms: string[] = []
  medicalPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      terms.push(...matches)
    }
  })

  return [...new Set(terms)] // Remove duplicates
}

export function formatDosageInstructions(text: string): string {
  // Convert common abbreviations to readable format
  const replacements = [
    { pattern: /\bbid\b/gi, replacement: "twice daily" },
    { pattern: /\btid\b/gi, replacement: "three times daily" },
    { pattern: /\bqid\b/gi, replacement: "four times daily" },
    { pattern: /\bqd\b/gi, replacement: "once daily" },
    { pattern: /\bq12h\b/gi, replacement: "every 12 hours" },
    { pattern: /\bq8h\b/gi, replacement: "every 8 hours" },
    { pattern: /\bq6h\b/gi, replacement: "every 6 hours" },
    { pattern: /\bq4h\b/gi, replacement: "every 4 hours" },
    { pattern: /\bprn\b/gi, replacement: "as needed" },
    { pattern: /\bac\b/gi, replacement: "before meals" },
    { pattern: /\bpc\b/gi, replacement: "after meals" },
    { pattern: /\bhs\b/gi, replacement: "at bedtime" },
    { pattern: /\bpo\b/gi, replacement: "by mouth" },
  ]

  let formatted = text
  replacements.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement)
  })

  return formatted
}

// Rate limiting utilities (for future implementation)
export function createRateLimitKey(ip: string, endpoint: string): string {
  return `ratelimit:${ip}:${endpoint}`
}

// File utilities
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(originalName)
  const baseName = originalName.replace(/\.[^/.]+$/, "")

  return `${sanitizeFileName(baseName)}_${timestamp}_${random}.${extension}`
}

// Date utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// Environment utilities
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || defaultValue || ""
}

export function getMaxFileSize(): number {
  const maxSizeMB = Number.parseInt(getEnvVar("MAX_FILE_SIZE_MB", "5"))
  return maxSizeMB * 1024 * 1024 // Convert to bytes
}

// Logging utilities
export function logAPIRequest(method: string, url: string, userAgent?: string) {
  console.log(`[v0] ${method} ${url} - ${userAgent || "Unknown"} - ${new Date().toISOString()}`)
}

export function logAPIError(error: unknown, context: string) {
  console.error(`[v0] Error in ${context}:`, error)
}

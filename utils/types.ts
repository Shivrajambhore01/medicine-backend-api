// Core prescription and medicine types
export interface Medicine {
  id: string
  name: string
  genericName?: string
  brandName?: string
  strength: string
  form: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "inhaler" | "other"
  category: string
  description?: string
}

export interface Dosage {
  amount: string
  unit: string
  frequency: string
  duration: string
  instructions: string
  timings: string[]
  beforeAfterMeal: "before" | "after" | "with" | "anytime"
  specialInstructions?: string
}

export interface PrescriptionItem {
  id: string
  medicine: Medicine
  dosage: Dosage
  quantity: string
  refills: number
  warnings?: string[]
  sideEffects?: string[]
}

export interface DoctorInfo {
  name: string
  specialization?: string
  license?: string
  contact?: string
  hospital?: string
}

export interface PatientInfo {
  name?: string
  age?: string
  gender?: string
  weight?: string
  allergies?: string[]
}

export interface Prescription {
  id: string
  patientInfo: PatientInfo
  doctorInfo: DoctorInfo
  prescriptionDate: string
  items: PrescriptionItem[]
  diagnosis?: string
  notes?: string
  followUpDate?: string
  emergencyContact?: string
}

// History and processing types
export interface HistoryItem {
  id: string
  originalText: string
  simplifiedText: string
  prescription?: Prescription
  imageUrl?: string
  processingStatus: "pending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
  tags?: string[]
}

// API Request/Response types
export interface OCRRequest {
  file: File
}

export interface OCRResponse {
  success: boolean
  text?: string
  confidence?: number
  error?: string
}

export interface SimplifyRequest {
  text: string
  language?: string
}

export interface SimplifyResponse {
  success: boolean
  originalText: string
  simplifiedText: string
  prescription?: Prescription
  entities?: MedicalEntity[]
  error?: string
}

export interface MedicalEntity {
  text: string
  label: "DRUG" | "STRENGTH" | "DOSAGE" | "FREQUENCY" | "DURATION" | "ROUTE" | "FORM"
  start: number
  end: number
  confidence: number
}

export interface HistoryResponse {
  success: boolean
  data?: HistoryItem[]
  error?: string
}

export interface SaveHistoryRequest {
  originalText: string
  simplifiedText: string
  prescription?: Prescription
  imageUrl?: string
  tags?: string[]
}

// TTS types
export interface TTSRequest {
  text: string
  voice?: string
  speed?: number
  language?: string
}

export interface TTSResponse {
  success: boolean
  audioUrl?: string
  error?: string
}

// Medical dictionary types
export interface MedicalAbbreviation {
  abbreviation: string
  fullForm: string
  category: string
  description?: string
  commonUsage: string[]
}

export interface DrugInfo {
  name: string
  genericName: string
  brandNames: string[]
  category: string
  commonDosages: string[]
  commonForms: string[]
  commonInstructions: string[]
  warnings: string[]
  sideEffects: string[]
  interactions?: string[]
}

// Error types
export interface APIError {
  error: string
  code?: string
  details?: any
  timestamp: string
}

// Utility types
export type ProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

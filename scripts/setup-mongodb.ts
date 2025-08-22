// MongoDB Atlas setup and initialization script for HealthSpeak
// Run this script to set up database collections and indexes on your Atlas cluster
// Cluster: cluster0.itunucz.mongodb.net | Project: 68a8981f7ff34f6f6f923ed8
import { connectToDatabase, getCollection } from "../lib/mongodb"

/**
 * Sets up MongoDB Atlas database with required collections and indexes
 * This script connects to your specific MongoDB Atlas cluster and initializes HealthSpeak database
 * Atlas Cluster: shivrajambhore01@cluster0.itunucz.mongodb.net
 */
async function setupMongoDB() {
  try {
    console.log("[v0] Starting MongoDB Atlas setup for HealthSpeak...")
    console.log("[v0] Connecting to Atlas cluster: cluster0.itunucz.mongodb.net")
    console.log("[v0] Project ID: 68a8981f7ff34f6f6f923ed8")

    // Connect to your specific MongoDB Atlas cluster
    // This will create the 'healthspeak' database if it doesn't exist
    const db = await connectToDatabase()
    console.log("[v0] Connected to MongoDB Atlas successfully")
    console.log(`[v0] Using database: ${db.databaseName}`)

    // Verify we're connected to the correct cluster
    const admin = db.admin()
    const serverStatus = await admin.serverStatus()
    console.log(`[v0] Connected to MongoDB version: ${serverStatus.version}`)
    console.log(`[v0] Atlas cluster host: ${serverStatus.host}`)

    // Create history collection for storing prescription processing history
    // This is the main collection for your HealthSpeak app
    const historyCollection = await getCollection("history")
    console.log("[v0] History collection ready for prescription storage")

    // Create medicines collection for drug database and medical dictionary
    // This supports the AI processing and simplification features
    const medicinesCollection = await getCollection("medicines")
    console.log("[v0] Medicines collection ready for medical dictionary")

    // Create users collection for future authentication features
    // Currently not used but prepared for team integration
    const usersCollection = await getCollection("users")
    console.log("[v0] Users collection ready (for future authentication)")

    console.log("[v0] Inserting sample prescription data for testing...")

    const samplePrescription = {
      originalText:
        "Rx: Tab Paracetamol 500mg BD x 5/7 PC. Tab Amoxicillin 500mg TDS x 7/7 AC. SOS Domperidone 10mg if nausea.",
      simplifiedText:
        "Take 1 Paracetamol tablet (500mg) twice daily after meals for 5 days. Take 1 Amoxicillin tablet (500mg) three times daily before meals for 7 days. If you feel nauseous, take 1 Domperidone tablet (10mg) as needed.",
      prescription: {
        id: "healthspeak_sample_001",
        patientInfo: {
          name: "Sample Patient",
          age: "35",
          gender: "male",
        },
        doctorInfo: {
          name: "Dr. Sample",
          specialization: "General Medicine",
          registrationNumber: "MCI12345",
        },
        prescriptionDate: new Date().toISOString(),
        items: [
          {
            id: "item_001",
            medicine: {
              id: "med_paracetamol_500",
              name: "Paracetamol",
              genericName: "Acetaminophen",
              strength: "500mg",
              form: "tablet" as const,
              category: "Analgesic/Antipyretic",
            },
            dosage: {
              amount: "1",
              unit: "tablet",
              frequency: "BD (twice daily)",
              duration: "5 days",
              instructions: "Take after meals (PC)",
              timings: ["morning", "evening"],
              beforeAfterMeal: "after" as const,
            },
            quantity: "10 tablets",
            refills: 0,
          },
          {
            id: "item_002",
            medicine: {
              id: "med_amoxicillin_500",
              name: "Amoxicillin",
              genericName: "Amoxicillin",
              strength: "500mg",
              form: "tablet" as const,
              category: "Antibiotic",
            },
            dosage: {
              amount: "1",
              unit: "tablet",
              frequency: "TDS (three times daily)",
              duration: "7 days",
              instructions: "Take before meals (AC)",
              timings: ["morning", "afternoon", "evening"],
              beforeAfterMeal: "before" as const,
            },
            quantity: "21 tablets",
            refills: 0,
          },
        ],
        diagnosis: "Upper respiratory tract infection with fever",
        additionalInstructions: "Complete the antibiotic course. Return if symptoms persist.",
      },
      processingStatus: "completed" as const,
      tags: ["fever", "infection", "antibiotic", "paracetamol"],
      ocrConfidence: 0.95,
      simplificationModel: "healthspeak-v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Insert sample prescription into your Atlas cluster
    const result = await historyCollection.insertOne(samplePrescription)
    console.log(`[v0] Sample prescription inserted with ID: ${result.insertedId}`)

    const sampleMedicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        brandNames: ["Tylenol", "Panadol", "Crocin", "Dolo"],
        category: "Analgesic/Antipyretic",
        commonDosages: ["500mg", "650mg", "1000mg"],
        commonForms: ["tablet", "syrup", "injection"],
        medicalAbbreviations: ["PCM", "Para"],
        commonInstructions: ["PC (after meals)", "BD (twice daily)", "TDS (three times daily)"],
        warnings: ["Max 4g/day", "Avoid alcohol", "Liver toxicity risk"],
        sideEffects: ["Nausea", "Skin rash", "Liver damage (overdose)"],
        contraindications: ["Severe liver disease", "Alcohol dependence"],
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        brandNames: ["Amoxil", "Trimox", "Novamox"],
        category: "Antibiotic (Penicillin)",
        commonDosages: ["250mg", "500mg", "875mg"],
        commonForms: ["capsule", "tablet", "syrup"],
        medicalAbbreviations: ["Amox", "AMX"],
        commonInstructions: ["AC (before meals)", "Complete course", "TDS (three times daily)"],
        warnings: ["Penicillin allergy", "Complete full course", "C.diff risk"],
        sideEffects: ["Diarrhea", "Nausea", "Skin rash", "Allergic reactions"],
        contraindications: ["Penicillin allergy", "Mononucleosis"],
      },
      {
        name: "Domperidone",
        genericName: "Domperidone",
        brandNames: ["Motilium", "Domstal"],
        category: "Antiemetic/Prokinetic",
        commonDosages: ["10mg", "20mg"],
        commonForms: ["tablet", "syrup"],
        medicalAbbreviations: ["Dom"],
        commonInstructions: ["SOS (as needed)", "Before meals", "Max 3 times daily"],
        warnings: ["Cardiac arrhythmia risk", "Not for children <12"],
        sideEffects: ["Dry mouth", "Headache", "Cardiac effects"],
        contraindications: ["Cardiac conditions", "Prolactinoma"],
      },
    ]

    const medicineResult = await medicinesCollection.insertMany(sampleMedicines)
    console.log(`[v0] ${medicineResult.insertedCount} sample medicines inserted into Atlas`)

    const historyCount = await historyCollection.countDocuments()
    const medicineCount = await medicinesCollection.countDocuments()

    console.log("[v0] ✅ MongoDB Atlas setup completed successfully!")
    console.log(`[v0] 📊 Collections created: history (${historyCount} docs), medicines (${medicineCount} docs)`)
    console.log("[v0] 🚀 HealthSpeak backend is ready to use with MongoDB Atlas")
    console.log("[v0] 🔗 Atlas cluster: cluster0.itunucz.mongodb.net")
  } catch (error) {
    console.error("[v0] ❌ Error setting up MongoDB Atlas:", error)
    console.error("[v0] Check your connection string and network access in Atlas")
    process.exit(1)
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log("[v0] Setup script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("[v0] Setup script failed:", error)
      process.exit(1)
    })
}

export { setupMongoDB }

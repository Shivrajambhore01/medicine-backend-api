import type { MedicalAbbreviation, DrugInfo } from "@/utils/types"

// Medical abbreviations dictionary
export const medicalAbbreviations: MedicalAbbreviation[] = [
  {
    abbreviation: "bid",
    fullForm: "twice a day",
    category: "frequency",
    description: "Take medication two times per day",
    commonUsage: ["Take 1 tablet bid", "Apply cream bid"],
  },
  {
    abbreviation: "tid",
    fullForm: "three times a day",
    category: "frequency",
    description: "Take medication three times per day",
    commonUsage: ["Take 1 capsule tid", "Use drops tid"],
  },
  {
    abbreviation: "qid",
    fullForm: "four times a day",
    category: "frequency",
    description: "Take medication four times per day",
    commonUsage: ["Take 1 tablet qid", "Apply ointment qid"],
  },
  {
    abbreviation: "qd",
    fullForm: "once a day",
    category: "frequency",
    description: "Take medication once per day",
    commonUsage: ["Take 1 tablet qd", "Apply patch qd"],
  },
  {
    abbreviation: "q12h",
    fullForm: "every 12 hours",
    category: "frequency",
    description: "Take medication every 12 hours",
    commonUsage: ["Take 1 tablet q12h", "Use inhaler q12h"],
  },
  {
    abbreviation: "q8h",
    fullForm: "every 8 hours",
    category: "frequency",
    description: "Take medication every 8 hours",
    commonUsage: ["Take 1 capsule q8h", "Apply cream q8h"],
  },
  {
    abbreviation: "q6h",
    fullForm: "every 6 hours",
    category: "frequency",
    description: "Take medication every 6 hours",
    commonUsage: ["Take 1 tablet q6h", "Use drops q6h"],
  },
  {
    abbreviation: "q4h",
    fullForm: "every 4 hours",
    category: "frequency",
    description: "Take medication every 4 hours",
    commonUsage: ["Take 1 tablet q4h", "Apply ointment q4h"],
  },
  {
    abbreviation: "prn",
    fullForm: "as needed",
    category: "frequency",
    description: "Take medication only when needed",
    commonUsage: ["Take 1 tablet prn pain", "Use inhaler prn shortness of breath"],
  },
  {
    abbreviation: "ac",
    fullForm: "before meals",
    category: "timing",
    description: "Take medication before eating",
    commonUsage: ["Take 1 tablet ac", "Take 30 minutes ac"],
  },
  {
    abbreviation: "pc",
    fullForm: "after meals",
    category: "timing",
    description: "Take medication after eating",
    commonUsage: ["Take 1 tablet pc", "Take 1 hour pc"],
  },
  {
    abbreviation: "hs",
    fullForm: "at bedtime",
    category: "timing",
    description: "Take medication before going to sleep",
    commonUsage: ["Take 1 tablet hs", "Apply cream hs"],
  },
  {
    abbreviation: "po",
    fullForm: "by mouth",
    category: "route",
    description: "Take medication orally",
    commonUsage: ["Take 1 tablet po", "Take syrup po"],
  },
  {
    abbreviation: "iv",
    fullForm: "intravenous",
    category: "route",
    description: "Given through a vein",
    commonUsage: ["Administer iv", "Give medication iv"],
  },
  {
    abbreviation: "im",
    fullForm: "intramuscular",
    category: "route",
    description: "Given as an injection into muscle",
    commonUsage: ["Give injection im", "Administer vaccine im"],
  },
  {
    abbreviation: "sc",
    fullForm: "subcutaneous",
    category: "route",
    description: "Given as an injection under the skin",
    commonUsage: ["Give insulin sc", "Administer injection sc"],
  },
  {
    abbreviation: "sl",
    fullForm: "under the tongue",
    category: "route",
    description: "Place medication under tongue to dissolve",
    commonUsage: ["Place tablet sl", "Use spray sl"],
  },
  {
    abbreviation: "mg",
    fullForm: "milligrams",
    category: "dosage",
    description: "Unit of measurement for medication strength",
    commonUsage: ["Take 500mg", "Apply 10mg cream"],
  },
  {
    abbreviation: "mcg",
    fullForm: "micrograms",
    category: "dosage",
    description: "Unit of measurement for very small doses",
    commonUsage: ["Take 25mcg", "Use 100mcg inhaler"],
  },
  {
    abbreviation: "ml",
    fullForm: "milliliters",
    category: "dosage",
    description: "Unit of measurement for liquid medications",
    commonUsage: ["Take 5ml syrup", "Use 2ml drops"],
  },
  {
    abbreviation: "caps",
    fullForm: "capsules",
    category: "form",
    description: "Medication in capsule form",
    commonUsage: ["Take 2 caps", "Swallow caps whole"],
  },
  {
    abbreviation: "tabs",
    fullForm: "tablets",
    category: "form",
    description: "Medication in tablet form",
    commonUsage: ["Take 1 tabs", "Crush tabs if needed"],
  },
]

// Common drug information database
export const drugDatabase: DrugInfo[] = [
  {
    name: "paracetamol",
    genericName: "acetaminophen",
    brandNames: ["Tylenol", "Panadol", "Crocin", "Dolo"],
    category: "analgesic",
    commonDosages: ["500mg", "650mg", "1000mg"],
    commonForms: ["tablet", "syrup", "injection"],
    commonInstructions: ["Take with or without food", "Do not exceed 4000mg per day", "Take every 4-6 hours as needed"],
    warnings: [
      "Do not exceed recommended dose",
      "Avoid alcohol while taking this medication",
      "Consult doctor if symptoms persist",
    ],
    sideEffects: ["Nausea", "Stomach upset", "Allergic reactions (rare)"],
    interactions: ["Warfarin", "Alcohol"],
  },
  {
    name: "ibuprofen",
    genericName: "ibuprofen",
    brandNames: ["Advil", "Motrin", "Brufen", "Combiflam"],
    category: "NSAID",
    commonDosages: ["200mg", "400mg", "600mg"],
    commonForms: ["tablet", "capsule", "syrup"],
    commonInstructions: [
      "Take with food to reduce stomach upset",
      "Take every 6-8 hours as needed",
      "Do not exceed 1200mg per day without doctor supervision",
    ],
    warnings: ["May cause stomach bleeding", "Avoid if allergic to aspirin", "Use with caution in heart disease"],
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness", "Headache"],
    interactions: ["Warfarin", "ACE inhibitors", "Diuretics"],
  },
  {
    name: "amoxicillin",
    genericName: "amoxicillin",
    brandNames: ["Amoxil", "Augmentin", "Moxikind"],
    category: "antibiotic",
    commonDosages: ["250mg", "500mg", "875mg"],
    commonForms: ["capsule", "tablet", "syrup"],
    commonInstructions: [
      "Take with or without food",
      "Complete the full course even if feeling better",
      "Take at evenly spaced intervals",
    ],
    warnings: [
      "Complete full course of treatment",
      "Inform doctor of any allergies",
      "May reduce effectiveness of birth control",
    ],
    sideEffects: ["Diarrhea", "Nausea", "Vomiting", "Skin rash"],
    interactions: ["Methotrexate", "Oral contraceptives"],
  },
  {
    name: "metformin",
    genericName: "metformin",
    brandNames: ["Glucophage", "Glycomet", "Obimet"],
    category: "antidiabetic",
    commonDosages: ["500mg", "850mg", "1000mg"],
    commonForms: ["tablet", "extended-release tablet"],
    commonInstructions: [
      "Take with meals to reduce stomach upset",
      "Start with low dose and gradually increase",
      "Monitor blood sugar regularly",
    ],
    warnings: [
      "May cause lactic acidosis (rare but serious)",
      "Inform doctor before any surgery or medical procedures",
      "Regular kidney function monitoring required",
    ],
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste", "Stomach upset"],
    interactions: ["Alcohol", "Contrast dyes", "Diuretics"],
  },
  {
    name: "atorvastatin",
    genericName: "atorvastatin",
    brandNames: ["Lipitor", "Atorlip", "Storvas"],
    category: "statin",
    commonDosages: ["10mg", "20mg", "40mg", "80mg"],
    commonForms: ["tablet"],
    commonInstructions: [
      "Take once daily, preferably in the evening",
      "Can be taken with or without food",
      "Regular cholesterol monitoring required",
    ],
    warnings: ["May cause muscle pain or weakness", "Avoid grapefruit juice", "Regular liver function tests needed"],
    sideEffects: ["Muscle pain", "Headache", "Nausea", "Constipation"],
    interactions: ["Grapefruit juice", "Cyclosporine", "Gemfibrozil"],
  },
]

// Helper functions for dictionary lookups
export function findAbbreviation(abbr: string): MedicalAbbreviation | null {
  return medicalAbbreviations.find((item) => item.abbreviation.toLowerCase() === abbr.toLowerCase()) || null
}

export function findDrug(drugName: string): DrugInfo | null {
  const name = drugName.toLowerCase()
  return (
    drugDatabase.find(
      (drug) =>
        drug.name.toLowerCase() === name ||
        drug.genericName.toLowerCase() === name ||
        drug.brandNames.some((brand) => brand.toLowerCase() === name),
    ) || null
  )
}

export function searchDrugs(query: string): DrugInfo[] {
  const searchTerm = query.toLowerCase()
  return drugDatabase.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm) ||
      drug.genericName.toLowerCase().includes(searchTerm) ||
      drug.brandNames.some((brand) => brand.toLowerCase().includes(searchTerm)) ||
      drug.category.toLowerCase().includes(searchTerm),
  )
}

export function expandAbbreviations(text: string): string {
  let expandedText = text

  medicalAbbreviations.forEach((abbr) => {
    const regex = new RegExp(`\\b${abbr.abbreviation}\\b`, "gi")
    expandedText = expandedText.replace(regex, abbr.fullForm)
  })

  return expandedText
}

export function getDrugsByCategory(category: string): DrugInfo[] {
  return drugDatabase.filter((drug) => drug.category.toLowerCase() === category.toLowerCase())
}

export function getAllCategories(): string[] {
  const categories = new Set(drugDatabase.map((drug) => drug.category))
  return Array.from(categories).sort()
}

// Function to add new abbreviations (for future expansion)
export function addAbbreviation(abbr: MedicalAbbreviation): void {
  medicalAbbreviations.push(abbr)
}

// Function to add new drugs (for future expansion)
export function addDrug(drug: DrugInfo): void {
  drugDatabase.push(drug)
}

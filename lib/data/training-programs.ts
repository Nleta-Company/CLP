
export type TrainingCategory =
  | "WCT"
  | "SCT"
  | "OET"
  | "LET"
  | "FMT"
  | "CSR"
  | "PDT"
  | "ADT"
  | "TTM"

export interface TrainingProgram {
  code: string
  title: string
  category: TrainingCategory
  audience: string
  mode: "ON" | "HY" | "OF"
  duration: string
}

export const trainingCategories = [
  { code: "WCT", title: "Workplace Competency Training" },
  { code: "SCT", title: "Safety Culture Training" },
  { code: "OET", title: "Operational Excellence Training" },
  { code: "LET", title: "Lifting Equipment Technical Training" },
  { code: "FMT", title: "Facility Management Training" },
  { code: "CSR", title: "Community Safety & CSR" },
  { code: "PDT", title: "Professional Development Training" },
  { code: "ADT", title: "AI & Digital Transformation" },
  { code: "TTM", title: "Technical Talent Matrix" },
] as const

export const trainingPrograms: TrainingProgram[] = [
  // WCT — Workplace Competency Training
  { code: "WCT-01", title: "Workplace Behaviour & Professional Conduct", category: "WCT", audience: "T", mode: "ON", duration: "2 Hr" },
  { code: "WCT-02", title: "Business Communication for Engineers", category: "WCT", audience: "T / TL", mode: "ON", duration: "2 Hr" },
  { code: "WCT-03", title: "Team Collaboration in Project Environment", category: "WCT", audience: "TL", mode: "HY", duration: "3 Hr" },
  { code: "WCT-04", title: "Workplace Ethics & Responsible Use of Tools, Equipment and Resources", category: "WCT", audience: "T/TL/M/A", mode: "HY", duration: "3 Hr" },

  // SCT — Safety Culture Training
  { code: "SCT-01", title: "Electrical Safety Awareness", category: "SCT", audience: "T", mode: "HY", duration: "4 Hr" },
  { code: "SCT-02", title: "Lockout/Tagout (LOTO)", category: "SCT", audience: "T", mode: "OF", duration: "1 Day" },
  { code: "SCT-03", title: "PPE & Uniform Discipline", category: "SCT", audience: "T", mode: "HY", duration: "2 Hr" },
  { code: "SCT-04", title: "Working at Height Safety", category: "SCT", audience: "T", mode: "OF", duration: "1 Day" },
  { code: "SCT-05", title: "First Aid & Basic Life Support", category: "SCT", audience: "T/ALL", mode: "OF", duration: "1 Day" },
  { code: "SCT-06", title: "Fire Safety & Emergency Preparedness", category: "SCT", audience: "ALL", mode: "OF", duration: "1 Day" },
  { code: "SCT-07", title: "Lift & Escalator Safety During War, Armed Conflict & High-Risk Security Emergencies", category: "SCT", audience: "ALL/T/TL/A", mode: "HY", duration: "4 Hr" },

  // OET — Operational Excellence Training
  { code: "OET-01", title: "Shift Handover Management", category: "OET", audience: "TL", mode: "HY", duration: "3 Hr" },
  { code: "OET-02", title: "Job Safety Analysis (JSA)", category: "OET", audience: "TL", mode: "HY", duration: "4 Hr" },
  { code: "OET-03", title: "Permit to Work (PTW)", category: "OET", audience: "TL", mode: "HY", duration: "4 Hr" },
  { code: "OET-04", title: "Risk Assessment & HIRA", category: "OET", audience: "TL", mode: "HY", duration: "4 Hr" },
  { code: "OET-05", title: "Documentation & Record Management", category: "OET", audience: "A", mode: "ON", duration: "2 Hr" },
  { code: "OET-06", title: "NCR & CAPA Management", category: "OET", audience: "M", mode: "ON", duration: "3 Hr" },
  { code: "OET-07", title: "Tool Box Talk (TBT)", category: "OET", audience: "TL", mode: "HY", duration: "2 Hr" },
  { code: "OET-08", title: "Incident Investigation", category: "OET", audience: "M", mode: "HY", duration: "4 Hr" },
  { code: "OET-09", title: "Quality Inspection Process", category: "OET", audience: "M", mode: "HY", duration: "1 Day" },
  { code: "OET-10", title: "KPI, MIS & Dashboard", category: "OET", audience: "M/A", mode: "ON", duration: "3 Hr" },

  // LET — Lifting Equipment Technical Training
  { code: "LET-01", title: "Lift Installation Codes & Engineering Ethics", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-02", title: "Lift Maintenance & Troubleshooting", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-03", title: "Escalator Installation", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-04", title: "Escalator Maintenance", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-05", title: "Construction Hoist Installation", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-06", title: "Construction Hoist Safety", category: "LET", audience: "TL", mode: "HY", duration: "1 Day" },
  { code: "LET-07", title: "EOT Crane Safety", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-08", title: "Goods Lift Inspection", category: "LET", audience: "TL", mode: "HY", duration: "1 Day" },
  { code: "LET-09", title: "Moving Walk Safety", category: "LET", audience: "T", mode: "HY", duration: "1 Day" },
  { code: "LET-10", title: "PAT • SAT • SCI • DGS Inspection Readiness", category: "LET", audience: "M", mode: "HY", duration: "1 Day" },

  // FMT — Facility Management Training
  { code: "FMT-01", title: "RWA & Building Safety Governance", category: "FMT", audience: "A", mode: "HY", duration: "3 Hr" },
  { code: "FMT-02", title: "Security Lift Emergency Response", category: "FMT", audience: "A", mode: "HY", duration: "3 Hr" },
  { code: "FMT-03", title: "Housekeeping & Visitor Safety", category: "FMT", audience: "A", mode: "HY", duration: "3 Hr" },
  { code: "FMT-04", title: "QRT & Mock Drill Management", category: "FMT", audience: "TL", mode: "OF", duration: "4 Hr" },
  { code: "FMT-05", title: "AMC Vendor Coordination", category: "FMT", audience: "M/A", mode: "ON", duration: "3 Hr" },

  // CSR — Community Safety & CSR
  { code: "CSR-01", title: "Community Safety Awareness", category: "CSR", audience: "ALL", mode: "HY", duration: "2–4 Hr" },
  { code: "CSR-02", title: "School & College Lift Safety", category: "CSR", audience: "ALL", mode: "OF", duration: "2 Hr" },
  { code: "CSR-03", title: "Women & Senior Citizen Accessibility", category: "CSR", audience: "ALL", mode: "HY", duration: "2 Hr" },
  { code: "CSR-04", title: "Child Safety & Public Behaviour", category: "CSR", audience: "ALL", mode: "OF", duration: "2 Hr" },
  { code: "CSR-05", title: "CSR Impact & Sustainability Reporting", category: "CSR", audience: "A", mode: "ON", duration: "3 Hr" },

  // PDT — Professional Development Training
  { code: "PDT-01", title: "Personality Development & Professional Grooming", category: "PDT", audience: "ALL", mode: "HY", duration: "3 Hr" },
  { code: "PDT-02", title: "Business Email, WhatsApp & Content Writing", category: "PDT", audience: "ALL", mode: "ON", duration: "3 Hr" },
  { code: "PDT-03", title: "Client Communication & Customer Handling", category: "PDT", audience: "ALL", mode: "HY", duration: "3 Hr" },
  { code: "PDT-04", title: "Human Behaviour & Emotional Intelligence", category: "PDT", audience: "TL/M", mode: "HY", duration: "4 Hr" },
  { code: "PDT-05", title: "Leadership & Team Management", category: "PDT", audience: "M", mode: "HY", duration: "1 Day" },
  { code: "PDT-06", title: "Time Management & Workplace Productivity", category: "PDT", audience: "ALL", mode: "ON", duration: "2 Hr" },
  { code: "PDT-07", title: "Corporate Etiquette, Meeting & Phone Discipline", category: "PDT", audience: "ALL", mode: "ON", duration: "2 Hr" },
  { code: "PDT-08", title: "Presentation & Public Speaking", category: "PDT", audience: "M", mode: "HY", duration: "4 Hr" },

  // ADT — AI & Digital Transformation
  { code: "ADT-01", title: "AI for Engineers & Technicians", category: "ADT", audience: "T", mode: "HY", duration: "4 Hr" },
  { code: "ADT-02", title: "ChatGPT for Technical Documentation", category: "ADT", audience: "ALL", mode: "ON", duration: "3 Hr" },
  { code: "ADT-03", title: "AI Report Writing & Inspection Automation", category: "ADT", audience: "TL/M", mode: "ON", duration: "3 Hr" },
  { code: "ADT-04", title: "Digital Governance (DGS) & QR Asset Management", category: "ADT", audience: "A", mode: "HY", duration: "4 Hr" },
  { code: "ADT-05", title: "Predictive Maintenance — AI Concepts", category: "ADT", audience: "M", mode: "HY", duration: "4 Hr" },
  { code: "ADT-06", title: "AI for Sales, Proposal & Customer Communication", category: "ADT", audience: "A", mode: "ON", duration: "3 Hr" },
  { code: "ADT-07", title: "AI KPI Dashboard & Data Analysis", category: "ADT", audience: "M/A", mode: "ON", duration: "3 Hr" },
  { code: "ADT-08", title: "AI Ethics, Cyber Security & Data Privacy", category: "ADT", audience: "ALL", mode: "ON", duration: "2 Hr" },

  // TTM — Technical Talent Matrix
  { code: "TTM-01", title: "Technician Competency Framework", category: "TTM", audience: "T", mode: "HY", duration: "3 Days" },
  { code: "TTM-02", title: "Team Leader Competency Framework", category: "TTM", audience: "TL", mode: "HY", duration: "3 Days" },
  { code: "TTM-03", title: "Manager Competency Framework", category: "TTM", audience: "M", mode: "HY", duration: "3 Days" },
  { code: "TTM-04", title: "Admin Competency Framework", category: "TTM", audience: "A", mode: "ON", duration: "2 Days" },
  { code: "TTM-05", title: "Assessor & Trainer Competency Framework", category: "TTM", audience: "AT", mode: "HY", duration: "3 Days" },
]

export const audienceLegend = [
  { code: "T", label: "Technician" },
  { code: "TL", label: "Team Leader / Front Line Manager" },
  { code: "M", label: "Managers" },
  { code: "A", label: "Admin" },
  { code: "ALL", label: "For All Members" },
]

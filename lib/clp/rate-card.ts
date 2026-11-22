/**
 * NLETA CLP-01 Annexure-A Financial Rate Card Rev.1
 * Generated from the uploaded FINAL workbook.
 *
 * Non-TTM rates are proposed and require internal approval before client issue.
 * TTM Option 1/2 are reference rates; option basis must be confirmed internally.
 * Travel / onsite expenses are excluded and separately chargeable.
 */
export type BatchCategory = "A" | "B" | "C" | "D";
export type TtmOption = "OPTION_1" | "OPTION_2";
export type RateTier = {
  category: BatchCategory;
  minParticipants: number;
  maxParticipants: number;
  pricePerBatch?: number;
  option1?: number;
  option2?: number;
};
export type RateCardProgram = {
  code: string; title: string; family: string; audience: string; mode: string;
  duration: string; complexity: string;
  rateStatus: "PROPOSED_PENDING_APPROVAL" | "REFERENCE_OPTION_BASIS_TO_CONFIRM";
  tiers: RateTier[];
};
export const RATE_CARD_REVISION = "CLP-01-Rev-1";
export const RATE_CARD_CURRENCY = "INR";
export const RATE_CARD_PROGRAMS: RateCardProgram[] = [
  {
    "code": "WCT-01",
    "title": "Workplace Behaviour & Professional Conduct",
    "family": "WCT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "WCT-02",
    "title": "Business Communication for Engineers",
    "family": "WCT",
    "audience": "T / TL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "WCT-03",
    "title": "Team Collaboration in Project Environment",
    "family": "WCT",
    "audience": "TL",
    "mode": "HY",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "WCT-04",
    "title": "Workplace Ethics & Responsible Use of Tools, Equipment and Resources",
    "family": "WCT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "SCT-01",
    "title": "Electrical Safety Awareness",
    "family": "SCT",
    "audience": "T",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "SCT-02",
    "title": "Lockout/Tagout (LOTO)",
    "family": "SCT",
    "audience": "T",
    "mode": "OF",
    "duration": "1 Day",
    "complexity": "Practical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 36000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 45000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 54000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 63000
      }
    ]
  },
  {
    "code": "SCT-03",
    "title": "PPE & Uniform Discipline",
    "family": "SCT",
    "audience": "T",
    "mode": "HY",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "SCT-04",
    "title": "Working at Height Safety",
    "family": "SCT",
    "audience": "T",
    "mode": "OF",
    "duration": "1 Day",
    "complexity": "Practical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 36000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 45000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 54000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 63000
      }
    ]
  },
  {
    "code": "SCT-05",
    "title": "First Aid & Basic Life Support",
    "family": "SCT",
    "audience": "T",
    "mode": "OF",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "SCT-06",
    "title": "Fire Safety & Emergency Preparedness",
    "family": "SCT",
    "audience": "ALL",
    "mode": "OF",
    "duration": "1 Day",
    "complexity": "Practical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 36000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 45000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 54000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 63000
      }
    ]
  },
  {
    "code": "SCT-07",
    "title": "Lift & Escalator Safety During War, Armed Conflict & High-Risk Security Emergencies",
    "family": "SCT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 21000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 26000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 31000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 36500
      }
    ]
  },
  {
    "code": "OET-01",
    "title": "Shift Handover Management",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "OET-02",
    "title": "Job Safety Analysis (JSA)",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "OET-03",
    "title": "Permit to Work (PTW)",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "OET-04",
    "title": "Risk Assessment & HIRA",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "OET-05",
    "title": "Documentation & Record Management",
    "family": "OET",
    "audience": "A",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "OET-06",
    "title": "NCR & CAPA Management",
    "family": "OET",
    "audience": "TL / M",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "OET-07",
    "title": "Tool Box Talk (TBT)",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "OET-08",
    "title": "Incident Investigation",
    "family": "OET",
    "audience": "TL / M",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "OET-09",
    "title": "Quality Inspection Process",
    "family": "OET",
    "audience": "TL",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "OET-10",
    "title": "KPI, MIS & Dashboard",
    "family": "OET",
    "audience": "M / A",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "LET-01",
    "title": "Lift Installation Codes & Engineering Ethics",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-02",
    "title": "Lift Maintenance & Troubleshooting",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-03",
    "title": "Escalator Installation",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-04",
    "title": "Escalator Maintenance",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-05",
    "title": "Construction Hoist Installation",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-06",
    "title": "Construction Hoist Safety",
    "family": "LET",
    "audience": "TL",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-07",
    "title": "EOT Crane Safety",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-08",
    "title": "Goods Lift Inspection",
    "family": "LET",
    "audience": "TL",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-09",
    "title": "Moving Walk Safety",
    "family": "LET",
    "audience": "T",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "LET-10",
    "title": "PAT • SAT • SCI • DGS Inspection Readiness",
    "family": "LET",
    "audience": "M",
    "mode": "HY",
    "duration": "1 Day",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 39000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 49000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 58500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 68000
      }
    ]
  },
  {
    "code": "FMT-01",
    "title": "RWA & Building Safety Governance",
    "family": "FMT",
    "audience": "A / M",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "FMT-02",
    "title": "Security Lift Emergency Response",
    "family": "FMT",
    "audience": "A / TL",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Practical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 24000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 30000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 36000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 42000
      }
    ]
  },
  {
    "code": "FMT-03",
    "title": "Housekeeping & Visitor Safety",
    "family": "FMT",
    "audience": "A",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "FMT-04",
    "title": "QRT & Mock Drill Management",
    "family": "FMT",
    "audience": "TL / M",
    "mode": "OF",
    "duration": "1 Day",
    "complexity": "Practical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 36000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 45000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 54000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 63000
      }
    ]
  },
  {
    "code": "FMT-05",
    "title": "AMC Vendor Coordination",
    "family": "FMT",
    "audience": "A / M",
    "mode": "HY",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "CSR-01",
    "title": "Community Safety Awareness",
    "family": "CSR",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "CSR-02",
    "title": "School & College Lift Safety",
    "family": "CSR",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "CSR-03",
    "title": "Women & Senior Citizen Accessibility",
    "family": "CSR",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "CSR-04",
    "title": "Child Safety & Public Behaviour",
    "family": "CSR",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "CSR-05",
    "title": "CSR Impact & Sustainability Reporting",
    "family": "CSR",
    "audience": "M / A",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "PDT-01",
    "title": "Personality Development & Professional Grooming",
    "family": "PDT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "PDT-02",
    "title": "Business Email, WhatsApp & Content Writing",
    "family": "PDT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "PDT-03",
    "title": "Client Communication & Customer Handling",
    "family": "PDT",
    "audience": "T / TL / A",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "PDT-04",
    "title": "Human Behaviour & Emotional Intelligence",
    "family": "PDT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 16000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 20000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 24000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 28000
      }
    ]
  },
  {
    "code": "PDT-05",
    "title": "Leadership & Team Management",
    "family": "PDT",
    "audience": "TL / M",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "PDT-06",
    "title": "Time Management & Workplace Productivity",
    "family": "PDT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "PDT-07",
    "title": "Corporate Etiquette, Meeting & Phone Discipline",
    "family": "PDT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Standard",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 12000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 15000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 18000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 21000
      }
    ]
  },
  {
    "code": "PDT-08",
    "title": "Presentation & Public Speaking",
    "family": "PDT",
    "audience": "M",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "ADT-01",
    "title": "AI for Engineers & Technicians",
    "family": "ADT",
    "audience": "T",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 23000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 29000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 34500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 40000
      }
    ]
  },
  {
    "code": "ADT-02",
    "title": "ChatGPT for Technical Documentation",
    "family": "ADT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "ADT-03",
    "title": "AI Report Writing & Inspection Automation",
    "family": "ADT",
    "audience": "TL / M",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "ADT-04",
    "title": "Digital Governance (DGS) & QR Asset Management",
    "family": "ADT",
    "audience": "A",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 26000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 32500
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 39000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 45500
      }
    ]
  },
  {
    "code": "ADT-05",
    "title": "Predictive Maintenance — AI Concepts",
    "family": "ADT",
    "audience": "M",
    "mode": "HY",
    "duration": "4 Hr",
    "complexity": "Specialist",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 26000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 32500
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 39000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 45500
      }
    ]
  },
  {
    "code": "ADT-06",
    "title": "AI for Sales, Proposal & Customer Communication",
    "family": "ADT",
    "audience": "A",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "ADT-07",
    "title": "AI KPI Dashboard & Data Analysis",
    "family": "ADT",
    "audience": "M / A",
    "mode": "ON",
    "duration": "3 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 18500
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 23000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 27500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 32000
      }
    ]
  },
  {
    "code": "ADT-08",
    "title": "AI Ethics, Cyber Security & Data Privacy",
    "family": "ADT",
    "audience": "ALL",
    "mode": "ON",
    "duration": "2 Hr",
    "complexity": "Technical",
    "rateStatus": "PROPOSED_PENDING_APPROVAL",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "pricePerBatch": 14000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "pricePerBatch": 17000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "pricePerBatch": 20500
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "pricePerBatch": 24000
      }
    ]
  },
  {
    "code": "TTM-01",
    "title": "Technician Competency Framework",
    "family": "TTM",
    "audience": "T",
    "mode": "HY",
    "duration": "3 Days",
    "complexity": "Ttm",
    "rateStatus": "REFERENCE_OPTION_BASIS_TO_CONFIRM",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "option1": 75000,
        "option2": 95000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "option1": 94000,
        "option2": 119000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "option1": 112000,
        "option2": 142000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "option1": 131000,
        "option2": 166000
      }
    ]
  },
  {
    "code": "TTM-02",
    "title": "Team Leader Competency Framework",
    "family": "TTM",
    "audience": "TL",
    "mode": "HY",
    "duration": "3 Days",
    "complexity": "Ttm",
    "rateStatus": "REFERENCE_OPTION_BASIS_TO_CONFIRM",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "option1": 85000,
        "option2": 110000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "option1": 106000,
        "option2": 138000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "option1": 128000,
        "option2": 165000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "option1": 149000,
        "option2": 192000
      }
    ]
  },
  {
    "code": "TTM-03",
    "title": "Manager Competency Framework",
    "family": "TTM",
    "audience": "M",
    "mode": "HY",
    "duration": "3 Days",
    "complexity": "Ttm",
    "rateStatus": "REFERENCE_OPTION_BASIS_TO_CONFIRM",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "option1": 95000,
        "option2": 125000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "option1": 119000,
        "option2": 156000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "option1": 142000,
        "option2": 188000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "option1": 166000,
        "option2": 219000
      }
    ]
  },
  {
    "code": "TTM-04",
    "title": "Admin Competency Framework",
    "family": "TTM",
    "audience": "A",
    "mode": "ON",
    "duration": "2 Days",
    "complexity": "Ttm",
    "rateStatus": "REFERENCE_OPTION_BASIS_TO_CONFIRM",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "option1": 55000,
        "option2": 70000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "option1": 69000,
        "option2": 88000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "option1": 82000,
        "option2": 105000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "option1": 96000,
        "option2": 122000
      }
    ]
  },
  {
    "code": "TTM-05",
    "title": "Assessor & Trainer Competency Framework",
    "family": "TTM",
    "audience": "AT",
    "mode": "HY",
    "duration": "3 Days",
    "complexity": "Ttm",
    "rateStatus": "REFERENCE_OPTION_BASIS_TO_CONFIRM",
    "tiers": [
      {
        "category": "A",
        "minParticipants": 1,
        "maxParticipants": 10,
        "option1": 110000,
        "option2": 140000
      },
      {
        "category": "B",
        "minParticipants": 11,
        "maxParticipants": 20,
        "option1": 138000,
        "option2": 175000
      },
      {
        "category": "C",
        "minParticipants": 21,
        "maxParticipants": 30,
        "option1": 165000,
        "option2": 210000
      },
      {
        "category": "D",
        "minParticipants": 31,
        "maxParticipants": 40,
        "option1": 192000,
        "option2": 245000
      }
    ]
  }
];

export function getBatchCategory(participants: number): BatchCategory | null {
  if (!Number.isInteger(participants) || participants < 1 || participants > 40) return null;
  if (participants <= 10) return "A";
  if (participants <= 20) return "B";
  if (participants <= 30) return "C";
  return "D";
}

export function getRateCardProgram(code: string) {
  return RATE_CARD_PROGRAMS.find((item) => item.code === code) ?? null;
}

export function getRateCardPrice(
  code: string,
  participants: number,
  ttmOption?: TtmOption | null
): { pricePerBatch: number; category: BatchCategory; status: RateCardProgram["rateStatus"] } | null {
  const program = getRateCardProgram(code);
  const category = getBatchCategory(participants);
  if (!program || !category) return null;
  const tier = program.tiers.find((item) => item.category === category);
  if (!tier) return null;
  if (program.family === "TTM") {
    if (ttmOption === "OPTION_1" && typeof tier.option1 === "number")
      return { pricePerBatch: tier.option1, category, status: program.rateStatus };
    if (ttmOption === "OPTION_2" && typeof tier.option2 === "number")
      return { pricePerBatch: tier.option2, category, status: program.rateStatus };
    return null;
  }
  if (typeof tier.pricePerBatch !== "number") return null;
  return { pricePerBatch: tier.pricePerBatch, category, status: program.rateStatus };
}

export interface TaxBracket {
  min: number;
  max: number | null; // null = no upper limit
  rate: number; // decimal, e.g., 0.15 = 15%
}

export interface SelfEmploymentTax {
  rate: number;
  maxEarnings: number | null; // null = no cap
  name: string;
}

export interface TaxConfig {
  federal: TaxBracket[];
  selfEmployment: SelfEmploymentTax[];
  provinces?: Record<string, TaxBracket[]>; // CA provinces
  states?: Record<string, TaxBracket[]>; // US states
}

// Canada 2026 Tax Brackets
export const canadaTax: TaxConfig = {
  federal: [
    { min: 0, max: 55867, rate: 0.15 },
    { min: 55867, max: 111733, rate: 0.205 },
    { min: 111733, max: 173205, rate: 0.26 },
    { min: 173205, max: 246752, rate: 0.29 },
    { min: 246752, max: null, rate: 0.33 },
  ],
  selfEmployment: [
    { name: "CPP", rate: 0.119, maxEarnings: 68500 }, // Both employee + employer portions
  ],
  provinces: {
    AB: [
      { min: 0, max: 148269, rate: 0.1 },
      { min: 148269, max: 177922, rate: 0.12 },
      { min: 177922, max: 237230, rate: 0.13 },
      { min: 237230, max: 355845, rate: 0.14 },
      { min: 355845, max: null, rate: 0.15 },
    ],
    BC: [
      { min: 0, max: 47937, rate: 0.0506 },
      { min: 47937, max: 95875, rate: 0.077 },
      { min: 95875, max: 110076, rate: 0.105 },
      { min: 110076, max: 133664, rate: 0.1229 },
      { min: 133664, max: 181232, rate: 0.147 },
      { min: 181232, max: 252752, rate: 0.168 },
      { min: 252752, max: null, rate: 0.205 },
    ],
    MB: [
      { min: 0, max: 47000, rate: 0.108 },
      { min: 47000, max: 100000, rate: 0.1275 },
      { min: 100000, max: null, rate: 0.174 },
    ],
    NB: [
      { min: 0, max: 49958, rate: 0.094 },
      { min: 49958, max: 99916, rate: 0.14 },
      { min: 99916, max: 185064, rate: 0.16 },
      { min: 185064, max: null, rate: 0.195 },
    ],
    NL: [
      { min: 0, max: 43198, rate: 0.087 },
      { min: 43198, max: 86395, rate: 0.145 },
      { min: 86395, max: 154244, rate: 0.158 },
      { min: 154244, max: 215943, rate: 0.178 },
      { min: 215943, max: 275870, rate: 0.198 },
      { min: 275870, max: 551739, rate: 0.208 },
      { min: 551739, max: 1103478, rate: 0.213 },
      { min: 1103478, max: null, rate: 0.218 },
    ],
    NS: [
      { min: 0, max: 29590, rate: 0.0879 },
      { min: 29590, max: 59180, rate: 0.1495 },
      { min: 59180, max: 93000, rate: 0.1667 },
      { min: 93000, max: 150000, rate: 0.175 },
      { min: 150000, max: null, rate: 0.21 },
    ],
    NT: [
      { min: 0, max: 50597, rate: 0.059 },
      { min: 50597, max: 101198, rate: 0.086 },
      { min: 101198, max: 164525, rate: 0.122 },
      { min: 164525, max: null, rate: 0.1405 },
    ],
    NU: [
      { min: 0, max: 53268, rate: 0.04 },
      { min: 53268, max: 106537, rate: 0.07 },
      { min: 106537, max: 173205, rate: 0.09 },
      { min: 173205, max: null, rate: 0.115 },
    ],
    ON: [
      { min: 0, max: 51446, rate: 0.0505 },
      { min: 51446, max: 102894, rate: 0.0915 },
      { min: 102894, max: 150000, rate: 0.1116 },
      { min: 150000, max: 220000, rate: 0.1216 },
      { min: 220000, max: null, rate: 0.1316 },
    ],
    PE: [
      { min: 0, max: 32656, rate: 0.098 },
      { min: 32656, max: 64313, rate: 0.138 },
      { min: 64313, max: 105000, rate: 0.167 },
      { min: 105000, max: 140000, rate: 0.1765 },
      { min: 140000, max: null, rate: 0.19 },
    ],
    QC: [
      { min: 0, max: 51780, rate: 0.14 },
      { min: 51780, max: 103545, rate: 0.19 },
      { min: 103545, max: 126000, rate: 0.24 },
      { min: 126000, max: null, rate: 0.2575 },
    ],
    SK: [
      { min: 0, max: 52057, rate: 0.105 },
      { min: 52057, max: 148734, rate: 0.125 },
      { min: 148734, max: null, rate: 0.145 },
    ],
    YT: [
      { min: 0, max: 55867, rate: 0.064 },
      { min: 55867, max: 111733, rate: 0.09 },
      { min: 111733, max: 173205, rate: 0.109 },
      { min: 173205, max: 500000, rate: 0.128 },
      { min: 500000, max: null, rate: 0.15 },
    ],
  },
};

// US 2026 Tax Brackets (Single Filer)
export const usTax: TaxConfig = {
  federal: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
  selfEmployment: [
    { name: "Social Security", rate: 0.124, maxEarnings: 168600 }, // 6.2% x 2
    { name: "Medicare", rate: 0.029, maxEarnings: null }, // 1.45% x 2
    { name: "Additional Medicare", rate: 0.009, maxEarnings: null }, // Over $200k, threshold handled in calc
  ],
  states: {
    // States with no income tax
    AK: [],
    FL: [],
    NV: [],
    SD: [],
    TX: [],
    WA: [],
    WY: [],
    TN: [], // No wage income tax
    NH: [], // No wage income tax
    // Flat rate states
    AZ: [{ min: 0, max: null, rate: 0.025 }],
    CO: [{ min: 0, max: null, rate: 0.044 }],
    ID: [{ min: 0, max: null, rate: 0.058 }],
    IL: [{ min: 0, max: null, rate: 0.0495 }],
    IN: [{ min: 0, max: null, rate: 0.0305 }],
    KY: [{ min: 0, max: null, rate: 0.04 }],
    MA: [{ min: 0, max: null, rate: 0.05 }],
    MI: [{ min: 0, max: null, rate: 0.0425 }],
    NC: [{ min: 0, max: null, rate: 0.0475 }],
    PA: [{ min: 0, max: null, rate: 0.0307 }],
    UT: [{ min: 0, max: null, rate: 0.0465 }],
    // Progressive states (simplified - using top marginal approach for common ones)
    CA: [
      { min: 0, max: 10412, rate: 0.01 },
      { min: 10412, max: 24684, rate: 0.02 },
      { min: 24684, max: 38959, rate: 0.04 },
      { min: 38959, max: 54081, rate: 0.06 },
      { min: 54081, max: 68350, rate: 0.08 },
      { min: 68350, max: 349137, rate: 0.093 },
      { min: 349137, max: 418961, rate: 0.103 },
      { min: 418961, max: 698271, rate: 0.113 },
      { min: 698271, max: null, rate: 0.123 },
    ],
    NY: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: null, rate: 0.109 },
    ],
    NJ: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: null, rate: 0.1075 },
    ],
    // Default for states not explicitly listed (average ~5%)
    AL: [{ min: 0, max: null, rate: 0.05 }],
    AR: [{ min: 0, max: null, rate: 0.044 }],
    CT: [{ min: 0, max: null, rate: 0.0699 }],
    DE: [{ min: 0, max: null, rate: 0.066 }],
    GA: [{ min: 0, max: null, rate: 0.0549 }],
    HI: [{ min: 0, max: null, rate: 0.11 }],
    IA: [{ min: 0, max: null, rate: 0.057 }],
    KS: [{ min: 0, max: null, rate: 0.057 }],
    LA: [{ min: 0, max: null, rate: 0.0425 }],
    ME: [{ min: 0, max: null, rate: 0.0715 }],
    MD: [{ min: 0, max: null, rate: 0.0575 }],
    MN: [{ min: 0, max: null, rate: 0.0985 }],
    MS: [{ min: 0, max: null, rate: 0.05 }],
    MO: [{ min: 0, max: null, rate: 0.048 }],
    MT: [{ min: 0, max: null, rate: 0.059 }],
    NE: [{ min: 0, max: null, rate: 0.0584 }],
    NM: [{ min: 0, max: null, rate: 0.059 }],
    ND: [{ min: 0, max: null, rate: 0.029 }],
    OH: [{ min: 0, max: null, rate: 0.0399 }],
    OK: [{ min: 0, max: null, rate: 0.0475 }],
    OR: [{ min: 0, max: null, rate: 0.099 }],
    RI: [{ min: 0, max: null, rate: 0.0599 }],
    SC: [{ min: 0, max: null, rate: 0.064 }],
    VT: [{ min: 0, max: null, rate: 0.0875 }],
    VA: [{ min: 0, max: null, rate: 0.0575 }],
    WV: [{ min: 0, max: null, rate: 0.055 }],
    WI: [{ min: 0, max: null, rate: 0.0765 }],
    DC: [{ min: 0, max: null, rate: 0.0975 }],
  },
};

// Mexico 2026 Tax Brackets (ISR - Impuesto Sobre la Renta)
// Federal progressive rates; states don't levy separate income tax on wages
export const mexicoTax: TaxConfig = {
  federal: [
    { min: 0, max: 8952, rate: 0.0192 },
    { min: 8952, max: 75984, rate: 0.064 },
    { min: 75984, max: 133536, rate: 0.1088 },
    { min: 133536, max: 155229, rate: 0.16 },
    { min: 155229, max: 185852, rate: 0.1792 },
    { min: 185852, max: 374837, rate: 0.2136 },
    { min: 374837, max: 590795, rate: 0.2352 },
    { min: 590795, max: 1127926, rate: 0.3 },
    { min: 1127926, max: 1503902, rate: 0.32 },
    { min: 1503902, max: 4511707, rate: 0.34 },
    { min: 4511707, max: null, rate: 0.35 },
  ],
  selfEmployment: [
    // IMSS voluntary contribution for self-employed (estimated average)
    { name: "IMSS", rate: 0.028, maxEarnings: null },
  ],
};

export function getTaxConfig(country: "CA" | "US" | "MX"): TaxConfig {
  if (country === "CA") return canadaTax;
  if (country === "MX") return mexicoTax;
  return usTax;
}

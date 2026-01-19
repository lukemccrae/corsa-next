/**
 * Abbreviation mappings for states and countries
 * Used for intelligent search/filter that matches both abbreviations and full names
 */

// US State abbreviation to full name mapping
export const stateAbbreviations: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

// Country code to full name mapping
export const countryAbbreviations: Record<string, string> = {
  USA: "United States",
  US: "United States",
  MEX: "Mexico",
  MX: "Mexico",
  CAN: "Canada",
  CA: "Canada",
  GBR: "United Kingdom",
  GB: "United Kingdom",
  UK: "United Kingdom",
  FRA: "France",
  FR: "France",
  DEU: "Germany",
  DE: "Germany",
  ITA: "Italy",
  IT: "Italy",
  ESP: "Spain",
  ES: "Spain",
  PRT: "Portugal",
  PT: "Portugal",
  NLD: "Netherlands",
  NL: "Netherlands",
  BEL: "Belgium",
  BE: "Belgium",
  CHE: "Switzerland",
  CH: "Switzerland",
  AUT: "Austria",
  AT: "Austria",
  SWE: "Sweden",
  SE: "Sweden",
  NOR: "Norway",
  NO: "Norway",
  DNK: "Denmark",
  DK: "Denmark",
  FIN: "Finland",
  FI: "Finland",
  POL: "Poland",
  PL: "Poland",
  CZE: "Czech Republic",
  CZ: "Czech Republic",
  JPN: "Japan",
  JP: "Japan",
  CHN: "China",
  CN: "China",
  AUS: "Australia",
  AU: "Australia",
  NZL: "New Zealand",
  NZ: "New Zealand",
  BRA: "Brazil",
  BR: "Brazil",
  ARG: "Argentina",
  AR: "Argentina",
  CHL: "Chile",
  CL: "Chile",
  ZAF: "South Africa",
  ZA: "South Africa",
};

/**
 * Normalize a search term: lowercase and trim whitespace
 */
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim();
}

/**
 * Get the full state name from an abbreviation
 * Returns the full name if found, otherwise returns null
 */
export function getFullStateName(abbreviation: string): string | null {
  const normalized = abbreviation.toUpperCase().trim();
  return stateAbbreviations[normalized] || null;
}

/**
 * Get the full country name from a country code
 * Returns the full name if found, otherwise returns null
 */
export function getFullCountryName(code: string): string | null {
  const normalized = code.toUpperCase().trim();
  return countryAbbreviations[normalized] || null;
}

/**
 * Check if a search term matches a state (either abbreviation or full name)
 * Supports partial matching
 */
export function matchesState(
  stateValue: string,
  searchTerm: string
): boolean {
  const search = normalizeSearchTerm(searchTerm);
  const stateAbbrev = normalizeSearchTerm(stateValue);

  // Check if search matches the abbreviation
  if (stateAbbrev.includes(search)) return true;

  // Check if search matches the full state name
  const fullStateName = getFullStateName(stateValue);
  if (fullStateName && normalizeSearchTerm(fullStateName).includes(search)) {
    return true;
  }

  return false;
}

/**
 * Check if a search term matches a country (either code or full name)
 * Supports partial matching
 */
export function matchesCountry(
  countryValue: string,
  searchTerm: string
): boolean {
  const search = normalizeSearchTerm(searchTerm);
  const countryCode = normalizeSearchTerm(countryValue);

  // Check if search matches the code
  if (countryCode.includes(search)) return true;

  // Check if search matches the full country name
  const fullCountryName = getFullCountryName(countryValue);
  if (
    fullCountryName &&
    normalizeSearchTerm(fullCountryName).includes(search)
  ) {
    return true;
  }

  return false;
}

export const DESTINATION_COUNTRIES: readonly string[] = [
  "Australia",
  "Austria",
  "Belgium",
  "Canada",
  "Czech Republic",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Japan",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
] as const;

export const isAllowedDestinationCountry = (value: string): boolean => {
  return DESTINATION_COUNTRIES.includes(value);
};

function normalizeText(value) {
  return String(value ?? "").toLowerCase().trim();
}

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

const OCCUPATIONS = [
  "self-employed",
  "unemployed",
  "entrepreneur",
  "researcher",
  "scientist",
  "teacher",
  "student",
  "farmer",
  "worker",
  "trader",
  "artisan",
  "fisherman",
  "fishermen",
  "youth",
];

export function parseNaturalInput(input) {
  const text = normalizeText(input);

  const profile = {
    age: null,
    occupation: "any",
    income: null,
    state: "any",
    description: String(input ?? "").trim(),
    bpl: false,
    low_income: false,
  };

  if (!text) return profile;

  // Age: "22 years old", "22-year-old", "age 22"
  const ageMatch =
    text.match(/\b(\d{1,2})\s*[- ]?\s*years?\s*[- ]?\s*old\b/) ||
    text.match(/\b(\d{1,2})\s*yrs?\s*old\b/) ||
    text.match(/\bage\s*(?:is\s*)?(\d{1,2})\b/) ||
    text.match(/\bi am\s+(\d{1,2})\s*(?:years?|yrs?)\b/);

  if (ageMatch) {
    const age = Number(ageMatch[1]);

    if (age >= 0 && age <= 120) {
      profile.age = age;
    }
  }

  // Occupation
  for (const occupation of OCCUPATIONS) {
    const pattern = new RegExp(
      `\\b${occupation.replace(/[- ]/g, "[- ]")}\\b`,
      "i"
    );

    if (pattern.test(text)) {
      profile.occupation =
        occupation === "fishermen" ? "fisherman" : occupation;
      break;
    }
  }

  // State: match full state names
  for (const state of STATES) {
    if (text.includes(state.toLowerCase())) {
      profile.state = state;
      break;
    }
  }

  // Income: parse explicit income phrases rather than arbitrary numbers
  const incomeMatch = text.match(
    /(?:income|earn|earning|salary)\s*(?:is|of|around|about|:)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(k)?\s*(?:per\s*month|monthly|\/month|a month)?/i
  );

  if (incomeMatch) {
    let income = Number(incomeMatch[1].replace(/,/g, ""));

    if (incomeMatch[2]) {
      income *= 1000;
    }

    if (Number.isFinite(income) && income >= 0) {
      profile.income = income;
    }
  }

  if (
    /\bbpl\b/.test(text) ||
    /\bbelow poverty line\b/.test(text)
  ) {
    profile.bpl = true;
  }

  if (/\blow[- ]income\b/.test(text)) {
    profile.low_income = true;
  }

  return profile;
}
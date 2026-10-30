// src/lib/matcher.js

// Normalize text for case-insensitive comparisons.
export function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

// Convert text into searchable words.
export function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Calculate Jaccard similarity between two sets of words.

function jaccardSimilarity(firstText, secondText) {
  const first = new Set(tokenize(firstText));
  const second = new Set(tokenize(secondText));

  if (first.size === 0 || second.size === 0) {
    return 0;
  }

  const intersection = [...first].filter((word) =>
    second.has(word)
  ).length;

  const union = new Set([...first, ...second]).size;

  return union === 0 ? 0 : intersection / union;
}

// Convert a value to a valid number or null.
function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// Treat empty values and "any" as unrestricted criteria.
function isUnrestricted(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return (
      value.length === 0 ||
      value.some((item) => normalizeText(item) === "any")
    );
  }

  return normalizeText(value) === "any";
}

// Return an array regardless of whether the input is a single
// value or an array.
function toArray(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

// Check whether a profile value matches one of the allowed values.
function matchesAllowedValue(profileValue, allowedValues) {
  if (isUnrestricted(allowedValues)) {
    return true;
  }

  if (
    profileValue === null ||
    profileValue === undefined ||
    profileValue === ""
  ) {
    return null;
  }

  const profileText = normalizeText(profileValue);

  const allowed = toArray(allowedValues).map(normalizeText);

  return allowed.includes(profileText);
}

// Find the first defined value among several supported field names.
function firstDefined(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
}

// Get state restrictions from supported JSON formats.
function getAllowedStates(eligibility) {
  if (Array.isArray(eligibility.states)) {
    return eligibility.states;
  }

  if (eligibility.location) {
    if (Array.isArray(eligibility.location.states)) {
      return eligibility.location.states;
    }

    if (eligibility.location.state) {
      return toArray(eligibility.location.state);
    }
  }

  return [];
}

// Get category requirements without assuming that state-specific
// categories are equivalent to central government categories.
function getCategoryRequirements(eligibility) {
  const categoryScope =
    normalizeText(eligibility.category_scope) || "unspecified";

  const categoryValues =
    eligibility.categories ??
    eligibility.caste_categories ??
    eligibility.category;

  return {
    scope: categoryScope,
    values: toArray(categoryValues),
  };
}

// Check eligibility for a single scheme.
export function checkEligibility(profile = {}, scheme = {}) {
  const eligibility =
    scheme && typeof scheme.eligibility === "object"
      ? scheme.eligibility
      : {};

  const reasons = [];
  const missingInformation = [];
  const failedCriteria = [];

  // 1. Minimum age
  const minAge = toNumber(
    firstDefined(eligibility.min_age, eligibility.minAge)
  );

  const age = toNumber(profile.age);

  if (minAge !== null) {
    if (age === null) {
      missingInformation.push("Age");
    } else if (age < minAge) {
      failedCriteria.push(
        `Minimum age requirement is ${minAge}.`
      );
    } else {
      reasons.push("Meets the minimum age requirement.");
    }
  }

  // 2. Maximum age
  const maxAge = toNumber(
    firstDefined(eligibility.max_age, eligibility.maxAge)
  );

  if (maxAge !== null) {
    if (age === null) {
      if (!missingInformation.includes("Age")) {
        missingInformation.push("Age");
      }
    } else if (age > maxAge) {
      failedCriteria.push(
        `Maximum age requirement is ${maxAge}.`
      );
    } else {
      reasons.push("Meets the maximum age requirement.");
    }
  }

  // 3. Income limit
  const incomeLimit = toNumber(
    firstDefined(
      eligibility.income_limit,
      eligibility.max_income,
      eligibility.incomeLimit
    )
  );

  const income = toNumber(profile.income);

  if (incomeLimit !== null) {
    if (income === null) {
      missingInformation.push("Income");
    } else if (income > incomeLimit) {
      failedCriteria.push(
        `Income exceeds the listed limit of ${incomeLimit}.`
      );
    } else {
      reasons.push("Income is within the listed limit.");
    }
  }

  // 4. Occupation
  const allowedOccupations = firstDefined(
    eligibility.occupation,
    eligibility.occupations
  );

  if (!isUnrestricted(allowedOccupations)) {
    const occupation = normalizeText(profile.occupation);

    if (!occupation) {
      missingInformation.push("Occupation");
    } else {
      const allowed = toArray(allowedOccupations).map(
        normalizeText
      );

      if (
        !allowed.includes(occupation) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Occupation does not match the listed requirement."
        );
      } else {
        reasons.push(
          "Occupation matches the listed requirement."
        );
      }
    }
  }

  // 5. State or location
  const allowedStates = getAllowedStates(eligibility);

  if (!isUnrestricted(allowedStates)) {
    const state = normalizeText(profile.state);

    if (!state) {
      missingInformation.push("State");
    } else {
      const allowed = allowedStates.map(normalizeText);

      if (
        !allowed.includes(state) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Your state does not match the listed requirement."
        );
      } else {
        reasons.push(
          "State matches the listed requirement."
        );
      }
    }
  }

  // 6. Rural / urban / location type
  const allowedLocationTypes = firstDefined(
    eligibility.location_types,
    eligibility.location_type,
    eligibility.location?.types
  );

  if (!isUnrestricted(allowedLocationTypes)) {
    const locationType = normalizeText(
      profile.location_type
    );

    if (!locationType) {
      missingInformation.push(
        "Location type (rural or urban)"
      );
    } else {
      const allowed = toArray(
        allowedLocationTypes
      ).map(normalizeText);

      if (
        !allowed.includes(locationType) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Your location type does not match the listed requirement."
        );
      } else {
        reasons.push(
          "Location type matches the requirement."
        );
      }
    }
  }

  // 7. Caste / community category
  // Only check this when a scheme explicitly specifies a restriction.
  const categoryRequirements =
    getCategoryRequirements(eligibility);

  const allowedCategories =
    categoryRequirements.values.filter(
      (item) => normalizeText(item) !== "any"
    );

  if (allowedCategories.length > 0) {
    const category = normalizeText(profile.category);

    if (
      !category ||
      category === "prefer_not_to_say" ||
      category === "prefer not to say"
    ) {
      missingInformation.push(
        "Category, if you choose to provide it"
      );
    } else {
      const allowed = allowedCategories.map(normalizeText);

      if (!allowed.includes(category)) {
        failedCriteria.push(
          "The provided category does not match the category requirement recorded for this scheme."
        );
      } else {
        reasons.push(
          "Category matches the recorded scheme requirement."
        );
      }
    }
  }

  // 8. Education level
  const allowedEducation = firstDefined(
    eligibility.education_levels,
    eligibility.education_level
  );

  if (!isUnrestricted(allowedEducation)) {
    const education = normalizeText(
      profile.education_level
    );

    if (!education) {
      missingInformation.push("Education level");
    } else {
      const allowed = toArray(
        allowedEducation
      ).map(normalizeText);

      if (
        !allowed.includes(education) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Education level does not match the listed requirement."
        );
      } else {
        reasons.push(
          "Education level matches the requirement."
        );
      }
    }
  }

  // 9. Employment status
  const allowedEmployment = firstDefined(
    eligibility.employment_statuses,
    eligibility.employment_status
  );

  if (!isUnrestricted(allowedEmployment)) {
    const employment = normalizeText(
      profile.employment_status
    );

    if (!employment) {
      missingInformation.push("Employment status");
    } else {
      const allowed = toArray(
        allowedEmployment
      ).map(normalizeText);

      if (
        !allowed.includes(employment) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Employment status does not match the listed requirement."
        );
      } else {
        reasons.push(
          "Employment status matches the requirement."
        );
      }
    }
  }

  // 10. Gender, if explicitly required by the scheme data.
  const allowedGender = firstDefined(
    eligibility.genders,
    eligibility.gender
  );

  if (!isUnrestricted(allowedGender)) {
    const gender = normalizeText(profile.gender);

    if (!gender) {
      missingInformation.push("Gender, if applicable");
    } else {
      const allowed = toArray(allowedGender).map(
        normalizeText
      );

      if (
        !allowed.includes(gender) &&
        !allowed.includes("any")
      ) {
        failedCriteria.push(
          "Gender does not match the listed requirement."
        );
      } else {
        reasons.push(
          "Gender matches the listed requirement."
        );
      }
    }
  }

  // A failed mandatory condition takes precedence over missing data.
  let status;

  if (failedCriteria.length > 0) {
    status = "ineligible";
  } else if (missingInformation.length > 0) {
    status = "needs_more_information";
  } else {
    status = "eligible";
  }

  return {
    status,
    eligible: status === "eligible",
    reasons,
    failedCriteria,
    missingInformation,
  };
}

// Calculate a recommendation score independently of eligibility.
// A high score never overrides a failed eligibility requirement.
export function computeScore(profile = {}, scheme = {}) {
  const keywords = Array.isArray(scheme.keywords)
    ? scheme.keywords
    : [];

  const description = [
    scheme.title,
    scheme.name,
    scheme.description,
    scheme.benefit,
    scheme.category,
    scheme.sector,
    scheme.scheme_type,
    ...keywords,
  ]
    .filter(Boolean)
    .join(" ");

  const profileText = [
    profile.occupation,
    profile.description,
    profile.education_level,
    profile.employment_status,
    profile.location_type,
    profile.state,
  ]
    .filter(Boolean)
    .join(" ");

  const similarity = jaccardSimilarity(
    profileText,
    description
  );

  const priorityValue = Number(scheme.priority);

  const safePriority = Number.isFinite(priorityValue)
    ? Math.min(1, Math.max(0, priorityValue))
    : 0.5;

  const score =
    similarity * 0.7 + safePriority * 0.3;

  return Math.round(score * 100) / 100;
}

// Create a readable explanation for a recommendation.
export function explainSchemeMatch(
  profile = {},
  scheme = {},
  score = 0,
  suppliedReasons = []
) {
  const result = checkEligibility(profile, scheme);

  const title =
    scheme.title || scheme.name || "This scheme";

  const lines = [`### ${title}`];

  if (result.status === "eligible") {
    lines.push(
      "**Eligibility status:** Eligible based on the information provided."
    );
  } else if (
    result.status === "needs_more_information"
  ) {
    lines.push(
      "**Eligibility status:** More information is needed."
    );
  } else {
    lines.push(
      "**Eligibility status:** One or more recorded eligibility conditions are not met."
    );
  }

  if (result.reasons.length > 0) {
    lines.push("\n**Requirements matched:**");

    result.reasons.forEach((reason) => {
      lines.push(`- ${reason}`);
    });
  }

  if (result.missingInformation.length > 0) {
    lines.push("\n**Information still needed:**");

    result.missingInformation.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (result.failedCriteria.length > 0) {
    lines.push("\n**Requirements not met:**");

    result.failedCriteria.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  const additionalReasons = Array.isArray(
    suppliedReasons
  )
    ? suppliedReasons.filter(
        (reason) =>
          typeof reason === "string" &&
          !result.reasons.includes(reason)
      )
    : [];

  if (additionalReasons.length > 0) {
    lines.push("\n**Recommendation notes:**");

    additionalReasons.forEach((reason) => {
      lines.push(`- ${reason}`);
    });
  }

  const numericScore = Number(score);

  if (Number.isFinite(numericScore)) {
    lines.push(
      `\n**Recommendation score:** ${Math.round(
        numericScore <= 1
          ? numericScore * 100
          : numericScore
      )}%. This is a ranking score, not a guarantee of eligibility.`
    );
  }

  const officialUrl =
    scheme.official_source_url ||
    scheme.application_url ||
    scheme.official_url ||
    scheme.website;

  if (
    typeof officialUrl === "string" &&
    /^https?:\/\//i.test(officialUrl)
  ) {
    lines.push(
      `\n**Official information:** ${officialUrl}`
    );
  }

  if (
    scheme.requirements_status ||
    scheme.verification_status
  ) {
    lines.push(
      `\n**Verification:** ${
        scheme.verification_status ||
        scheme.requirements_status
      }`
    );
  }

  lines.push(
    "\nConfirm the latest eligibility rules with the official department before applying."
  );

  return lines.join("\n");
}

// Determine whether a record is only a demo/example.
function isDemoScheme(scheme) {
  const id = normalizeText(scheme.id);
  const title = normalizeText(
    scheme.title || scheme.name
  );

  return (
    scheme.is_demo === true ||
    id.startsWith("demo_") ||
    /\bdemo\b/.test(title)
  );
}

// Match and rank schemes using eligibility and relevance.
export function matchSchemes(
  profile = {},
  schemes = []
) {
  if (!Array.isArray(schemes)) {
    return [];
  }

  return schemes
    .filter((scheme) => {
      if (
        !scheme ||
        typeof scheme !== "object" ||
        Array.isArray(scheme)
      ) {
        return false;
      }

      // Ignore demo records in personalized recommendations.
      // They may still be displayed in the general scheme directory.
      if (isDemoScheme(scheme)) {
        return false;
      }

      // IMPORTANT:
      // Do not exclude published:false records here.
      // Draft/unpublished records can still be evaluated, but the UI
      // should clearly label them as unverified or unpublished.
      return true;
    })
    .map((scheme) => {
      const eligibility = checkEligibility(
        profile,
        scheme
      );

      const score = computeScore(profile, scheme);

      return {
        scheme,
        score,
        status: eligibility.status,
        eligible: eligibility.eligible,
        reasons: eligibility.reasons,
        failedCriteria: eligibility.failedCriteria,
        missingInformation:
          eligibility.missingInformation,
      };
    })
    // Do not recommend schemes whose known mandatory requirements fail.
    .filter(
      (result) => result.status !== "ineligible"
    )
    // Eligible schemes appear first.
    // Schemes needing more information appear next.
    .sort((first, second) => {
      const statusOrder = {
        eligible: 0,
        needs_more_information: 1,
        ineligible: 2,
      };

      const statusDifference =
        statusOrder[first.status] -
        statusOrder[second.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return second.score - first.score;
    });
}

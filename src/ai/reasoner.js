function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function explainSchemeMatch(
  profile = {},
  scheme = {},
  score = 0,
  eligibilityReasons = []
) {
  if (!scheme || !scheme.title) {
    return "I couldn't find enough scheme information to explain this recommendation.";
  }

  const eligibility = scheme.eligibility || {};
  const lines = [
    `### Why ${scheme.title} may be relevant to you`,
    "",
  ];

  if (profile.age != null && profile.age !== "") {
    const age = Number(profile.age);

    if (Number.isFinite(age)) {
      if (eligibility.min_age != null && eligibility.max_age != null) {
        lines.push(
          `- Your age is ${age}. The listed age range is ${eligibility.min_age}–${eligibility.max_age}.`
        );
      } else if (eligibility.min_age != null) {
        lines.push(
          `- Your age is ${age}. The listed minimum age is ${eligibility.min_age}.`
        );
      } else if (eligibility.max_age != null) {
        lines.push(
          `- Your age is ${age}. The listed maximum age is ${eligibility.max_age}.`
        );
      } else {
        lines.push("- No age restriction is listed in the available scheme data.");
      }
    }
  }

  const occupation = normalizeText(profile.occupation);
  const occupations = Array.isArray(eligibility.occupation)
    ? eligibility.occupation
    : eligibility.occupation
      ? [eligibility.occupation]
      : [];

  if (occupation && occupations.length) {
    const matches = occupations.some(
      (item) =>
        normalizeText(item) === "any" ||
        normalizeText(item) === occupation
    );

    lines.push(
      matches
        ? `- Your occupation (${profile.occupation}) matches a listed target group.`
        : `- Your occupation (${profile.occupation}) may not match the listed target groups: ${occupations.join(", ")}.`
    );
  }

  const income = Number(profile.income);
  const limit = eligibility.income_limit;

  if (limit != null && limit !== "" && Number.isFinite(income)) {
    if (typeof limit === "number" && income <= limit) {
      lines.push(
        `- Your recorded income (${income}) is within the listed income limit (${limit}).`
      );
    } else if (typeof limit === "number") {
      lines.push(
        `- Your recorded income (${income}) exceeds the listed income limit (${limit}).`
      );
    } else {
      lines.push(
        `- The scheme has an income condition (${limit}); verify the official rules before applying.`
      );
    }
  } else {
    lines.push("- An income limit is not specified in the available data.");
  }

  const state = normalizeText(profile.state);
  const listedStates = Array.isArray(eligibility.location?.states)
    ? eligibility.location.states
    : [];

  if (listedStates.length) {
    const locationMatches = listedStates.some(
      (item) =>
        normalizeText(item) === "any" ||
        normalizeText(item) === state
    );

    lines.push(
      locationMatches
        ? `- Your state (${profile.state || "not provided"}) appears to be covered by the listed location rules.`
        : `- Your state (${profile.state || "not provided"}) is not among the listed states: ${listedStates.join(", ")}.`
    );
  } else {
    lines.push("- No state restriction is listed in the available data.");
  }

  if (scheme.benefit) {
    lines.push("", `**Listed benefit:** ${scheme.benefit}`);
  }

  if (Array.isArray(eligibilityReasons) && eligibilityReasons.length) {
    lines.push("", "### Eligibility notes");

    eligibilityReasons.forEach((reason) => {
      lines.push(`- ${String(reason)}`);
    });
  }

  const numericScore = Number(score);

  if (Number.isFinite(numericScore)) {
    lines.push(
      "",
      `**Match score:** ${Math.max(0, Math.min(1, numericScore)).toFixed(2)}/1.00`
    );
  }

  lines.push(
    "",
    "*This explanation uses the information available in GovMent. Confirm the current eligibility conditions with the official scheme authority before applying.*"
  );

  return lines.join("\n");
}
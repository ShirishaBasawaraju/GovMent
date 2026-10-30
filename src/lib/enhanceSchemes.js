// src/lib/enhanceSchemes.js

const COMMON_DOCUMENTS = [
  "Identity proof accepted by the scheme authority",
  "Address or residence proof, if required",
  "Recent passport-size photograph, if required",
];

function normalizeDocuments(documents) {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents
    .map((document) => {
      if (typeof document === "string") {
        return document.trim();
      }

      if (
        document &&
        typeof document === "object" &&
        typeof document.name === "string"
      ) {
        return document.name.trim();
      }

      if (
        document &&
        typeof document === "object" &&
        typeof document.title === "string"
      ) {
        return document.title.trim();
      }

      return "";
    })
    .filter(Boolean);
}

function getExistingDocuments(scheme) {
  const possibleDocumentLists = [
    scheme.documents_required,
    scheme.required_documents,
    scheme.documents?.required,
    scheme.documents?.required_documents,
  ];

  for (const documentList of possibleDocumentLists) {
    const normalized = normalizeDocuments(documentList);

    if (normalized.length > 0) {
      return [...new Set(normalized)];
    }
  }

  return [];
}

function getDocumentsForScheme(scheme) {
  // Preserve an existing document list whenever available.
  const existingDocuments = getExistingDocuments(scheme);

  if (existingDocuments.length > 0) {
    return existingDocuments;
  }

  const searchableText = [
    scheme.id,
    scheme.title,
    scheme.name,
    scheme.description,
    scheme.benefit,
    scheme.category,
    scheme.sector,
    ...(Array.isArray(scheme.keywords)
      ? scheme.keywords
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const documents = [...COMMON_DOCUMENTS];

  // Education and scholarship schemes.
  if (
    /scholarship|student|education|school|college|tuition/.test(
      searchableText
    )
  ) {
    documents.push(
      "Previous examination marksheet, if required",
      "Current admission or enrolment proof, if required",
      "Institution certificate, if required",
      "Bank account details, if applicable",
      "Income certificate, if required"
    );
  }

  // Agriculture and farmer schemes.
  if (
    /farmer|kisan|agriculture|crop|cultivat|irrigation/.test(
      searchableText
    )
  ) {
    documents.push(
      "Land ownership, tenancy, or cultivation proof, as applicable",
      "Farmer registration details, if required",
      "Bank account details, if applicable"
    );
  }

  // Pension and old-age assistance schemes.
  if (
    /pension|old age|senior citizen|widow|disability pension/.test(
      searchableText
    )
  ) {
    documents.push(
      "Age proof, if required",
      "Bank account details",
      "Income or pension eligibility proof, if required"
    );
  }

  // Employment and skill-development schemes.
  if (
    /employment|skill|training|rojgar|kaushal|job/.test(
      searchableText
    )
  ) {
    documents.push(
      "Educational qualification proof, if required",
      "Employment or skill registration details, if applicable"
    );
  }

  // Business, entrepreneurship, and loan schemes.
  if (
    /business|entrepreneur|startup|enterprise|udyog|loan|mudra/.test(
      searchableText
    )
  ) {
    documents.push(
      "Business or enterprise details",
      "Project report or business plan, if required",
      "Bank account details, if applicable",
      "Quotation or cost estimate, if required"
    );
  }

  // Housing schemes.
  if (
    /housing|awas|home|house|shelter/.test(searchableText)
  ) {
    documents.push(
      "Proof of residence, if required",
      "Income certificate, if required",
      "Land or property documents, if applicable"
    );
  }

  // Health and medical schemes.
  if (
    /health|medical|hospital|treatment|insurance|disease/.test(
      searchableText
    )
  ) {
    documents.push(
      "Relevant medical records, if required",
      "Health card or insurance details, if applicable",
      "Income certificate, if required"
    );
  }

  // Women, girls, and maternity schemes.
  if (
    /women|woman|girl|female|mahila|maternity/.test(
      searchableText
    )
  ) {
    documents.push(
      "Age proof, if required",
      "Bank account details, if applicable",
      "Marriage, maternity, or other supporting proof, if required"
    );
  }

  // Caste and community-based schemes.
  if (
    /scheduled caste|scheduled tribe|\bobc\b|caste|tribal/.test(
      searchableText
    )
  ) {
    documents.push(
      "Valid caste or community certificate, if applicable"
    );
  }

  // Disability-related schemes.
  if (
    /disability|divyang|disabled/.test(searchableText)
  ) {
    documents.push(
      "Disability certificate or UDID card, if required"
    );
  }

  // Income-based assistance schemes.
  if (
    /income|low-income|poor|poverty|\bbpl\b|economically weaker/.test(
      searchableText
    )
  ) {
    documents.push(
      "Income certificate or accepted income proof, if required"
    );
  }

  // Remove duplicate document names.
  return [
    ...new Map(
      documents.map((document) => [
        document.toLowerCase(),
        document,
      ])
    ).values(),
  ];
}

function isDemoScheme(scheme) {
  const id = String(scheme.id || "");
  const title = String(scheme.title || scheme.name || "");

  return (
    id.toLowerCase().startsWith("demo_") ||
    /\bdemo\b/i.test(title)
  );
}

function getOfficialUrl(scheme) {
  const possibleUrls = [
    scheme.official_source_url,
    scheme.application_url,
    scheme.official_url,
    scheme.website,
  ];

  return (
    possibleUrls.find(
      (url) =>
        typeof url === "string" &&
        /^https?:\/\//i.test(url.trim())
    )?.trim() || null
  );
}

export function enhanceSchemes(schemes = []) {
  if (!Array.isArray(schemes)) {
    return [];
  }

  return schemes
    .filter(
      (scheme) =>
        scheme &&
        typeof scheme === "object" &&
        !Array.isArray(scheme)
    )
    .map((scheme) => {
      const demo = isDemoScheme(scheme);

      const officialUrl = getOfficialUrl(scheme);

      return {
        ...scheme,

        documents_required: getDocumentsForScheme(scheme),

        official_source_url: officialUrl,

        is_demo: scheme.is_demo === true || demo,

        scheme_type:
          scheme.scheme_type ||
          (demo ? "Demo" : "Government scheme"),

        requirements_status:
          scheme.requirements_status ||
          (demo
            ? "Demo only — illustrative information"
            : "Verify requirements on the official website"),
      };
    });
}
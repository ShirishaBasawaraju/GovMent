import React, { useMemo, useState } from "react";
import documentsData from "../data/documentsData.json";
import certificatesData from "../data/certificates.json";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const normalize = (value) =>
  String(value ?? "").toLowerCase().trim();

const getSchemeTitle = (scheme) =>
  scheme?.title || scheme?.name || "Untitled Scheme";

const getSchemeDescription = (scheme) =>
  scheme?.description ||
  scheme?.short_description ||
  "No description available.";

const getSchemeKey = (scheme) =>
  String(scheme?.id || scheme?.scheme_id || getSchemeTitle(scheme));

const getOfficialLink = (item) => {
  const possibleLinks = [
    item?.official_source_url,
    item?.official_website,
    item?.official_url,
    item?.application_url,
    item?.website,
    item?.url,
    item?.source_url,
    item?.source?.url,
    item?.links?.official,
    item?.links?.application,
    item?.official_application_url,
    item?.official_information_url,
  ];

  return (
    possibleLinks.find(
      (link) =>
        typeof link === "string" && /^https?:\/\//i.test(link)
    ) || null
  );
};

const getRequiredDocuments = (scheme) => {
  const possibleFields = [
    scheme?.required_documents,
    scheme?.documents_required,
    scheme?.documents,
    scheme?.eligibility_documents,
    scheme?.application_documents,
  ];

  const documents = possibleFields.find(Array.isArray) || [];

  return documents
    .map((document) => {
      if (typeof document === "string") return document;

      if (document && typeof document === "object") {
        const name =
          document.name ||
          document.title ||
          document.document ||
          document.document_name;

        if (!name) return null;

        const condition =
          document.condition ||
          document.note ||
          document.description;

        return condition ? `${name} — ${condition}` : name;
      }

      return null;
    })
    .filter(Boolean);
};

const getCertificateRequirements = (scheme) => {
  const possibleFields = [
    scheme?.certificate_requirements,
    scheme?.required_certificates,
    scheme?.certificates_required,
  ];

  const requirements = possibleFields.find(Array.isArray) || [];

  return requirements
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        return (
          item.name ||
          item.title ||
          item.certificate ||
          item.document ||
          null
        );
      }

      return null;
    })
    .filter(Boolean);
};

const getVerificationLabel = (item) => {
  if (item?.verified === true) return "Verified";

  const status = normalize(
    item?.verification_status || item?.status
  );

  if (
    status === "verified" ||
    status === "officially verified"
  ) {
    return "Verified";
  }

  if (
    item?.published === false ||
    status === "verify" ||
    status === "unverified" ||
    status === "pending"
  ) {
    return "Verification needed";
  }

  return "Check official source";
};

const getVerificationStyle = (item) => {
  const label = getVerificationLabel(item);

  if (label === "Verified") {
    return "bg-green-100 text-green-800";
  }

  if (label === "Verification needed") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
};

const getSchemeKeywords = (scheme) => {
  const keywords = [
    ...safeArray(scheme?.keywords),
    ...safeArray(scheme?.tags),
  ];

  return keywords
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.name || item?.label || ""
    )
    .filter(Boolean);
};

const getSearchableSchemeText = (scheme) =>
  [
    getSchemeTitle(scheme),
    getSchemeDescription(scheme),
    scheme?.benefit,
    scheme?.category,
    scheme?.sector,
    scheme?.state,
    scheme?.state_name,
    ...getSchemeKeywords(scheme),
    ...getRequiredDocuments(scheme),
    ...getCertificateRequirements(scheme),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getCertificateArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.certificates)) return value.certificates;
  if (Array.isArray(value?.documents)) return value.documents;
  return [];
};

const getDocumentArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.documents)) return value.documents;
  return [];
};

const getArrayField = (item, fields) => {
  for (const field of fields) {
    if (Array.isArray(item?.[field])) {
      return item[field];
    }
  }

  return [];
};

const getItemName = (item) =>
  item?.name ||
  item?.title ||
  item?.document_name ||
  item?.certificate_name ||
  "Untitled item";

const getItemDescription = (item) =>
  item?.short_description ||
  item?.description ||
  item?.summary ||
  "More information has not been added yet.";

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not specified. Check the official source.";
  }

  return String(value);
};

function VerificationBadge({ item }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getVerificationStyle(
        item
      )}`}
    >
      {getVerificationLabel(item)}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
        ⌕
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        ⌕
      </div>

      <h3 className="font-semibold text-slate-800">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoList({
  title,
  items,
  emptyMessage = "No information has been added yet.",
}) {
  const list = safeArray(items);

  return (
    <div>
      <h4 className="mb-3 font-semibold text-slate-900">{title}</h4>

      {list.length > 0 ? (
        <ul className="space-y-2">
          {list.map((item, index) => {
            const text =
              typeof item === "string"
                ? item
                : item?.name ||
                  item?.title ||
                  item?.description ||
                  item?.document ||
                  JSON.stringify(item);

            return (
              <li
                key={`${title}-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="break-words text-sm leading-6 text-slate-700">
        {getDisplayValue(value)}
      </p>
    </div>
  );
}

function OfficialLink({ url, label = "Open official website" }) {
  if (!url || !/^https?:\/\//i.test(url)) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        A direct official link has not been added. Search the relevant
        government portal before applying.
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function DetailModal({ title, subtitle, item, onClose, children }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            {subtitle && (
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                {subtitle}
              </p>
            )}

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7">{children}</div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Close details
          </button>
        </div>
      </section>
    </div>
  );
}

export default function DocumentsModule({
  schemes: schemesProp = [],
}) {
  // Document Library has been removed.
  // Start directly on the Certificate Guide.
  const [activeTab, setActiveTab] = useState("certificates");

  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificateCategory, setCertificateCategory] = useState("All");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const [schemeSearch, setSchemeSearch] = useState("");
  const [selectedSchemeId, setSelectedSchemeId] = useState("");

  const certificates = useMemo(
    () => getCertificateArray(certificatesData),
    []
  );

  const certificateCategories = useMemo(
    () => [
      "All",
      ...new Set(
        certificates
          .map((certificate) => certificate.category)
          .filter(Boolean)
      ),
    ],
    [certificates]
  );

  const filteredCertificates = useMemo(() => {
    const term = normalize(certificateSearch);

    return certificates.filter((certificate) => {
      const matchesCategory =
        certificateCategory === "All" ||
        certificate.category === certificateCategory;

      const searchableText = [
        getItemName(certificate),
        certificate.category,
        getItemDescription(certificate),
        ...safeArray(certificate.importance),
        ...safeArray(certificate.who_needs_it),
        ...safeArray(certificate.documents_required),
        ...safeArray(certificate.application_steps),
        certificate.issuing_authority,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        matchesCategory &&
        (!term || normalize(searchableText).includes(term))
      );
    });
  }, [certificates, certificateSearch, certificateCategory]);

  const availableSchemes = useMemo(
    () =>
      safeArray(schemesProp).filter(
        (scheme) =>
          scheme &&
          typeof scheme === "object" &&
          (scheme.title || scheme.name)
      ),
    [schemesProp]
  );

  // No government-level filter: all schemes can be searched together.
  const filteredSchemes = useMemo(() => {
    const term = normalize(schemeSearch);

    return availableSchemes.filter((scheme) => {
      return (
        !term || getSearchableSchemeText(scheme).includes(term)
      );
    });
  }, [availableSchemes, schemeSearch]);

  const selectedScheme = useMemo(
    () =>
      filteredSchemes.find(
        (scheme) => getSchemeKey(scheme) === selectedSchemeId
      ) || null,
    [filteredSchemes, selectedSchemeId]
  );

  const tabs = [
    {
      id: "certificates",
      label: "Certificate Guide",
      icon: "▧",
    },
    {
      id: "requirements",
      label: "Scheme Documents",
      icon: "✓",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              GOVMENT RESOURCE CENTRE
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Government Certificate &amp; Scheme Document Guide
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
              Explore government certificates, learn which documents
              may be required for welfare schemes, and find official
              application information in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-2xl font-bold">
                  {certificates.length}
                </p>
                <p className="mt-1 text-xs text-indigo-100">
                  Certificate guides
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-2xl font-bold">
                  {availableSchemes.length}
                </p>
                <p className="mt-1 text-xs text-indigo-100">
                  Schemes available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main tabs: Document Library removed */}
        <div className="mb-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition sm:px-5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CERTIFICATE GUIDE */}
        {activeTab === "certificates" && (
          <section>
            <SectionHeading
              eyebrow="Know before you apply"
              title="Government Certificate Guide"
              description="Learn why certificates are useful, who may need them, which supporting documents may be required, and how to find the relevant issuing authority."
            />

            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ</span>

                <div>
                  <h3 className="font-semibold text-blue-950">
                    Important information
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-900/80">
                    Certificate rules, required documents, application
                    fees, and processing times can differ by state and
                    issuing authority. Check the official portal for
                    your location before applying. This guide does not
                    replace official instructions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px]">
              <SearchInput
                value={certificateSearch}
                onChange={setCertificateSearch}
                placeholder="Search income, caste, residence, birth certificate..."
              />

              <SelectFilter
                label="Certificate category"
                value={certificateCategory}
                onChange={setCertificateCategory}
                options={certificateCategories}
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredCertificates.length}
                </span>{" "}
                of {certificates.length} entries
              </p>

              {(certificateSearch ||
                certificateCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setCertificateSearch("");
                    setCertificateCategory("All");
                  }}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCertificates.map((certificate, index) => (
                  <button
                    key={
                      certificate.id ||
                      `${getItemName(certificate)}-${index}`
                    }
                    type="button"
                    onClick={() => setSelectedCertificate(certificate)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                        ▧
                      </div>

                      <VerificationBadge item={certificate} />
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {certificate.category || "General"}
                    </p>

                    <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-indigo-700">
                      {getItemName(certificate)}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {getItemDescription(certificate)}
                    </p>

                    {certificate.issuing_authority && (
                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        <span className="font-semibold">
                          Issuing authority:
                        </span>{" "}
                        {certificate.issuing_authority}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm font-semibold text-indigo-600">
                        View application guide
                      </span>

                      <span className="text-lg text-indigo-500 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No certificate guides found"
                description="Check the search spelling, select another category, or add certificate records to src/data/certificates.json."
              />
            )}
          </section>
        )}

        {/* SCHEME DOCUMENTS */}
        {activeTab === "requirements" && (
          <section>
            <SectionHeading
              eyebrow="Prepare your application"
              title="Scheme Documents"
              description="Search government schemes to explore their recorded document requirements, certificates, and official application information."
            />

            <div className="mb-6">
              <SearchInput
                value={schemeSearch}
                onChange={(value) => {
                  setSchemeSearch(value);
                  setSelectedSchemeId("");
                }}
                placeholder="Search schemes, documents, or keywords..."
              />
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredSchemes.length}
              </span>{" "}
              schemes
            </p>

            {filteredSchemes.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
                {/* Scheme list */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <h3 className="font-bold text-slate-900">
                      Available schemes
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {filteredSchemes.length} schemes found
                    </p>
                  </div>

                  <div className="max-h-[680px] overflow-y-auto p-2">
                    {filteredSchemes.map((scheme, index) => {
                      const key = getSchemeKey(scheme);
                      const isSelected = key === selectedSchemeId;

                      return (
                        <button
                          key={`${key}-${index}`}
                          type="button"
                          onClick={() => setSelectedSchemeId(key)}
                          className={`mb-1 w-full rounded-xl border p-4 text-left transition last:mb-0 ${
                            isSelected
                              ? "border-indigo-200 bg-indigo-50"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <h4
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-indigo-800"
                                : "text-slate-800"
                            }`}
                          >
                            {getSchemeTitle(scheme)}
                          </h4>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {getSchemeDescription(scheme)}
                          </p>

                          <p className="mt-3 text-xs font-medium text-indigo-600">
                            {getRequiredDocuments(scheme).length} listed
                            documents
                            {" · "}
                            {getCertificateRequirements(scheme).length}{" "}
                            listed certificates
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected scheme details */}
                <div className="min-w-0">
                  {selectedScheme ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-2xl">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                            Scheme document checklist
                          </p>

                          <h3 className="text-2xl font-bold text-slate-900">
                            {getSchemeTitle(selectedScheme)}
                          </h3>
                        </div>

                        <VerificationBadge item={selectedScheme} />
                      </div>

                      <p className="text-sm leading-7 text-slate-600">
                        {getSchemeDescription(selectedScheme)}
                      </p>

                      {selectedScheme.benefit && (
                        <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
                            Listed benefit
                          </p>

                          <p className="text-sm leading-6 text-emerald-950">
                            {selectedScheme.benefit}
                          </p>
                        </div>
                      )}

                      <div className="my-6 rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Scheme category
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {selectedScheme.category ||
                            selectedScheme.sector ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="space-y-7">
                        <InfoList
                          title="Documents listed in the scheme record"
                          items={getRequiredDocuments(selectedScheme)}
                          emptyMessage="No required documents have been added to this scheme record yet. Check the official scheme guidelines."
                        />

                        <InfoList
                          title="Certificates that may be relevant"
                          items={getCertificateRequirements(selectedScheme)}
                          emptyMessage="No specific certificate requirements have been recorded for this scheme."
                        />

                        <InfoList
                          title="Keywords and related topics"
                          items={getSchemeKeywords(selectedScheme)}
                          emptyMessage="No keywords have been added."
                        />

                        <div>
                          <h4 className="mb-3 font-semibold text-slate-900">
                            Official application information
                          </h4>

                          <OfficialLink
                            url={getOfficialLink(selectedScheme)}
                            label="Visit scheme website"
                          />
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <h4 className="font-semibold text-amber-950">
                            Before submitting an application
                          </h4>

                          <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
                            <li>
                              • Verify the current eligibility rules
                              with the official scheme authority.
                            </li>

                            <li>
                              • Confirm which documents are mandatory
                              and which are conditional.
                            </li>

                            <li>
                              • Check accepted document formats,
                              validity periods, and application deadlines.
                            </li>

                            <li>
                              • Do not assume a document is compulsory
                              simply because it appears in an
                              unverified dataset.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
                      <div className="max-w-sm text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                          ✓
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          Select a scheme
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Choose a scheme from the list to view its
                          recorded documents, certificates, and official
                          application information.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No schemes found"
                description="Try another search term. Make sure the schemes are passed into this component and include a title or name."
              />
            )}
          </section>
        )}

        {/* Footer information */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>

            <div>
              <h3 className="font-semibold text-slate-900">
                Use official sources for final confirmation
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                GovMent provides an informational guide to help users
                prepare. Government requirements may change, and some
                application procedures differ by state. Verify
                eligibility, document requirements, fees, and
                processing times through the responsible government
                department before submitting personal information or
                paying any fee.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE DETAILS MODAL */}
      <DetailModal
        title={getItemName(selectedCertificate)}
        subtitle={selectedCertificate?.category || "Certificate guide"}
        item={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      >
        {selectedCertificate && (
          <>
            <div>
              <div className="mb-3">
                <VerificationBadge item={selectedCertificate} />
              </div>

              <p className="text-sm leading-7 text-slate-600">
                {getItemDescription(selectedCertificate)}
              </p>
            </div>

            <InfoList
              title="Why is this document important?"
              items={safeArray(selectedCertificate.importance)}
              emptyMessage="Importance details have not been added yet."
            />

            <InfoList
              title="Who may need it?"
              items={safeArray(selectedCertificate.who_needs_it)}
              emptyMessage="The intended users have not been specified yet."
            />

            <InfoList
              title="Documents to prepare"
              items={safeArray(selectedCertificate.documents_required)}
              emptyMessage="The required supporting documents have not been verified or recorded. Check the official issuing authority."
            />

            <InfoList
              title="Application steps"
              items={safeArray(selectedCertificate.application_steps)}
              emptyMessage="Application steps have not been added yet. Follow the instructions on the official portal."
            />

            <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h4 className="mb-2 font-semibold text-slate-900">
                Application details
              </h4>

              <DetailRow
                label="Issuing authority"
                value={selectedCertificate.issuing_authority}
              />

              <DetailRow
                label="Application mode"
                value={selectedCertificate.application_mode}
              />

              <DetailRow
                label="Application fee"
                value={selectedCertificate.fee}
              />

              <DetailRow
                label="Processing time"
                value={selectedCertificate.processing_time}
              />
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-slate-900">
                Official application portal
              </h4>

              <OfficialLink
                url={
                  selectedCertificate.official_application_url ||
                  getOfficialLink(selectedCertificate)
                }
                label="Open application portal"
              />
            </div>

            {selectedCertificate.official_information_url &&
              selectedCertificate.official_information_url !==
                selectedCertificate.official_application_url && (
                <div>
                  <h4 className="mb-3 font-semibold text-slate-900">
                    Official information
                  </h4>

                  <OfficialLink
                    url={selectedCertificate.official_information_url}
                    label="Read official information"
                  />
                </div>
              )}

            {safeArray(selectedCertificate.related_scheme_ids).length >
              0 && (
              <InfoList
                title="Related scheme IDs"
                items={safeArray(selectedCertificate.related_scheme_ids)}
              />
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="font-semibold text-amber-950">
                Please verify before applying
              </h4>

              <p className="mt-2 text-sm leading-6 text-amber-900">
                Requirements can vary by state, issuing authority,
                and application type. Do not treat blank fees,
                processing times, or unverified document lists as
                official information. Confirm the current rules
                before applying.
              </p>
            </div>
          </>
        )}
      </DetailModal>
    </div>
  );
}
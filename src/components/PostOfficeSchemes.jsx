import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const postOfficeSchemes = [
  {
    id: "savings-account",
    name: "Post Office Savings Account",
    shortName: "Savings Account",
    category: "Savings",
    icon: "🏦",
    color: "from-blue-500 to-indigo-600",
    description:
      "A savings account offered through India Post for everyday savings and deposits.",
    benefits: [
      "Provides a place to keep savings.",
      "Designed for everyday savings transactions.",
      "Available through eligible post offices.",
    ],
    eligibility:
      "Eligibility and account-opening requirements depend on the applicable India Post rules.",
    documents: [
      "Identity proof",
      "Address proof",
      "Recent photograph, if required",
      "PAN or Form 60, as applicable",
    ],
    bestFor: "People looking for a basic savings account.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "recurring-deposit",
    name: "National Savings Recurring Deposit Account",
    shortName: "Recurring Deposit",
    category: "Deposits",
    icon: "📅",
    color: "from-emerald-500 to-teal-600",
    description:
      "A recurring deposit account designed for people who want to save a fixed amount regularly.",
    benefits: [
      "Encourages regular savings.",
      "Allows deposits according to the scheme rules.",
      "Provides a structured savings approach.",
    ],
    eligibility:
      "Account-opening eligibility, deposit requirements, and applicable conditions must be confirmed with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "Account-opening application",
      "PAN or Form 60, as applicable",
    ],
    bestFor: "People who prefer saving regularly over time.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "time-deposit",
    name: "National Savings Time Deposit Account",
    shortName: "Time Deposit",
    category: "Deposits",
    icon: "⏳",
    color: "from-violet-500 to-purple-600",
    description:
      "A time deposit product for people who want to deposit money for a selected period.",
    benefits: [
      "Offers defined deposit tenures under scheme rules.",
      "Supports planned savings.",
      "Interest and maturity conditions depend on the selected tenure and current rules.",
    ],
    eligibility:
      "Confirm eligible account holders, minimum deposit, tenure options, and other conditions with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "Account-opening application",
      "PAN or Form 60, as applicable",
    ],
    bestFor: "People planning to set money aside for a fixed period.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "monthly-income",
    name: "Monthly Income Scheme Account",
    shortName: "Monthly Income Scheme",
    category: "Income",
    icon: "💰",
    color: "from-amber-500 to-orange-600",
    description:
      "A small-savings product intended for people seeking periodic interest income.",
    benefits: [
      "Designed to provide periodic income under the applicable rules.",
      "Has defined investment and maturity conditions.",
      "May suit people planning predictable cash flow.",
    ],
    eligibility:
      "Check current investment limits, account-holder eligibility, and payment conditions with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "Account-opening application",
      "PAN or Form 60, as applicable",
    ],
    bestFor: "Eligible savers who want periodic income.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "senior-citizens",
    name: "Senior Citizens Savings Scheme",
    shortName: "Senior Citizens Scheme",
    category: "Retirement",
    icon: "👴",
    color: "from-rose-500 to-pink-600",
    description:
      "A government-backed savings scheme intended for eligible senior citizens and other specifically qualifying individuals.",
    benefits: [
      "Designed for eligible retirement-age investors.",
      "Offers periodic interest according to scheme rules.",
      "Has defined investment and maturity conditions.",
    ],
    eligibility:
      "Age and other eligibility conditions apply. Certain retired individuals may qualify under specific rules. Confirm the current requirements before applying.",
    documents: [
      "Age proof",
      "Identity proof",
      "Address proof",
      "PAN",
      "Retirement-related documents, where applicable",
    ],
    bestFor: "People who meet the scheme's retirement and age requirements.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "ppf",
    name: "Public Provident Fund",
    shortName: "PPF",
    category: "Long-Term Savings",
    icon: "🌱",
    color: "from-green-500 to-lime-600",
    description:
      "A long-term savings scheme with tax-related provisions governed by applicable law.",
    benefits: [
      "Supports long-term savings.",
      "Has a defined maturity period and extension rules.",
      "Tax treatment depends on current law and the investor's circumstances.",
    ],
    eligibility:
      "Eligibility and account-opening conditions apply. Confirm current rules, including restrictions on account ownership, with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "PAN or Form 60, as applicable",
      "Account-opening application",
    ],
    bestFor: "Eligible individuals planning long-term savings.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Account",
    shortName: "Sukanya Samriddhi",
    category: "Children & Education",
    icon: "👧",
    color: "from-pink-500 to-fuchsia-600",
    description:
      "A small-savings scheme designed to support the future financial needs of an eligible girl child.",
    benefits: [
      "Supports long-term savings for a girl child's future.",
      "Has scheme-specific deposit and maturity rules.",
      "Tax treatment is subject to applicable law.",
    ],
    eligibility:
      "Girl-child age, guardian, account-opening, and family-related conditions apply. Verify the current rules with India Post.",
    documents: [
      "Girl child's birth certificate",
      "Guardian's identity proof",
      "Guardian's address proof",
      "PAN or other required documents",
    ],
    bestFor: "Eligible families saving for a girl child's future.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "national-savings-certificate",
    name: "National Savings Certificate",
    shortName: "NSC",
    category: "Long-Term Savings",
    icon: "📜",
    color: "from-cyan-500 to-blue-600",
    description:
      "A fixed-term savings instrument offered through India Post under government small-savings rules.",
    benefits: [
      "Supports planned savings over a defined term.",
      "Has scheme-specific interest and maturity rules.",
      "Tax benefits, if applicable, depend on current law.",
    ],
    eligibility:
      "Confirm eligible investors, purchase rules, minimum amounts, and current conditions with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "PAN or Form 60, as applicable",
      "Purchase application",
    ],
    bestFor: "Eligible savers planning for a defined investment term.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "kisan-vikas-patra",
    name: "Kisan Vikas Patra",
    shortName: "KVP",
    category: "Long-Term Savings",
    icon: "🌾",
    color: "from-lime-500 to-green-600",
    description:
      "A savings certificate product with maturity conditions determined by the applicable scheme rules.",
    benefits: [
      "Provides a structured savings option.",
      "Maturity depends on the applicable scheme terms.",
      "Investment limits and purchase conditions must be checked.",
    ],
    eligibility:
      "Check eligible account holders, purchase rules, and other current requirements with India Post.",
    documents: [
      "Identity proof",
      "Address proof",
      "PAN or Form 60, as applicable",
      "Purchase application",
    ],
    bestFor: "Eligible savers seeking a defined savings instrument.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
  {
    id: "mahila-samman",
    name: "Mahila Samman Savings Certificate",
    shortName: "Mahila Samman",
    category: "Women",
    icon: "👩",
    color: "from-fuchsia-500 to-rose-600",
    description:
      "A savings product introduced specifically for women and girls under a time-limited scheme.",
    benefits: [
      "Was designed to encourage savings by women and girls.",
      "Had scheme-specific investment and maturity conditions.",
      "Availability depends on the scheme's official validity period and current government notifications.",
    ],
    eligibility:
      "This scheme was introduced with a limited account-opening period. Do not assume new accounts are currently available; verify the latest official notification.",
    documents: [
      "Identity proof",
      "Address proof",
      "PAN or Form 60, as applicable",
      "Other documents required by the official rules",
    ],
    bestFor: "People checking the status of this women-focused savings product.",
    officialUrl: "https://www.indiapost.gov.in/",
  },
];

const categories = [
  "All",
  "Savings",
  "Deposits",
  "Income",
  "Retirement",
  "Long-Term Savings",
  "Children & Education",
  "Women",
];

export default function PostOfficeSchemes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  const filteredSchemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return postOfficeSchemes.filter((scheme) => {
      const matchesCategory =
        selectedCategory === "All" ||
        scheme.category === selectedCategory;

      const searchableText = [
        scheme.name,
        scheme.shortName,
        scheme.category,
        scheme.description,
        scheme.bestFor,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-blue-950 p-6 text-white sm:p-9">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide">
            INDIA POST · SMALL SAVINGS
          </span>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            Make your savings
            <br />
            work toward your future.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
            Explore post office savings products, compare their
            purposes, and review the documents you may need. Always
            check the latest official rules before investing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.indiapost.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
            >
              Visit India Post ↗
            </a>

            <a
              href="https://www.nsiindia.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              National Savings Institute ↗
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-white/5" />
      </section>

      {/* IMPORTANT NOTICE */}
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">
            ⚠️
          </span>

          <div>
            <h3 className="font-bold text-amber-950 dark:text-amber-200">
              Before choosing a savings scheme
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-900 dark:text-amber-100">
              Interest rates, deposit limits, eligibility, tax
              treatment, and account-opening availability can change.
              This page is for general information and does not
              guarantee eligibility or investment returns. Confirm
              current details through official government sources.
            </p>
          </div>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            value: postOfficeSchemes.length,
            label: "Savings products listed",
            detail: "Browse the information catalogue",
            icon: "▤",
          },
          {
            value: categories.length - 1,
            label: "Categories",
            detail: "Explore different savings goals",
            icon: "◈",
          },
          {
            value: "Official",
            label: "Verification",
            detail: "Links to government sources",
            icon: "✓",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.label}
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {item.icon}
              </span>
            </div>

            <p className="mt-3 text-3xl font-extrabold">
              {item.value}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {item.detail}
            </p>
          </div>
        ))}
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold">
            Explore savings products
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search by scheme name, purpose, or savings category.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search savings schemes..."
              aria-label="Search savings schemes"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* SCHEME CARDS */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">
            Available information
          </h3>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {filteredSchemes.length} results
          </span>
        </div>

        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSchemes.map((scheme, index) => (
              <motion.article
                key={scheme.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index * 0.04, 0.2),
                }}
                whileHover={{ y: -3 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
              >
                <div
                  className={`bg-gradient-to-br ${scheme.color} p-5 text-white`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl">
                      {scheme.icon}
                    </span>

                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                      {scheme.category}
                    </span>
                  </div>

                  <h4 className="mt-5 text-xl font-extrabold leading-snug">
                    {scheme.name}
                  </h4>

                  <p className="mt-2 text-sm text-white/80">
                    {scheme.shortName}
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {scheme.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      May suit
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {scheme.bestFor}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScheme(scheme);
                      setShowAllDocuments(false);
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    View scheme details
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            <div className="text-4xl" aria-hidden="true">
              ⌕
            </div>

            <h4 className="mt-3 font-bold">
              No savings products found
            </h4>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try another search term or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Show all products
            </button>
          </div>
        )}
      </section>

      {/* DOCUMENT CHECKLIST */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold">
              Account-opening document checklist
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              A general preparation checklist. The exact documents
              depend on the account and current official requirements.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllDocuments((previous) => !previous)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {showAllDocuments ? "Show less" : "View checklist"}
          </button>
        </div>

        <AnimatePresence>
          {showAllDocuments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Identity proof accepted under current rules",
                  "Address proof accepted under current rules",
                  "PAN or Form 60, as applicable",
                  "Recent photograph, if required",
                  "Completed account-opening form",
                  "Minor's birth certificate, where applicable",
                  "Guardian details, where applicable",
                  "Additional scheme-specific documents",
                ].map((document) => (
                  <div
                    key={document}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      ✓
                    </span>

                    <span className="text-sm leading-5">
                      {document}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                This checklist is informational, not an official
                document list. Confirm requirements with the post
                office before submitting an application.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SCHEME DETAILS MODAL */}
      <AnimatePresence>
        {selectedScheme && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedScheme(null);
              }
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="post-office-modal-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            >
              <div
                className={`bg-gradient-to-br ${selectedScheme.color} p-6 text-white sm:p-8`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                      {selectedScheme.category}
                    </span>

                    <h3
                      id="post-office-modal-title"
                      className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl"
                    >
                      {selectedScheme.name}
                    </h3>

                    <p className="mt-2 text-sm text-white/80">
                      {selectedScheme.shortName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedScheme(null)}
                    aria-label="Close scheme details"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl hover:bg-white/20"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-7">
                <div>
                  <h4 className="font-bold">About this scheme</h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {selectedScheme.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold">Potential benefits</h4>

                  <ul className="mt-3 space-y-2">
                    {selectedScheme.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                      >
                        <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                          ✓
                        </span>

                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h4 className="font-bold">Eligibility and conditions</h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {selectedScheme.eligibility}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold">
                    Documents to prepare
                  </h4>

                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedScheme.documents.map((document) => (
                      <li
                        key={document}
                        className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800"
                      >
                        {document}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm leading-6 text-amber-950 dark:text-amber-100">
                    <strong>Important:</strong> Interest rates,
                    eligibility, tax treatment, investment limits,
                    maturity conditions, and account availability
                    must be verified using current official
                    notifications.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={selectedScheme.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Check India Post ↗
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedScheme(null)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Close details
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
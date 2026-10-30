
// src/components/ResultsPanel.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { explainSchemeMatch } from "../ai/reasoner";

const safeArray = (value) =>
    Array.isArray(value) ? value : [];

export default function ResultsPanel({
    results = [],
    profile = {},
    browseMode = false
}) {
    const [explanations, setExplanations] = useState({});

    const getSchemeId = (scheme) =>
        scheme.id ?? scheme.title ?? scheme.name ?? "unknown-scheme";

    const toggleExplanation = (result) => {
        const schemeId = getSchemeId(result.scheme);

        const current = explanations[schemeId];

        if (current?.show) {
            setExplanations((previous) => ({
                ...previous,
                [schemeId]: {
                    ...previous[schemeId],
                    show: false
                }
            }));

            return;
        }

        let explanation = "";

        try {
            explanation = explainSchemeMatch(
                profile,
                result.scheme,
                result.score,
                result.reasons || []
            );

            if (typeof explanation !== "string") {
                explanation = String(explanation ?? "");
            }
        } catch {
            explanation =
                "Review the eligibility requirements and your profile details. " +
                "Verify all conditions through the official scheme portal.";
        }

        setExplanations((previous) => ({
            ...previous,
            [schemeId]: {
                show: true,
                text: explanation
            }
        }));
    };

    const getStatus = (result) => {
        if (browseMode) return "browse";

        if (result.status) return result.status;

        return result.eligible === false
            ? "ineligible"
            : "eligible";
    };

    const statusDetails = {
        browse: {
            label: "Explore scheme",
            classes:
                "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
        },
        eligible: {
            label: "Potentially eligible",
            classes:
                "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
        },
        needs_more_information: {
            label: "More information needed",
            classes:
                "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        },
        ineligible: {
            label: "Eligibility criteria not met",
            classes:
                "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
        }
    };

    // Normalize document data from different supported JSON formats.
    const getDocuments = (scheme) => {
        const documents = scheme?.documents;

        let required = [];
        let conditional = [];

        if (Array.isArray(documents)) {
            required = documents;
        } else if (
            documents &&
            typeof documents === "object"
        ) {
            required = safeArray(documents.required);
            conditional = safeArray(documents.conditional);
        }

        if (required.length === 0) {
            required =
                safeArray(scheme?.documents_required).length > 0
                    ? scheme.documents_required
                    : safeArray(scheme?.required_documents);
        }

        if (conditional.length === 0) {
            conditional = safeArray(
                scheme?.conditional_documents
            );
        }

        // Support an alternative field containing document names.
        if (
            required.length === 0 &&
            Array.isArray(scheme?.requiredDocuments)
        ) {
            required = scheme.requiredDocuments;
        }

        return {
            required,
            conditional
        };
    };

    const getDocumentName = (document) => {
        if (typeof document === "string") {
            return document;
        }

        return (
            document?.name ||
            document?.title ||
            document?.document ||
            document?.document_name ||
            "Document details unavailable"
        );
    };

    const getDocumentDescription = (document) => {
        if (!document || typeof document !== "object") {
            return "";
        }

        return (
            document.description ||
            document.details ||
            document.note ||
            ""
        );
    };

    const getApplicationSteps = (scheme) => {
        const application = scheme?.application;

        if (Array.isArray(application)) {
            return application;
        }

        if (Array.isArray(application?.steps)) {
            return application.steps;
        }

        if (Array.isArray(scheme?.application_steps)) {
            return scheme.application_steps;
        }

        return [];
    };

    const getOfficialUrl = (scheme) => {
        const candidates = [
            scheme?.application?.official_url,
            scheme?.application?.url,
            scheme?.official_source_url,
            scheme?.official_url,
            scheme?.official_website,
            scheme?.application_url,
            scheme?.website,
            scheme?.url
        ];

        return (
            candidates.find(
                (url) =>
                    typeof url === "string" &&
                    /^https?:\/\//i.test(url.trim())
            ) || ""
        );
    };

    const getVerification = (scheme) =>
        scheme?.verification || {};

    const renderDocumentList = (documents, emptyMessage) => {
        if (documents.length === 0) {
            return (
                <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {emptyMessage}
                </p>
            );
        }

        return (
            <ul className="mt-3 space-y-3">
                {documents.map((document, index) => (
                    <li
                        key={`${getDocumentName(document)}-${index}`}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {index + 1}
                        </span>

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {getDocumentName(document)}
                            </p>

                            {getDocumentDescription(document) && (
                                <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                                    {getDocumentDescription(document)}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-6">
            {/* Heading */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {browseMode
                            ? "Government Scheme Catalogue"
                            : "Scheme Recommendations"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {browseMode
                            ? "Explore government schemes, benefits, eligibility requirements, documents and application guidance."
                            : "Review your potential eligibility, required documents and application guidance."}
                    </p>
                </div>

                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {results.length} schemes
                </span>
            </div>

            <AnimatePresence mode="popLayout">
                {/* Empty State */}
                {results.length === 0 && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800"
                    >
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                            {browseMode
                                ? "No schemes available"
                                : "No matching schemes found"}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {browseMode
                                ? "Please check again later for available schemes."
                                : "Try updating your profile or searching the scheme catalogue."}
                        </p>
                    </motion.div>
                )}

                {/* Scheme Cards */}
                {results.map((result, index) => {
                    const scheme = result.scheme || {};
                    const schemeId =
                        getSchemeId(scheme) ?? index;

                    const status = getStatus(result);

                    const statusInfo =
                        statusDetails[status] ||
                        statusDetails.needs_more_information;

                    const explanation = explanations[schemeId];

                    const documents = getDocuments(scheme);
                    const steps = getApplicationSteps(scheme);
                    const officialUrl = getOfficialUrl(scheme);
                    const verification = getVerification(scheme);

                    const score = Number(result.score);

                    const displayScore = browseMode
                        ? null
                        : Number.isFinite(score)
                            ? `${Math.round(
                                score <= 1 ? score * 100 : score
                            )}%`
                            : "N/A";

                    return (
                        <motion.article
                            key={`${schemeId}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="p-5 sm:p-6">
                                {/* Scheme Title and Status */}
                                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.classes}`}
                                            >
                                                {statusInfo.label}
                                            </span>

                                            {scheme.category && (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    {scheme.category}
                                                </span>
                                            )}

                                            {(scheme.government_level ||
                                                scheme.level) && (
                                                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                                                    {scheme.government_level ||
                                                        scheme.level}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {scheme.title ||
                                                scheme.name ||
                                                "Government Scheme"}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {scheme.description ||
                                                "No scheme description is available yet."}
                                        </p>

                                        {scheme.ministry_or_department && (
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Ministry / Department:{" "}
                                                {scheme.ministry_or_department}
                                            </p>
                                        )}
                                    </div>

                                    {!browseMode && (
                                        <div className="flex shrink-0 items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-950/50 sm:block sm:min-w-24 sm:text-center">
                                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                                {displayScore}
                                            </div>

                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Relevance score
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Benefits */}
                                {scheme.benefit && (
                                    <div className="mt-5 rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                                        <h4 className="text-sm font-bold text-green-800 dark:text-green-300">
                                            Scheme Benefits
                                        </h4>

                                        <p className="mt-1 text-sm leading-6 text-green-900 dark:text-green-200">
                                            {Array.isArray(scheme.benefit)
                                                ? scheme.benefit.join(", ")
                                                : scheme.benefit}
                                        </p>
                                    </div>
                                )}

                                {/* Eligibility Matches */}
                                {!browseMode &&
                                    Array.isArray(result.matched) &&
                                    result.matched.length > 0 && (
                                        <div className="mt-5">
                                            <h4 className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                                Requirements matched
                                            </h4>

                                            <ul className="space-y-2">
                                                {result.matched.map(
                                                    (item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2 text-sm text-gray-600 dark:text-gray-300"
                                                        >
                                                            <span className="text-green-600">
                                                                ✓
                                                            </span>
                                                            <span>{item}</span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {/* Requirements Not Met */}
                                {!browseMode &&
                                    Array.isArray(result.failed) &&
                                    result.failed.length > 0 && (
                                        <div className="mt-5 rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                                            <h4 className="mb-2 text-sm font-bold text-red-800 dark:text-red-300">
                                                Requirements not met
                                            </h4>

                                            <ul className="space-y-2">
                                                {result.failed.map(
                                                    (item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2 text-sm text-red-800 dark:text-red-200"
                                                        >
                                                            <span>•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {/* Missing Information */}
                                {!browseMode &&
                                    Array.isArray(result.missing) &&
                                    result.missing.length > 0 && (
                                        <div className="mt-5 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
                                            <h4 className="mb-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                                                Information still needed
                                            </h4>

                                            <ul className="space-y-2">
                                                {result.missing.map(
                                                    (item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2 text-sm text-amber-900 dark:text-amber-200"
                                                        >
                                                            <span>•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {/* Required Documents - No Checklist */}
                                <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                        Required Documents
                                    </h4>

                                    {renderDocumentList(
                                        documents.required,
                                        "No required document list is recorded for this scheme yet. Please check the official scheme website for the latest requirements."
                                    )}
                                </div>

                                {/* Conditional Documents */}
                                {documents.conditional.length > 0 && (
                                    <div className="mt-5">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                            Additional Documents (If Applicable)
                                        </h4>

                                        {renderDocumentList(
                                            documents.conditional,
                                            ""
                                        )}
                                    </div>
                                )}

                                {/* Application Steps */}
                                {steps.length > 0 && (
                                    <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                            How to Apply
                                        </h4>

                                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {steps.map((step, i) => (
                                                <li key={i}>
                                                    {typeof step === "string"
                                                        ? step
                                                        : step?.description ||
                                                          step?.title ||
                                                          JSON.stringify(step)}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* Verification Details */}
                                {verification.status && (
                                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                                        Data status: {verification.status}

                                        {verification.last_verified
                                            ? ` · Last verified: ${verification.last_verified}`
                                            : ""}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleExplanation(result)
                                        }
                                        className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-950"
                                    >
                                        {explanation?.show
                                            ? "Hide Explanation"
                                            : browseMode
                                                ? "Understand eligibility"
                                                : "Why this recommendation?"}
                                    </button>

                                    {officialUrl && (
                                        <a
                                            href={officialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                                        >
                                            Official Scheme Website
                                            <span aria-hidden="true">
                                                ↗
                                            </span>
                                        </a>
                                    )}
                                </div>

                                {/* AI Explanation */}
                                <AnimatePresence>
                                    {explanation?.show && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto"
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-5 rounded-lg border-l-4 border-indigo-500 bg-gray-50 p-4 dark:bg-gray-700">
                                                <ReactMarkdown
                                                    components={{
                                                        h3: ({ ...props }) => (
                                                            <h3
                                                                className="mb-2 mt-3 font-bold text-gray-900 dark:text-white"
                                                                {...props}
                                                            />
                                                        ),
                                                        h4: ({ ...props }) => (
                                                            <h4
                                                                className="mb-2 mt-3 font-semibold text-gray-800 dark:text-gray-100"
                                                                {...props}
                                                            />
                                                        ),
                                                        p: ({ ...props }) => (
                                                            <p
                                                                className="mb-2 text-sm leading-6 text-gray-700 dark:text-gray-200"
                                                                {...props}
                                                            />
                                                        ),
                                                        ul: ({ ...props }) => (
                                                            <ul
                                                                className="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200"
                                                                {...props}
                                                            />
                                                        ),
                                                        ol: ({ ...props }) => (
                                                            <ol
                                                                className="mb-3 list-decimal space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200"
                                                                {...props}
                                                            />
                                                        )
                                                    }}
                                                >
                                                    {explanation.text}
                                                </ReactMarkdown>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Additional Notes */}
                                {Array.isArray(result.notes) &&
                                    result.notes.length > 0 && (
                                        <div className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                            {result.notes.map((note, i) => (
                                                <p key={i}>{note}</p>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </motion.article>
                    );
                })}
            </AnimatePresence>

            {/* Disclaimer */}
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                Eligibility results are preliminary guidance based on
                available data. Document lists may be incomplete or
                conditional. Always verify current eligibility conditions,
                required documents, deadlines, and application procedures
                with the relevant official government department.
            </p>
        </div>
    );
}

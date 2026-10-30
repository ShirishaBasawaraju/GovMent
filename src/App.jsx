import React, { useMemo, useState } from "react";
import schemes from "./data/schemes.json";
import { enhanceSchemes } from "./lib/enhanceSchemes";
import { matchSchemes } from "./lib/matcher";

import ProfilePanel from "./components/ProfilePanel";
import ResultsPanel from "./components/ResultsPanel";
import BabuBot from "./components/BabuBot";
import ThemeToggle from "./components/ThemeToggle";
import DocumentsModule from "./components/DocumentsModule";
import PostOfficeSchemes from "./components/PostOfficeSchemes";
import certificates from "./data/certificates.json";

import { motion, AnimatePresence } from "framer-motion";

// Normalize scheme records so components receive consistent fields.
const allSchemes = enhanceSchemes(schemes);

// Keep every valid scheme record available for browsing.
// Do not filter out records just because published is false.
const validSchemes = allSchemes.filter(
  (scheme) =>
    scheme &&
    typeof scheme === "object" &&
    (scheme.id || scheme.title || scheme.name)
);

const navigation = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "schemes", label: "Government Schemes", icon: "◈" },
  { id: "documents", label: "Documents Centre", icon: "▤" },
  { id: "postoffice", label: "Post Office Schemes", icon: "₹" },
];

const initialProfile = {
  age: "",
  occupation: "",
  income: "",
  state: "",
  location_type: "",
  category: "",
  education_level: "",
  employment_status: "",
  description: "",
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Personal information is empty by default.
  const [profile, setProfile] = useState(initialProfile);

  // Personalization starts only when requested.
  const [personalizationActive, setPersonalizationActive] =
    useState(false);

  const [showProfileForm, setShowProfileForm] = useState(false);

  // All valid schemes are available to browse.
  const allAvailableSchemes = useMemo(
    () => validSchemes,
    []
  );

  // Browse mode displays every available scheme without eligibility checks.
  const browseResults = useMemo(
    () =>
      allAvailableSchemes.map((scheme) => ({
        scheme,
        status: "browse",
        score: null,
        reasons: [],
        matched: [],
        failed: [],
        missing: [],
      })),
    [allAvailableSchemes]
  );

  // Personalized matching runs only after the user submits the profile.
  const personalizedResults = useMemo(() => {
    if (!personalizationActive) {
      return [];
    }

    return matchSchemes(profile, allAvailableSchemes)
      .filter(
        (result) =>
          result.status === "eligible" ||
          result.status === "needs_more_information"
      )
      .map((result) => ({
        ...result,
        matched: result.reasons || [],
        failed: result.failedCriteria || [],
        missing: result.missingInformation || [],
      }));
  }, [
    profile,
    allAvailableSchemes,
    personalizationActive,
  ]);

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    if (page !== "schemes") {
      setShowProfileForm(false);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openPersonalization = () => {
    setShowProfileForm(true);
    setActivePage("schemes");
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitProfile = (event) => {
    event.preventDefault();

    const age =
      profile.age === "" ? null : Number(profile.age);

    const income =
      profile.income === "" ? null : Number(profile.income);

    if (
      age !== null &&
      (!Number.isFinite(age) || age < 0 || age > 120)
    ) {
      window.alert(
        "Please enter a valid age between 0 and 120."
      );
      return;
    }

    if (
      income !== null &&
      (!Number.isFinite(income) || income < 0)
    ) {
      window.alert(
        "Please enter a valid, non-negative income."
      );
      return;
    }

    setPersonalizationActive(true);
    setShowProfileForm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearPersonalization = () => {
    setProfile(initialProfile);
    setPersonalizationActive(false);
    setShowProfileForm(false);
  };

  const pageTitles = {
    home: "Your Dashboard",
    schemes: "Government Schemes",
    documents: "Government Documents Centre",
    postoffice: "Post Office Savings Schemes",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("home")}
            aria-label="GovMent home"
            className="group flex items-center gap-3 text-left"
          >
            {/* Animated logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -2, 0],
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: {
                  duration: 0.5,
                  ease: "easeOut",
                },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={{ scale: 1.04 }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-xl font-extrabold text-white shadow-md shadow-blue-900/15"
            >
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-8 w-5 rotate-[20deg] bg-white/20 blur-sm"
                animate={{ x: [0, 65] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut",
                }}
              />

              <span className="relative z-10">G</span>
            </motion.div>

            <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.55,
                  ease: "easeOut",
                  delay: 0.1,
                }}
                className="text-xl font-extrabold tracking-tight sm:text-2xl"
              >
                <span className="text-slate-900 dark:text-white">
                  Gov
                </span>

                <span className="text-blue-700 dark:text-blue-400">
                  Ment
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                }}
                className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400 sm:text-xs"
              >
                Your personal government assistant
              </motion.p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold md:hidden dark:border-slate-700"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* SIDEBAR */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } fixed bottom-0 left-0 top-[73px] z-30 w-72 overflow-y-auto border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:sticky md:top-[73px] md:block md:h-[calc(100vh-73px)] md:shrink-0`}
        >
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg dark:bg-white/10">
                    {item.icon}
                  </span>

                  {item.label}

                  {isActive && (
                    <span className="ml-auto text-lg">
                      ›
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-5 text-white">
            <p className="text-sm font-bold">
              Need some help?
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-100">
              Ask Babu Bot for help understanding schemes and
              government services.
            </p>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Browse without a profile. Personalized eligibility
            guidance is optional. Always verify official requirements.
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                GovMent / {pageTitles[activePage]}
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {pageTitles[activePage]}
              </h2>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              No account required
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* HOME PAGE */}
            {activePage === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-7"
              >
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-7 text-white sm:p-10">
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                      YOUR WELFARE COMPANION
                    </span>

                    <h3 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                      Government services,
                      <br />
                      made simpler.
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                      Discover government schemes, explore important
                      documents, and learn about Post Office savings
                      options — all in one place. No personal profile
                      is needed to get started.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("schemes")}
                        className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-50"
                      >
                        Browse schemes →
                      </button>

                      <button
                        type="button"
                        onClick={openPersonalization}
                        className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                      >
                        Find schemes for me
                      </button>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />

                  <div className="pointer-events-none absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-white/5" />
                </section>

                {/* DASHBOARD STATISTICS */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Available scheme records",
                      value: allAvailableSchemes.length,
                      detail: "All scheme records in the catalogue",
                      icon: "◈",
                    },
                    {
                      label: "Personal profile",
                      value: personalizationActive
                        ? "Active"
                        : "Optional",
                      detail: personalizationActive
                        ? "Personalized results enabled"
                        : "Browse without sharing details",
                      icon: "◎",
                    },
                    {
                      label: "Additional services",
                      value: "2",
                      detail: "Documents and savings",
                      icon: "▤",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {stat.label}
                        </p>

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold dark:bg-slate-800">
                          {stat.icon}
                        </span>
                      </div>

                      <p className="mt-4 text-3xl font-extrabold">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {stat.detail}
                      </p>
                    </div>
                  ))}
                </section>

                {/* SERVICE CARDS */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">
                      Explore services
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Choose a service to get started.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[
                      {
                        id: "schemes",
                        number: "01",
                        title: "Government Schemes",
                        description:
                          "Browse available scheme records or request optional personalized recommendations.",
                        icon: "◈",
                        accent: "from-blue-500 to-indigo-600",
                        action: "Explore schemes",
                      },
                      {
                        id: "documents",
                        number: "02",
                        title: "Documents Centre",
                        description:
                          "Explore common documents and find information about certificate requirements.",
                        icon: "▤",
                        accent: "from-violet-500 to-purple-600",
                        action: "Explore documents",
                      },
                      {
                        id: "postoffice",
                        number: "03",
                        title: "Post Office Schemes",
                        description:
                          "Explore savings accounts, deposits, and long-term savings products.",
                        icon: "₹",
                        accent: "from-emerald-500 to-teal-600",
                        action: "Explore savings",
                      },
                    ].map((card) => (
                      <motion.button
                        key={card.id}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate(card.id)}
                        className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-xl font-bold text-white shadow-lg`}
                          >
                            {card.icon}
                          </span>

                          <span className="text-sm font-semibold text-slate-400">
                            {card.number}
                          </span>
                        </div>

                        <h4 className="mt-5 text-lg font-bold">
                          {card.title}
                        </h4>

                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {card.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400">
                          {card.action}
                          <span className="transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <h3 className="font-bold">
                    How GovMent helps
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="font-semibold">
                        01. Discover
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Browse the complete scheme catalogue without
                        creating a profile.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">
                        02. Understand
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Review benefits, eligibility information,
                        documents, and application instructions.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">
                        03. Personalize
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Optionally provide details to identify schemes
                        that may match your circumstances.
                      </p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* GOVERNMENT SCHEMES PAGE */}
            {activePage === "schemes" && (
              <motion.div
                key="schemes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-900 dark:from-blue-950/50 dark:to-indigo-950/50 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-bold">
                        {personalizationActive
                          ? "Personalized scheme recommendations"
                          : "Explore government schemes"}
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {personalizationActive
                          ? "These results are based on the details you chose to provide. Eligibility is preliminary and should be verified with the official scheme provider."
                          : "Browse available scheme records, benefits, documents, and application details. You do not need to provide personal information."}
                      </p>
                    </div>

                    {!personalizationActive &&
                      !showProfileForm && (
                        <button
                          type="button"
                          onClick={() => setShowProfileForm(true)}
                          className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          Find Schemes for Me
                        </button>
                      )}

                    {personalizationActive && (
                      <button
                        type="button"
                        onClick={clearPersonalization}
                        className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Clear personalization
                      </button>
                    )}
                  </div>
                </section>

                {/* OPTIONAL PROFILE FORM */}
                <AnimatePresence>
                  {showProfileForm && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form
                        onSubmit={submitProfile}
                        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                      >
                        <div>
                          <h3 className="text-xl font-bold">
                            Find schemes for your circumstances
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Fill in only the information you want
                            to provide. You can leave fields blank
                            when you do not know the answer or
                            prefer not to share it.
                          </p>
                        </div>

                        <ProfilePanel
                          profile={profile}
                          setProfile={setProfile}
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                          >
                            Find Matching Schemes
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowProfileForm(false)}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* SCHEME RESULTS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">
                        {personalizationActive
                          ? "Your Potential Matches"
                          : "Government Scheme Catalogue"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {personalizationActive
                          ? "Review the matching criteria and any information still needed."
                          : "Browse all available scheme records. Check the scheme's official source for current status and eligibility."}
                      </p>
                    </div>

                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {personalizationActive
                        ? personalizedResults.length
                        : browseResults.length}{" "}
                      schemes
                    </span>
                  </div>

                  {personalizationActive ? (
                    personalizedResults.length > 0 ? (
                      <ResultsPanel
                        results={personalizedResults}
                        profile={profile}
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                        <h4 className="font-semibold">
                          No potential matches found
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          Try updating the details you provided,
                          or clear personalization to browse the
                          complete scheme catalogue.
                        </p>

                        <button
                          type="button"
                          onClick={clearPersonalization}
                          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Browse All Schemes
                        </button>
                      </div>
                    )
                  ) : browseResults.length > 0 ? (
                    <ResultsPanel
                      results={browseResults}
                      profile={{}}
                      browseMode
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                      <h4 className="font-semibold">
                        No scheme records are available
                      </h4>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Add valid scheme objects to
                        src/data/schemes.json to populate the catalogue.
                      </p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* DOCUMENTS CENTRE PAGE */}
            {activePage === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
              >
                <DocumentsModule schemes={allAvailableSchemes} />
              </motion.div>
            )}

            {/* POST OFFICE SCHEMES PAGE */}
            {activePage === "postoffice" && (
              <motion.div
                key="postoffice"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
              >
                <PostOfficeSchemes />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          <footer className="mt-10 border-t border-slate-200 py-6 dark:border-slate-800">
            <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              GovMent — Smart Government Scheme Assistant
            </p>

            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Making welfare information easier to discover and understand.
            </p>
          </footer>
        </main>
      </div>

      {/* BABU BOT */}
      <BabuBot
        profile={personalizationActive ? profile : {}}
        setProfile={setProfile}
        allSchemesProp={allAvailableSchemes}
      />
    </div>
  );
}
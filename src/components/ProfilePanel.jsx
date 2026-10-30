import React from "react";

const states = [
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
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

const occupations = [
  { value: "student", label: "Student" },
  { value: "farmer", label: "Farmer" },
  { value: "employee", label: "Employee" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "business", label: "Business owner" },
  { value: "homemaker", label: "Homemaker" },
  { value: "other", label: "Other" },
];

const categories = [
  { value: "SC", label: "SC — Scheduled Caste" },
  { value: "ST", label: "ST — Scheduled Tribe" },
  { value: "OBC", label: "OBC — Other Backward Classes" },
  { value: "GENERAL", label: "General" },
  { value: "OTHER", label: "Other category" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900";

export default function ProfilePanel({ profile, setProfile }) {
  const updateProfile = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const age = profile.age ?? "";
  const income = profile.income ?? "";

  const ageError =
    age !== "" &&
    (!Number.isFinite(Number(age)) ||
      Number(age) < 0 ||
      Number(age) > 120);

  const incomeError =
    income !== "" &&
    (!Number.isFinite(Number(income)) || Number(income) < 0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950">
          👤
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Your Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter the information you want GovMent to use when finding
          potentially relevant government schemes.
        </p>
      </div>

      <div className="space-y-5">
        {/* Age */}
        <div>
          <label
            htmlFor="profile-age"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Age
          </label>

          <div className="flex items-center gap-3">
            <input
              id="profile-age"
              type="number"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => {
                const value = event.target.value;
                updateProfile("age", value === "" ? "" : Number(value));
              }}
              className={inputClass}
              placeholder="Enter your age"
              aria-invalid={ageError}
            />

            <span className="text-sm text-gray-500">years</span>
          </div>

          {ageError && (
            <p className="mt-1 text-sm text-red-600">
              Enter an age between 0 and 120.
            </p>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label
            htmlFor="profile-occupation"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Occupation
          </label>

          <select
            id="profile-occupation"
            value={profile.occupation || ""}
            onChange={(event) =>
              updateProfile("occupation", event.target.value)
            }
            className={inputClass}
          >
            <option value="">Select occupation</option>

            {occupations.map((occupation) => (
              <option key={occupation.value} value={occupation.value}>
                {occupation.label}
              </option>
            ))}
          </select>
        </div>

        {/* Annual household income */}
        <div>
          <label
            htmlFor="profile-income"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Annual Household Income
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              ₹
            </span>

            <input
              id="profile-income"
              type="number"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => {
                const value = event.target.value;
                updateProfile(
                  "income",
                  value === "" ? "" : Number(value)
                );
              }}
              className={`${inputClass} pl-9`}
              placeholder="Enter annual household income"
              aria-invalid={incomeError}
            />
          </div>

          {incomeError && (
            <p className="mt-1 text-sm text-red-600">
              Income cannot be negative.
            </p>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter your approximate total household income for one year.
            Different schemes may define income differently.
          </p>
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="profile-state"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            State / Union Territory
          </label>

          <select
            id="profile-state"
            value={profile.state || ""}
            onChange={(event) => updateProfile("state", event.target.value)}
            className={inputClass}
          >
            <option value="">Select your state or UT</option>

            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Residential area */}
        <div>
          <label
            htmlFor="profile-location"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Residential Area
          </label>

          <select
            id="profile-location"
            value={profile.location_type || ""}
            onChange={(event) =>
              updateProfile("location_type", event.target.value)
            }
            className={inputClass}
          >
            <option value="">Select residential area</option>
            <option value="rural">Rural</option>
            <option value="urban">Urban</option>
          </select>
        </div>

        {/* Caste and community */}
        <div>
          <label
            htmlFor="profile-category"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Caste / Community Category
            <span className="ml-2 font-normal text-gray-500">
              (Optional)
            </span>
          </label>

          <select
            id="profile-category"
            value={profile.category || ""}
            onChange={(event) =>
              updateProfile("category", event.target.value)
            }
            className={inputClass}
          >
            <option value="">Not provided</option>

            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Some schemes have category-specific eligibility rules.
            This information is optional. GovMent must not infer your
            category or treat a missing answer as a match.
          </p>

          {profile.category === "OBC" && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              OBC eligibility can depend on the applicable central or
              state list and, where required, non-creamy-layer status.
              Scheme-specific rules and documents must be checked.
            </div>
          )}
        </div>

        {/* Education */}
        <div>
          <label
            htmlFor="profile-education"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Education Level
            <span className="ml-2 font-normal text-gray-500">
              (Optional)
            </span>
          </label>

          <select
            id="profile-education"
            value={profile.education_level || ""}
            onChange={(event) =>
              updateProfile("education_level", event.target.value)
            }
            className={inputClass}
          >
            <option value="">Not provided</option>
            <option value="school">School</option>
            <option value="intermediate">Intermediate / 10+2</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
            <option value="vocational">Vocational / Skill Training</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Employment status */}
        <div>
          <label
            htmlFor="profile-employment"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Employment Status
            <span className="ml-2 font-normal text-gray-500">
              (Optional)
            </span>
          </label>

          <select
            id="profile-employment"
            value={profile.employment_status || ""}
            onChange={(event) =>
              updateProfile("employment_status", event.target.value)
            }
            className={inputClass}
          >
            <option value="">Not provided</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="self-employed">Self-employed</option>
            <option value="student">Student</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Interests and needs */}
        <div>
          <label
            htmlFor="profile-description"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            What are you looking for?
          </label>

          <textarea
            id="profile-description"
            value={profile.description || ""}
            onChange={(event) =>
              updateProfile("description", event.target.value)
            }
            placeholder="Example: I am a student looking for scholarships, education assistance, and skill development schemes."
            rows={4}
            className={`${inputClass} resize-y`}
          />

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Describe your needs to help GovMent rank relevant schemes.
          </p>
        </div>

        {/* Privacy and eligibility note */}
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/40">
          <p className="text-xs leading-5 text-blue-800 dark:text-blue-200">
            <strong>Privacy and eligibility:</strong> Only provide
            information you are comfortable sharing. GovMent provides
            preliminary guidance, not an official eligibility decision.
            Check each scheme's official rules before applying.
          </p>
        </div>
      </div>
    </section>
  );
}
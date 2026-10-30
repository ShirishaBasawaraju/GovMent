
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useGemini } from "../ai/useGemini";
import { matchSchemes, computeScore } from "../lib/matcher";
import { explainSchemeMatch } from "../ai/reasoner";
import schemesData from "../data/schemes.json";

// Parse profile updates returned by Gemini.
function applyAIPatchToProfile(profile, aiText) {
  if (!aiText || !aiText.includes("PROFILE_UPDATE:")) {
    return null;
  }

  const lines = aiText.split("\n");
  const start = lines.findIndex((line) =>
    line.trim().startsWith("PROFILE_UPDATE:")
  );

  if (start === -1) {
    return null;
  }

  const updates = {};

  const allowedFields = [
    "age",
    "occupation",
    "state",
    "income",
    "description",
  ];

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    const separator = line.indexOf(":");

    if (separator === -1) continue;

    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (!allowedFields.includes(field) || !value) {
      continue;
    }

    if (field === "age" || field === "income") {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue) || numberValue < 0) {
        continue;
      }

      updates[field] = numberValue;
    } else {
      updates[field] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return null;
  }

  return {
    ...profile,
    ...updates,
  };
}

// Find a scheme name mentioned by the user.
function extractSchemeName(text) {
  if (!text) return "";

  const quoted = text.match(/"([^"]+)"/);

  if (quoted) {
    return quoted[1].toLowerCase().trim();
  }

  const cleaned = text
    .replace(/[?.,!]/g, " ")
    .toLowerCase()
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const forIndex = tokens.indexOf("for");

  if (forIndex >= 0 && tokens.length > forIndex + 1) {
    return tokens.slice(forIndex + 1).join(" ");
  }

  const schemeIndex = tokens.indexOf("scheme");

  if (schemeIndex >= 0 && tokens.length > schemeIndex + 1) {
    return tokens.slice(schemeIndex + 1).join(" ");
  }

  return "";
}

export default function BabuBot({
  profile,
  setProfile,
  allSchemesProp,
}) {
  const { send, loading } = useGemini();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Namaste! Main Babu Bot hoon. Poochiye, main aapki kaise sahayata kar sakta hoon?",
    },
  ]);

  const allSchemes = Array.isArray(allSchemesProp)
    ? allSchemesProp
    : schemesData;

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight;
    }
  }, [messages, open]);

  function addBotMessage(content) {
    setMessages((previous) => [
      ...previous,
      { role: "model", content },
    ]);
  }

  function addUserMessage(content) {
    setMessages((previous) => [
      ...previous,
      { role: "user", content },
    ]);
  }

  // Handle scheme questions locally when possible.
  async function handleLocalIntent(text) {
    const lower = text.toLowerCase();

    // Recommend schemes using the current profile.
    if (
      lower.includes("suggest") ||
      lower.includes("recommend") ||
      lower.includes("what can i get")
    ) {
      const matched = matchSchemes(profile || {}, allSchemes);

      if (!matched || matched.length === 0) {
        addBotMessage(
          "I couldn't find matching schemes for your current profile. " +
            "Try updating your profile or asking about a particular scheme."
        );

        return true;
      }

      const reply = matched
        .slice(0, 3)
        .map(
          (item) =>
            `- **${item.scheme.title}** — ${
              item.scheme.benefit || "Benefit details are not available."
            }`
        )
        .join("\n");

      addBotMessage(
        `Here are some possible matches:\n\n${reply}\n\n` +
          "These are preliminary matches. Please verify the current eligibility rules."
      );

      return true;
    }

    // Explain a scheme or check its eligibility against the profile.
    if (
      lower.includes("why") ||
      lower.includes("explain") ||
      lower.includes("eligible")
    ) {
      const schemeName = extractSchemeName(text);

      if (!schemeName) {
        const matched = matchSchemes(profile || {}, allSchemes)?.[0];

        if (!matched) {
          addBotMessage(
            "I couldn't find a matching scheme. Try asking me to suggest schemes."
          );

          return true;
        }

        const explanation = explainSchemeMatch(
          profile || {},
          matched.scheme,
          matched.score,
          matched.reasons || []
        );

        addBotMessage(explanation);
        return true;
      }

      const scheme = allSchemes.find(
        (item) =>
          item.title?.toLowerCase().includes(schemeName) ||
          item.id?.toLowerCase().includes(schemeName)
      );

      if (!scheme) {
        // Let Gemini try if the scheme is not in the local database.
        return false;
      }

      const score = computeScore(profile || {}, scheme);

      const explanation = explainSchemeMatch(
        profile || {},
        scheme,
        score,
        scheme.reasons || []
      );

      addBotMessage(explanation);
      return true;
    }

    // Let Gemini handle profile changes and general questions.
    return false;
  }

  async function handleSubmit(event) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || loading) {
      return;
    }

    // Add the user's question and clear the input.
    addUserMessage(text);
    setInput("");

    try {
      const handledLocally = await handleLocalIntent(text);

      if (handledLocally) {
        return;
      }

      // Use a unique ID so only this request's thinking message is removed.
      const thinkingId =
        `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setMessages((previous) => [
        ...previous,
        {
          role: "model",
          content: "Babu Bot is thinking...",
          id: thinkingId,
        },
      ]);

      const history = [
        ...messages,
        { role: "user", content: text },
      ];

      const options = {
        profile: profile || {},
        allSchemes,
        history,
        maxSchemes: 10,
        maxOutputTokens: 700,
        temperature: 0.4,
        retries: 1,
      };

      let response;

      try {
        response = await send(text, options);
      } finally {
        // Always remove the thinking message for this request.
        setMessages((previous) =>
          previous.filter((message) => message.id !== thinkingId)
        );
      }

      if (!response || !response.ok) {
        addBotMessage(
          "Sorry, Babu Bot couldn't get a response. " +
            (response?.text || "Please try again.")
        );

        return;
      }

      const botText = (response.text || "").trim();

      if (!botText) {
        addBotMessage(
          "I didn't receive an answer. Please try asking again."
        );

        return;
      }

      // Display Gemini's answer.
      addBotMessage(botText);

      // Apply profile changes only if Gemini returned valid update fields.
      const patched = applyAIPatchToProfile(
        profile || {},
        botText
      );

      if (patched && typeof setProfile === "function") {
        setProfile(patched);
        addBotMessage("Your profile has been updated successfully.");
      }
    } catch (error) {
      console.error("Babu Bot error:", error);

      addBotMessage(
        "Babu Bot encountered an error. Please try again. " +
          (error?.message || "")
      );
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center rounded-full bg-indigo-600 px-6 py-4 text-white shadow-lg transition-colors duration-300 hover:bg-indigo-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>

          Ask Babu Bot
        </button>
      )}

      {open && (
        <div className="flex h-[600px] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Babu Bot
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aapka digital sahayak. Sawal poocho!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Babu Bot"
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            ref={containerRef}
            className="flex-1 space-y-4 overflow-y-auto bg-gray-100 p-4 dark:bg-gray-900"
          >
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.role === "model"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`prose prose-sm max-w-[85%] rounded-2xl px-4 py-2 dark:prose-invert ${
                    message.role === "model"
                      ? "bg-white shadow-sm dark:bg-gray-700"
                      : "bg-indigo-500 text-white"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={loading}
                placeholder="Apna sawaal yahan likhein..."
                aria-label="Type your question"
                className="min-w-0 flex-1 rounded-full border border-gray-300 p-3 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 4v-4c3.042 0 5.824 1.135 7.938 3l-2.647-3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

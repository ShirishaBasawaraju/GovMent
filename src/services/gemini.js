
const MODEL = "gemini-3.8-flash";
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 2;

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY?.trim() || "";
}

function getSchemeContext(schemes, maxItems = 40) {
  if (!Array.isArray(schemes)) return "[]";

  return JSON.stringify(
    schemes.slice(0, maxItems).map((scheme) => ({
      id: scheme.id,
      title: scheme.title,
      description: scheme.description,
      benefit: scheme.benefit,
      eligibility: scheme.eligibility,
      keywords: scheme.keywords,
    }))
  );
}

function normalizeHistory(history = []) {
  const result = [];

  for (const message of history) {
    if (!message?.content) continue;

    const role =
      message.role === "assistant" || message.role === "model"
        ? "model"
        : message.role === "user"
          ? "user"
          : null;

    if (!role) continue;

    const content = String(message.content);
    const last = result[result.length - 1];

    if (last && last.role === role) {
      last.parts[0].text += "\n" + content;
    } else {
      result.push({
        role,
        parts: [{ text: content }],
      });
    }
  }

  while (result.length && result[0].role !== "user") {
    result.shift();
  }

  return result;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(userPrompt, options = {}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      ok: false,
      text:
        "Gemini API key is missing. Check the .env file beside package.json, then restart Vite.",
    };
  }

  const prompt = String(userPrompt || "").trim();

  if (!prompt) {
    return {
      ok: false,
      text: "Please type a question first.",
    };
  }

  const profile = options.profile || {};
  const schemes = getSchemeContext(
    options.allSchemes,
    options.maxSchemes || 40
  );

  const systemInstruction = `
You are Babu Bot, the friendly digital assistant for GovMent,
a website that helps people in India discover government welfare schemes.

COMMUNICATION:
- Use simple English and natural Hinglish.
- Be friendly, respectful, concise, and helpful.
- Answer questions about schemes, eligibility, benefits, documents,
  applications, education, and student opportunities.
- Do not claim eligibility unless the available information supports it.
- Explain when official verification is necessary.
- Do not invent scheme names, benefits, deadlines, or official links.
- Use the supplied scheme database when discussing schemes.
- If a scheme is absent from the database, say so clearly.
- For internship questions, provide general career guidance.

CURRENT USER PROFILE:
${JSON.stringify(profile)}

SCHEME DATABASE:
${schemes}

PROFILE UPDATES:
When the user explicitly asks to change their profile, answer normally
and include a PROFILE_UPDATE block at the end.

Example:
PROFILE_UPDATE:
age: 22
occupation: student
state: Telangana
income: 0

Include only fields the user asked to change.
Use numeric values for age and income.
Allowed fields: age, occupation, state, income, description.
Never update the profile for a general question.
Do not put the update block inside markdown code fences.
`.trim();

  const history = normalizeHistory(options.history || []);
  const lastMessage = history[history.length - 1];

  if (
    !lastMessage ||
    lastMessage.role !== "user" ||
    lastMessage.parts[0].text !== prompt
  ) {
    history.push({
      role: "user",
      parts: [{ text: prompt }],
    });
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  // Retry only temporary server errors.
  const maxRetries = Math.max(
    0,
    Math.min(options.retries ?? MAX_RETRIES, 2)
  );

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: history,
          generationConfig: {
            temperature: options.temperature ?? 0.4,
            maxOutputTokens: options.maxOutputTokens ?? 700,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiMessage =
          data?.error?.message ||
          `Request failed with status ${response.status}`;

        const temporaryServerError = [500, 502, 503, 504].includes(
          response.status
        );

        if (temporaryServerError && attempt < maxRetries) {
          console.warn(
            `Gemini server error ${response.status}. Retrying request...`
          );

          await wait(1000 * Math.pow(2, attempt));
          continue;
        }

        if (response.status === 400) {
          return {
            ok: false,
            text: `Gemini rejected the request: ${apiMessage}`,
          };
        }

        if (response.status === 401 || response.status === 403) {
          return {
            ok: false,
            text:
              `Gemini API access was denied: ${apiMessage}. ` +
              "Check your API key and permissions.",
          };
        }

        if (response.status === 404) {
          return {
            ok: false,
            text:
              `Gemini model or endpoint not found: ${apiMessage}. ` +
              `Configured model: ${MODEL}.`,
          };
        }

        if (response.status === 429) {
          return {
            ok: false,
            text:
              "Gemini API quota or rate limit reached. " +
              "Check your Google AI Studio quota and try again later.",
          };
        }

        return {
          ok: false,
          text:
            `Gemini request failed (${response.status}): ${apiMessage}` +
            (temporaryServerError
              ? " Please try again later."
              : ""),
        };
      }

      const answer = (
        data?.candidates?.[0]?.content?.parts || []
      )
        .map((part) => part.text || "")
        .join("\n")
        .trim();

      if (!answer) {
        const reason = data?.promptFeedback?.blockReason;

        return {
          ok: false,
          text: reason
            ? `Gemini could not answer this request. Reason: ${reason}.`
            : "Gemini returned an empty response. Please try again.",
        };
      }

      return {
        ok: true,
        text: answer,
      };
    } catch (error) {
      console.error("Babu Bot network error:", error);

      if (error?.name === "AbortError") {
        return {
          ok: false,
          text:
            "The Gemini request timed out after 30 seconds. " +
            "Please try again.",
        };
      }

      return {
        ok: false,
        text:
          "Could not connect to Gemini. Check your internet connection and try again.",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    ok: false,
    text: "Gemini could not complete the request. Please try again.",
  };
}

export async function listGeminiModels() {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      ok: false,
      text: "Gemini API key is missing.",
    };
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          "x-goog-api-key": apiKey,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        text:
          data?.error?.message ||
          `Could not list Gemini models. Status: ${response.status}`,
      };
    }

    return {
      ok: true,
      models: data.models || [],
    };
  } catch (error) {
    console.error("Gemini model-list error:", error);

    return {
      ok: false,
      text:
        error?.name === "AbortError"
          ? "Checking Gemini models timed out."
          : "Could not connect to the Gemini API.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}


import { useState, useRef } from "react";
import { callGemini } from "../services/gemini";

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const requestInProgress = useRef(false);

  async function send(prompt, options = {}) {
    // Prevent multiple simultaneous requests.
    if (requestInProgress.current) {
      return {
        ok: false,
        text: "Please wait for the current response to finish.",
      };
    }

    requestInProgress.current = true;
    setLoading(true);

    try {
      const response = await callGemini(prompt, options);

      if (!response || typeof response.ok !== "boolean") {
        return {
          ok: false,
          text: "Babu Bot received an invalid response. Please try again.",
        };
      }

      return response;
    } catch (error) {
      console.error("Babu Bot send error:", error);

      return {
        ok: false,
        text:
          error?.name === "AbortError"
            ? "The request took too long. Please try again."
            : "Something went wrong while contacting Gemini. Please try again.",
      };
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  return { send, loading };
}

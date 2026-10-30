import React, { useState } from "react";
import { parseNaturalInput } from "../ai/nl_processor";

export default function AIQueryBox({ setProfile }) {
  const [input, setInput] = useState("");

  function handleProcess() {
    const p = parseNaturalInput(input);
    setProfile(p);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Babu Bot</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Aapka apna digital assistant. Poochhiye kuch bhi!</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tell me your situation</label>
        <textarea
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. I am a 22-year-old student from Karnataka"
          rows={3}
        />
      </div>
      <button
        onClick={handleProcess}
        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Process with AI
      </button>
    </div>
  );
}
"use client";

import { useState } from "react";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("https://enterprise-ai-business-automation.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setResponse(data.response);
    } catch (error) {
      console.error(error);
      setResponse("AI से connect नहीं हो पाया। Backend check करें.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-black text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-500 font-semibold tracking-wider">
            AI ASSISTANT
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-3">
            Talk to Our AI
          </h2>

          <p className="text-gray-400 mt-4">
            Ask anything and get an AI-powered response.
          </p>
        </div>

        <div className="border border-gray-800 rounded-2xl p-5 bg-gray-950">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="w-full min-h-[140px] bg-black border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="mt-4 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
          >
            {loading ? "Thinking..." : "Send Message →"}
          </button>

          {response && (
            <div className="mt-6 p-5 rounded-xl bg-gray-900 border border-gray-800">
              <p className="text-sm text-blue-400 mb-2">
                AI Response
              </p>

              <p className="text-gray-200 whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
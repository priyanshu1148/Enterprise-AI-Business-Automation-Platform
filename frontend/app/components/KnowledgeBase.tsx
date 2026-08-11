"use client";

import { useState } from "react";

export default function KnowledgeBase() {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const addDocument = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(
        "https://enterprise-ai-business-automation.onrender.com/add-document",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content,
            metadata: {
              source: source || "website",
              category: "knowledge-base",
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Document upload failed");
      }

      setStatus(
        `✅ Document added successfully. ID: ${data.document_id}`
      );
      setContent("");
      setSource("");
    } catch (error) {
      console.error("Add document error:", error);
      setStatus("❌ Document add नहीं हो पाया। Backend check करें.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-blue-500 font-semibold">
            KNOWLEDGE BASE
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-3">
            Add AI Knowledge
          </h2>

          <p className="text-gray-400 mt-4">
            Add documents that your AI can use to answer questions.
          </p>
        </div>

        <div className="border border-gray-800 rounded-2xl p-6 bg-gray-950">
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source name (optional)"
            className="w-full mb-4 bg-black border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge or document content..."
            className="w-full min-h-[220px] bg-black border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={addDocument}
            disabled={loading || !content.trim()}
            className="mt-4 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
          >
            {loading ? "Adding..." : "Add to Knowledge Base →"}
          </button>

          {status && (
            <div className="mt-5 p-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-200">
              {status}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}



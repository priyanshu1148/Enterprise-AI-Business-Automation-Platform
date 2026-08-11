"use client";

import { useEffect, useState } from "react";

type Document = {
  id: number;
  content: string;
  metadata: {
    source?: string;
    category?: string;
  };
};

const API_BASE =
  "https://enterprise-ai-business-automation.onrender.com";

export default function KnowledgeBase() {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDocuments = async () => {
    setDocumentsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/documents`);
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Failed to load documents");
      }

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Load documents error:", error);
      setStatus("❌ Documents load नहीं हो पाए।");
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const addDocument = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/add-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          metadata: {
            source: source || "website",
            category: "knowledge-base",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Document upload failed");
      }

      setStatus(
        `✅ Document added successfully. ID: ${data.document_id}`
      );

      setContent("");
      setSource("");

      await loadDocuments();
    } catch (error) {
      console.error("Add document error:", error);
      setStatus("❌ Document add नहीं हो पाया। Backend check करें.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: number) => {
    const confirmed = window.confirm(
      `Delete document #${documentId}?`
    );

    if (!confirmed) return;

    setDeletingId(documentId);
    setStatus("");

    try {
      const res = await fetch(
        `${API_BASE}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Document delete failed");
      }

      setStatus(
        `✅ Document #${documentId} deleted successfully.`
      );

      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );
    } catch (error) {
      console.error("Delete document error:", error);
      setStatus("❌ Document delete नहीं हो पाया।");
    } finally {
      setDeletingId(null);
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
            Manage AI Knowledge
          </h2>

          <p className="text-gray-400 mt-4">
            Add and manage documents that your AI can use.
          </p>
        </div>

        {/* Add Document */}

        <div className="border border-gray-800 rounded-2xl p-6 bg-gray-950">
          <h3 className="text-xl font-semibold mb-5">
            Add New Document
          </h3>

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
            {loading
              ? "Adding..."
              : "Add to Knowledge Base →"}
          </button>

          {status && (
            <div className="mt-5 p-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-200">
              {status}
            </div>
          )}
        </div>

        {/* Existing Documents */}

        <div className="mt-8 border border-gray-800 rounded-2xl p-6 bg-gray-950">

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold">
              Existing Documents
            </h3>

            <button
              type="button"
              onClick={loadDocuments}
              disabled={documentsLoading}
              className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 text-sm font-semibold disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>

          {documentsLoading ? (
            <p className="text-gray-400">
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <p className="text-gray-400">
              No documents found.
            </p>
          ) : (
            <div className="space-y-4">

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-800 rounded-xl p-5 bg-black"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-blue-400 font-semibold">
                        Document #{doc.id}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {doc.metadata?.source || "Unknown source"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteDocument(doc.id)}
                      disabled={deletingId === doc.id}
                      className="shrink-0 px-4 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 disabled:opacity-50 text-sm font-semibold"
                    >
                      {deletingId === doc.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                  <p className="mt-4 text-gray-300 whitespace-pre-wrap">
                    {doc.content}
                  </p>

                  <p className="mt-3 text-xs text-gray-600">
                    Category:{" "}
                    {doc.metadata?.category || "knowledge-base"}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
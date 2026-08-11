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

type SearchResult = Document & {
  distance: number;
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");

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

  const startEditing = (doc: Document) => {
    setEditingId(doc.id);
    setEditContent(doc.content);
    setEditSource(doc.metadata?.source || "");
    setStatus("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditSource("");
  };

  const updateDocument = async (documentId: number) => {
    if (!editContent.trim()) return;

    setEditLoading(true);
    setStatus("");

    try {
      const res = await fetch(
        `${API_BASE}/documents/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editContent,
            metadata: {
              source: editSource || "website",
              category: "knowledge-base",
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(
          data.message || "Document update failed"
        );
      }

      setStatus(
        `✅ Document #${documentId} updated successfully.`
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                content: editContent,
                metadata: {
                  source: editSource || "website",
                  category: "knowledge-base",
                },
              }
            : doc
        )
      );

      cancelEditing();
    } catch (error) {
      console.error("Update document error:", error);
      setStatus("❌ Document update नहीं हो पाया।");
    } finally {
      setEditLoading(false);
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
        throw new Error(
          data.message || "Document delete failed"
        );
      }

      setStatus(
        `✅ Document #${documentId} deleted successfully.`
      );

      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );

      setSearchResults((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );
    } catch (error) {
      console.error("Delete document error:", error);
      setStatus("❌ Document delete नहीं हो पाया।");
    } finally {
      setDeletingId(null);
    }
  };

  const searchKnowledge = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchStatus("");
    setSearchResults([]);

    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(
          data.message || "Search failed"
        );
      }

      setSearchResults(data.results || []);

      if (!data.results?.length) {
        setSearchStatus("No matching documents found.");
      }
    } catch (error) {
      console.error("Knowledge search error:", error);
      setSearchStatus(
        "❌ Search नहीं हो पाया। Backend check करें."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="text-center mb-10">
          <p className="text-blue-500 font-semibold">
            KNOWLEDGE BASE
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-3">
            Manage AI Knowledge
          </h2>

          <p className="text-gray-400 mt-4">
            Add, search, edit and manage documents that your AI can use.
          </p>
        </div>

        {/* Search */}

        <div className="border border-blue-900 rounded-2xl p-6 bg-gray-950 mb-8">

          <h3 className="text-xl font-semibold mb-4">
            🔎 Search Knowledge Base
          </h3>

          <div className="flex flex-col md:flex-row gap-3">

            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchKnowledge();
                }
              }}
              placeholder="Search your AI knowledge..."
              className="flex-1 bg-black border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={searchKnowledge}
              disabled={
                searchLoading || !searchQuery.trim()
              }
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
            >
              {searchLoading ? "Searching..." : "Search →"}
            </button>

          </div>

          {searchStatus && (
            <p className="mt-4 text-gray-400">
              {searchStatus}
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">

              <p className="text-sm text-blue-400">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} found
              </p>

              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-800 rounded-xl p-5 bg-black"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-blue-400 font-semibold">
                        Document #{result.id}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {result.metadata?.source ||
                          "Unknown source"}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500">
                      Distance:{" "}
                      {result.distance.toFixed(3)}
                    </span>

                  </div>

                  <p className="mt-4 text-gray-300 whitespace-pre-wrap">
                    {result.content}
                  </p>

                  <p className="mt-3 text-xs text-gray-600">
                    Category:{" "}
                    {result.metadata?.category ||
                      "knowledge-base"}
                  </p>

                </div>
              ))}

            </div>
          )}

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

                  {editingId === doc.id ? (
                    /* Edit Form */

                    <div>
                      <div className="flex items-center justify-between mb-4">

                        <p className="text-blue-400 font-semibold">
                          Edit Document #{doc.id}
                        </p>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={editLoading}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>

                      </div>

                      <input
                        value={editSource}
                        onChange={(e) =>
                          setEditSource(e.target.value)
                        }
                        placeholder="Source name"
                        className="w-full mb-4 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
                      />

                      <textarea
                        value={editContent}
                        onChange={(e) =>
                          setEditContent(e.target.value)
                        }
                        className="w-full min-h-[220px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
                      />

                      <div className="flex flex-wrap gap-3 mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            updateDocument(doc.id)
                          }
                          disabled={
                            editLoading ||
                            !editContent.trim()
                          }
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
                        >
                          {editLoading
                            ? "Saving..."
                            : "Save Changes →"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={editLoading}
                          className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-900 disabled:opacity-50 font-semibold"
                        >
                          Cancel
                        </button>

                      </div>
                    </div>

                  ) : (

                    /* Normal Document View */

                    <>
                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-blue-400 font-semibold">
                            Document #{doc.id}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {doc.metadata?.source ||
                              "Unknown source"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(doc)
                            }
                            disabled={deletingId === doc.id}
                            className="px-4 py-2 rounded-lg border border-blue-900 text-blue-400 hover:bg-blue-950 disabled:opacity-50 text-sm font-semibold"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteDocument(doc.id)
                            }
                            disabled={
                              deletingId === doc.id
                            }
                            className="px-4 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 disabled:opacity-50 text-sm font-semibold"
                          >
                            {deletingId === doc.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </div>

                      <p className="mt-4 text-gray-300 whitespace-pre-wrap">
                        {doc.content}
                      </p>

                      <p className="mt-3 text-xs text-gray-600">
                        Category:{" "}
                        {doc.metadata?.category ||
                          "knowledge-base"}
                      </p>
                    </>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
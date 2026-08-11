"use client";

import { useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};
type Source = {
  id: number;
  metadata: {
    source?: string;
    category?: string;
    file_type?: string;
  };
  distance: number;
};
const API_BASE =
  "https://enterprise-ai-business-automation.onrender.com";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
const [sources, setSources] = useState<Source[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    let id = localStorage.getItem("ai_session_id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ai_session_id", id);
    }

    setSessionId(id);

    try {
      const res = await fetch(
        `${API_BASE}/chat-history/${id}`
      );

      const data = await res.json();

      if (data.status === "success") {
        const history = data.messages.map((item: any) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.content,
        }));

        setMessages(history);

        const lastAssistant = [...history]
          .reverse()
          .find((item) => item.role === "assistant");

        if (lastAssistant) {
          setResponse(lastAssistant.content);
        }
      }
    } catch (error) {
      console.error("Chat history error:", error);
    }
  };

  const newChat = () => {
    window.speechSynthesis?.cancel();

    const newId = crypto.randomUUID();

    localStorage.setItem("ai_session_id", newId);

    setSessionId(newId);
    setMessages([]);
    setMessage("");
    setResponse("");
setSources([]);
    setLoading(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      setMessage(event.results[0][0].transcript);
    };

    recognition.onerror = (event: any) => {
      console.log("Voice input:", event.error);

      if (event.error === "no-speech") {
        setMessage("");
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const sendMessage = async () => {
    const query = message.trim();

    if (!query || !sessionId || loading) return;

    setLoading(true);
    setResponse("");

    const userMessage: Message = {
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/rag-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            session_id: sessionId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      const answer = data.answer || "No answer received.";
setSources(data.sources || []);

      setResponse(answer);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(answer);
        speech.lang = "en-IN";
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error("RAG Chat Error:", error);

      const errorMessage =
        "AI से connect नहीं हो पाया। Backend check करें.";

      setResponse(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <p className="text-blue-500 font-semibold">
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

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">
              Chat Session
            </p>

            <button
              type="button"
              onClick={newChat}
              className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-900 text-sm font-semibold"
            >
              + New Chat
            </button>
          </div>

          {messages.length > 0 && (
            <div className="mb-5 space-y-3 max-h-[420px] overflow-y-auto pr-2">

              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 border ${
                    item.role === "user"
                      ? "bg-blue-600/10 border-blue-500/30"
                      : "bg-gray-900 border-gray-800"
                  }`}
                >
                  <p className="text-xs text-blue-400 mb-1">
                    {item.role === "user"
                      ? "You"
                      : "AI Assistant"}
                  </p>

                  <p className="text-gray-200 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              ))}

            </div>
          )}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="w-full min-h-[140px] bg-black border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-blue-500"
          />

          <div className="flex flex-wrap gap-3 mt-4">

            <button
              type="button"
              onClick={startVoiceInput}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-900 disabled:opacity-50 font-semibold"
            >
              {listening
                ? "🎙️ Listening..."
                : "🎤 Speak"}
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !sessionId}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
            >
              {loading
                ? "Thinking..."
                : "Send Message →"}
            </button>

            <button
              type="button"
              onClick={() =>
                window.speechSynthesis?.cancel()
              }
              className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-900 font-semibold"
            >
              🔇 Stop Voice
            </button>

          </div>

          {response && (
            <div className="mt-6 p-5 rounded-xl bg-gray-900 border border-gray-800">
              <p className="text-sm text-blue-400 mb-2">
                Latest AI Response
              </p>

              <p className="text-gray-200 whitespace-pre-wrap">
                {response}
              </p>
{sources.length > 0 && (
  <div className="mt-5 pt-5 border-t border-gray-800">
    <p className="text-sm text-blue-400 mb-3">
      📚 Knowledge Sources
    </p>

    <div className="space-y-2">
      {sources.map((source) => (
        <div
          key={source.id}
          className="p-3 rounded-lg bg-black border border-gray-800"
        >
          <p className="text-sm text-gray-200">
            📄 {source.metadata?.source || `Document #${source.id}`}
          </p>

          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span>
              Document #{source.id}
            </span>

            {source.metadata?.file_type && (
              <span>
                {source.metadata.file_type}
              </span>
            )}

            <span>
              Distance: {source.distance.toFixed(3)}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
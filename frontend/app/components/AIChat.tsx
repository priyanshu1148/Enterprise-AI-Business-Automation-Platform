"use client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

import { useEffect, useState } from "react";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
  const loadChatHistory = async () => {
    let id = localStorage.getItem("ai_session_id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ai_session_id", id);
    }

    setSessionId(id);

    try {
      const res = await fetch(
        `https://enterprise-ai-business-automation.onrender.com/chat-history/${id}`
      );

      const data = await res.json();

      if (data.status === "success") {
        setMessages(
          data.messages.map((item: any) => ({
            role: item.role === "user" ? "user" : "assistant",
            content: item.content,
          }))
        );
      }
    } catch (error) {
      console.error("Chat history error:", error);
    }
  };

  loadChatHistory();
}, []);

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
        setListening(false);
        return;
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const sendMessage = async () => {
    if (!message.trim() || !sessionId) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(
        "https://enterprise-ai-business-automation.onrender.com/rag-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: message,
            session_id: sessionId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Something went wrong");
      }

      setResponse(data.answer);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(data.answer);
        speech.lang = "en-IN";
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error("RAG Chat Error:", error);
      setResponse("AI से connect नहीं हो पाया। Backend check करें.");
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
              {listening ? "🎙️ Listening..." : "🎤 Speak"}
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !sessionId}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold"
            >
              {loading ? "Thinking..." : "Send Message →"}
            </button>

            <button
              type="button"
              onClick={() => window.speechSynthesis.cancel()}
              className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-900 font-semibold"
            >
              🔇 Stop Voice
            </button>

          </div>

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








import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { useApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Where is my passport?",
  "Where did I keep the spare keys?",
  "Show all documents.",
  "Do I have any tools stored?",
];

export default function AIAssistantPage() {
  const apiFetch = useApi();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem("mv_ai_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    }
    return [
      {
        role: "assistant",
        content:
          "Hello! I am your MemoryVault AI Assistant. Ask me anything about where you stored your physical items, documents, or reminders. I will answer based *only* on your saved memories.",
      },
    ];
  });
  const [input, setInput] = useState(() => {
    return sessionStorage.getItem("mv_ai_input") || "";
  });

  useEffect(() => {
    sessionStorage.setItem("mv_ai_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("mv_ai_input", input);
  }, [input]);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    
    // Save user message to sessionStorage immediately
    sessionStorage.setItem("mv_ai_messages", JSON.stringify(updatedMessages));
    
    if (isMounted.current) setLoading(true);

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          history: updatedMessages 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve response");
      }

      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.response };
      
      // Update sessionStorage directly first
      const currentSaved = sessionStorage.getItem("mv_ai_messages");
      if (currentSaved) {
        try {
          const parsed = JSON.parse(currentSaved);
          // Check if this message was already appended
          const exists = parsed.some((m: Message) => m.role === "assistant" && m.content === data.response);
          if (!exists) {
            parsed.push(assistantMsg);
            sessionStorage.setItem("mv_ai_messages", JSON.stringify(parsed));
          }
        } catch (e) {
          console.error("Error direct saving to sessionStorage:", e);
        }
      }

      if (isMounted.current) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, I couldn't reach the AI model. Please verify your GEMINI_API_KEY environment variable is configured in `.env`.",
      };
      
      const currentSaved = sessionStorage.getItem("mv_ai_messages");
      if (currentSaved) {
        try {
          const parsed = JSON.parse(currentSaved);
          parsed.push(errorMsg);
          sessionStorage.setItem("mv_ai_messages", JSON.stringify(parsed));
        } catch {}
      }

      if (isMounted.current) {
        toast.error("Error communicating with AI Assistant");
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };


  return (
    <div className="w-full h-full flex flex-col animate-fade-in font-sans">
      {/* Vault Assistant Card Header & Messages list */}
      <div className="flex-1 flex flex-col border border-appBorder bg-white rounded-xl overflow-hidden h-full shadow-soft">
        
        {/* Info Banner */}
        <div className="p-4 border-b border-appBorder bg-stone-50 text-[11px] text-appTextSecondary">
          Ask questions about where you stored items, warranties, or documents. Your assistant queries database indexes in real-time.
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[300px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border text-sm leading-relaxed ${
                msg.role === "user"
                  ? "border-appPrimary/25 bg-appPrimary-light/20 text-appTextPrimary max-w-[85%] ml-auto"
                  : "border-appBorder bg-white text-appTextPrimary shadow-soft max-w-[85%]"
              }`}
            >
              <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-stone-100 text-[10px] font-bold tracking-wider text-appTextSecondary uppercase">
                <span>{msg.role === "user" ? "You" : "Vault Assistant"}</span>
                <span className="text-[9px] text-stone-400 normal-case font-normal">
                  {msg.role === "assistant" ? "Verified Vault Database Query" : ""}
                </span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-xs">{msg.content}</p>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 rounded-xl border border-appBorder bg-stone-50 max-w-[85%] text-xs flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-appPrimary" />
              <span className="text-appTextSecondary">Searching vault catalog...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 pt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-appBorder bg-stone-50 text-appTextSecondary hover:border-appPrimary hover:text-appPrimary transition-all cursor-pointer font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Text Area / Input Bar */}
        <div className="p-4 border-t border-appBorder bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              placeholder="Ask: Where did I keep the spare keys? or Show all documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-4 text-appTextPrimary outline-none text-xs h-10 shadow-soft"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 rounded-xl bg-appPrimary hover:bg-appPrimary-hover text-white text-xs font-semibold shadow-soft flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

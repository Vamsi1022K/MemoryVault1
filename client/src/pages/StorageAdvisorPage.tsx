import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { User, Send, Lightbulb, Loader2, ShieldCheck } from "lucide-react";
import { useApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Where should I store gold?",
  "How should I preserve important documents?",
  "Where should I keep medicines?",
  "How do I organize storage boxes?",
];

export default function StorageAdvisorPage() {
  const apiFetch = useApi();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem("mv_advisor_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved advisor messages:", e);
      }
    }
    return [
      {
        role: "assistant",
        content:
          "Hello! I am your Storage & Preservation Advisor. Ask me how to store, organize, or preserve household belongings, papers, electronics, or valuables. I will provide helpful safety tips and environmental recommendations.",
      },
    ];
  });
  const [input, setInput] = useState(() => {
    return sessionStorage.getItem("mv_advisor_input") || "";
  });

  useEffect(() => {
    sessionStorage.setItem("mv_advisor_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("mv_advisor_input", input);
  }, [input]);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    
    // Save user message immediately to sessionStorage
    sessionStorage.setItem("mv_advisor_messages", JSON.stringify(updatedMessages));
    
    if (isMounted.current) setLoading(true);

    try {
      const res = await apiFetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve advice");
      }

      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.response };
      
      // Update sessionStorage directly first
      const currentSaved = sessionStorage.getItem("mv_advisor_messages");
      if (currentSaved) {
        try {
          const parsed = JSON.parse(currentSaved);
          // Check if this message was already appended
          const exists = parsed.some((m: Message) => m.role === "assistant" && m.content === data.response);
          if (!exists) {
            parsed.push(assistantMsg);
            sessionStorage.setItem("mv_advisor_messages", JSON.stringify(parsed));
          }
        } catch (e) {
          console.error("Error direct saving advisor messages to sessionStorage:", e);
        }
      }

      if (isMounted.current) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, I couldn't retrieve storage advice. Please make sure a valid GEMINI_API_KEY is configured in your `.env` file.",
      };
      
      const currentSaved = sessionStorage.getItem("mv_advisor_messages");
      if (currentSaved) {
        try {
          const parsed = JSON.parse(currentSaved);
          parsed.push(errorMsg);
          sessionStorage.setItem("mv_advisor_messages", JSON.stringify(parsed));
        } catch {}
      }

      if (isMounted.current) {
        toast.error("Error communicating with Storage Advisor");
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };


  // Helper to check if a line is a disclaimer and wrap it in a custom style
  const renderMessageContent = (content: string) => {
    const parts = content.split("Disclaimer:");
    if (parts.length > 1) {
      return (
        <div className="space-y-4">
          <p className="whitespace-pre-line">{parts[0].trim()}</p>
          <div className="p-3 bg-red-50/70 border border-red-100 text-red-750 rounded-xl text-xs flex gap-2 shadow-soft">
            <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <p>
              <span className="font-semibold text-red-800">Disclaimer:</span>
              {parts[1]}
            </p>
          </div>
        </div>
      );
    }
    return <p className="whitespace-pre-line">{content}</p>;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col border border-appBorder bg-white rounded-2xl overflow-hidden h-full shadow-soft">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[300px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  msg.role === "user"
                    ? "bg-appPrimary text-white"
                    : "bg-appMuted border border-appBorder text-appPrimary"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-appPrimary text-white rounded-tr-none"
                    : "bg-appBg/65 border border-appBorder text-appTextPrimary rounded-tl-none shadow-soft"
                }`}
              >
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="p-2 rounded-xl bg-appMuted border border-appBorder text-appPrimary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-appBg/65 border border-appBorder text-appTextSecondary rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-appPrimary" />
                Retrieving advice...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 pt-2 flex flex-wrap gap-2.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-appBorder bg-appMuted/45 text-appTextSecondary hover:border-appPrimary/40 hover:text-appPrimary transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <div className="p-4 border-t border-appBorder bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2.5"
          >
            <input
              placeholder="Ask: Where should I store gold? or How do I preserve documents?..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-4 text-appTextPrimary outline-none text-sm h-11 shadow-soft"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-appPrimary hover:bg-appPrimary-hover text-white shrink-0 p-0 shadow-md shadow-appPrimary/10 cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>

  );
}

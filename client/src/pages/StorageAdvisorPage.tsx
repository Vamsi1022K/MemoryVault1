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
    <div className="w-full space-y-8 animate-fade-in font-sans text-appTextPrimary">
      
      {/* Advisor Highlights Grid */}
      <div>
        <h3 className="text-sm font-bold text-appTextPrimary mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-appPrimary" /> Recommended Storage Guidelines
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Paper & Documents", desc: "Use acid-free plastic sleeves or fireproof binders.", temp: "18 - 22°C", humidity: "< 50% RH" },
            { title: "Valuables & Gold", desc: " Velvet-lined safe boxes or vault deposit boxes.", temp: "15 - 20°C", humidity: "< 40% RH" },
            { title: "Medicines & Drugs", desc: "Cool, dark cabinets away from direct sunlight.", temp: "15 - 25°C", humidity: "< 60% RH" },
            { title: "Electronics & Tech", desc: "Anti-static pouches with dry silica gel packs.", temp: "10 - 25°C", humidity: "< 30% RH" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-appBorder rounded-xl p-4 shadow-soft space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-appTextPrimary">{item.title}</span>
              </div>
              <p className="text-[11px] text-appTextSecondary leading-relaxed">{item.desc}</p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[9px] font-semibold">
                <div className="bg-stone-50 border border-appBorder p-1.5 rounded text-center">
                  <span className="block text-stone-400 font-normal">Temp</span>
                  <span className="text-appTextPrimary">{item.temp}</span>
                </div>
                <div className="bg-stone-50 border border-appBorder p-1.5 rounded text-center">
                  <span className="block text-stone-400 font-normal">Humidity</span>
                  <span className="text-appTextPrimary">{item.humidity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consult Advisor Chat Area */}
      <div className="border border-appBorder bg-white rounded-xl overflow-hidden shadow-soft flex flex-col">
        
        {/* Advisor Header */}
        <div className="p-4 border-b border-appBorder bg-stone-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-appTextPrimary">Consult Storage Advisor</h3>
            <p className="text-[10px] text-appTextSecondary mt-0.5">Ask questions about how to store other custom items.</p>
          </div>
        </div>

        {/* Message Panel */}
        <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto min-h-[160px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border text-sm leading-relaxed ${
                msg.role === "user"
                  ? "border-appPrimary/25 bg-appPrimary-light/20 text-appTextPrimary max-w-[85%] ml-auto"
                  : "border-appBorder bg-white text-appTextPrimary shadow-soft max-w-[85%]"
              }`}
            >
              <div className="flex justify-between items-center pb-1 mb-2 border-b border-stone-100 text-[10px] font-bold tracking-wider text-appTextSecondary uppercase">
                <span>{msg.role === "user" ? "You" : "Advisor Assistant"}</span>
                <span className="text-[9px] text-stone-400 normal-case font-normal">
                  {msg.role === "assistant" ? "Gemini 2.5 flash recommendations" : ""}
                </span>
              </div>
              <div className="text-xs">{renderMessageContent(msg.content)}</div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 rounded-xl border border-appBorder bg-stone-50 max-w-[85%] text-xs flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-appPrimary" />
              <span className="text-appTextSecondary">Consulting preservation indexes...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
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

        {/* Input area */}
        <div className="p-4 border-t border-appBorder bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              placeholder="Ask: How should I store photographic film? or How do I keep medicine bottles?..."
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
              <Send className="h-3.5 w-3.5" /> Ask Advisor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

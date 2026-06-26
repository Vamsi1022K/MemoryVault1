"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Bot, User, Send, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your MemoryVault AI Assistant. Ask me anything about where you stored your physical items, documents, or reminders. I will answer based *only* on your saved memories.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
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
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      toast.error("Error communicating with AI Assistant");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the AI model. Please verify your GEMINI_API_KEY environment variable is configured in `.env`.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col border border-slate-800 bg-slate-900/10 rounded-2xl overflow-hidden h-full">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[300px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-slate-850 text-indigo-400"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Chat bubble text */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-650 text-white rounded-tr-none"
                    : "bg-slate-900/70 border border-slate-850 text-slate-200 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-850 text-slate-400 rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 pb-2 pt-2 flex flex-wrap gap-2.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:text-white transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Text Area / Input Bar */}
        <div className="p-4 border-t border-slate-900 bg-slate-900/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2.5"
          >
            <Input
              placeholder="Ask: Where is my passport? or Show all documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl text-slate-200 h-11"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 p-0 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

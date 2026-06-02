import { useState, useEffect } from "react";
import { ArrowUp, MessageSquare, X, Send, Bot } from "lucide-react";

export function FloatingWidgets() {
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      <div
        className={`transition-all duration-500 origin-bottom-right ${
          isChatOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        } mb-2`}
      >
        <div className="w-80 glass-dark rounded-2xl border border-white/10 shadow-royal overflow-hidden flex flex-col h-[400px]">
          {/* Header */}
          <div className="bg-gradient-royal p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-display text-sm leading-tight">SAF Concierge</div>
                <div className="text-[9px] text-white/70 uppercase tracking-widest">
                  AI Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {/* AI Message */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex shrink-0 items-center justify-center mt-1">
                <Bot className="w-3 h-3 text-gold" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-white/80 leading-relaxed">
                Welcome to SAF Convention Centre! I'm your AI Concierge. How can I assist you with
                your event planning today?
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-col gap-2 pl-9 mt-2">
              <button className="text-xs text-left text-gold/80 hover:text-gold border border-gold/20 hover:border-gold/50 rounded-full px-3 py-1.5 transition-colors w-fit">
                What are your venue capacities?
              </button>
              <button className="text-xs text-left text-gold/80 hover:text-gold border border-gold/20 hover:border-gold/50 rounded-full px-3 py-1.5 transition-colors w-fit">
                Do you offer catering?
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors pr-10"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black hover:scale-105 transition-transform">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Chatbot Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 rounded-full bg-gradient-gold text-black flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
          aria-label="Open AI Chat"
        >
          {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`w-12 h-12 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/70 hover:text-gold hover:border-gold/30 shadow-soft transition-all duration-500 ${
            showScroll
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

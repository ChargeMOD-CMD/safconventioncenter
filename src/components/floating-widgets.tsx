import { useState, useEffect } from "react";
import { ArrowUp, MessageSquare, X, Send, Bot } from "lucide-react";

export function FloatingWidgets() {
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState<"initial" | "location">("initial");

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
        className={`transition-all duration-500 origin-bottom-right ${isChatOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
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
              onClick={() => { setIsChatOpen(false); setTimeout(() => setChatStep("initial"), 300); }}
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
                Welcome to SAF Convention Centre! ✨<br />
                I'm your AI Concierge. Ready to explore our luxurious venues and make your event memorable? 🎉
              </div>
            </div>

            {chatStep === "initial" && (
              <div className="flex flex-col gap-2 pl-9 mt-2">
                <button
                  onClick={() => setChatStep("location")}
                  className="text-xs font-semibold bg-gold text-black hover:bg-gold/90 rounded-full px-5 py-2 transition-colors w-fit shadow-glow"
                >
                  Get Started
                </button>
              </div>
            )}

            {chatStep === "location" && (
              <>
                {/* User Message */}
                <div className="flex justify-end gap-3 mt-2">
                  <div className="bg-gold/10 border border-gold/20 rounded-2xl rounded-tr-none p-3 text-sm text-gold leading-relaxed">
                    Get Started
                  </div>
                </div>

                {/* AI Location Info */}
                <div className="flex gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex shrink-0 items-center justify-center mt-1">
                    <Bot className="w-3 h-3 text-gold" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm text-white/80 leading-relaxed w-full">
                    <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                      Location & Navigate 🗺️
                    </h3>
                    <p className="text-white/60 mb-4 text-[13px]">
                      Chullimanoor, Nedumangad, Trivandrum
                    </p>
                    <a
                      href="https://maps.app.goo.gl/d5CAAM5qDc7fvPDBA"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-full text-[13px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2.5 transition-colors"
                    >
                      Get Direction 📍
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your message..."
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white/50 outline-none pr-10 cursor-not-allowed"
              />
              <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/30 cursor-not-allowed">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/9400066303?text=Hi"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
          aria-label="Contact on WhatsApp"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>

        {/* Chatbot Button */}
        <button
          onClick={() => {
            if (isChatOpen) {
              setIsChatOpen(false);
              setTimeout(() => setChatStep("initial"), 300);
            } else {
              setIsChatOpen(true);
            }
          }}
          className="w-12 h-12 rounded-full bg-gradient-gold text-black flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
          aria-label="Open AI Chat"
        >
          {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`w-12 h-12 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/70 hover:text-gold hover:border-gold/30 shadow-soft transition-all duration-500 ${showScroll
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

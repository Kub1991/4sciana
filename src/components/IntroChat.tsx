import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroChatProps {
  onEnter: () => void;
  onMusicToggle?: () => void;
  isMuted?: boolean;
}

const IntroChat: React.FC<IntroChatProps> = ({ onEnter, onMusicToggle, isMuted }) => {
  const [showTyping, setShowTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const fullMessage = "Złożę ci propozycję nie do odrzucenia…\nWejdź i zadaj minimum jedno pytanie...";

  useEffect(() => {
    // Show typing indicator first
    const typingTimer = setTimeout(() => {
      setShowTyping(true);
      
      // After 1.5 seconds of typing, hide typing and then show message with delay
      setTimeout(() => {
        setShowTyping(false);
        
        // Wait a bit after typing disappears, then show message
        setTimeout(() => {
          setShowMessage(true);
          
          // Show button after message appears
          setTimeout(() => {
            setShowButton(true);
          }, 1200);
        }, 400); // 400ms delay after typing disappears
      }, 1500);
    }, 500);

    return () => clearTimeout(typingTimer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto h-[50vh] md:h-[30vh] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-br from-black/40 to-zinc-900/50 backdrop-blur-sm border border-white/20 w-full h-full flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <img
              src="/marlonv2.jpg"
              alt="Don Vito Corleone"
              className="w-10 h-10 object-cover border-2 border-slate-400/40"
            />
            <div>
              <h2 className="text-white font-semibold drop-shadow-lg">Don Vito Corleone</h2>
              <p className="text-zinc-200 text-sm drop-shadow-sm">The Godfather</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence>
            {/* Typing Indicator */}
            {showTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="flex justify-start"
              >
                <div className="bg-white/15 border border-white/20 px-4 py-3 backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message */}
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { 
                    duration: 1.5, 
                    ease: [0.25, 0.1, 0.25, 1]
                  },
                  y: { 
                    duration: 1.0, 
                    ease: [0.16, 1, 0.3, 1]
                  },
                  scale: { 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1] 
                  }
                }}
                className="flex justify-start"
              >
                <div className="bg-white/15 text-white border border-white/20 backdrop-blur-sm px-4 py-3 shadow-lg max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/marlonv2.jpg"
                      alt="Don Vito Corleone"
                      className="w-6 h-6 object-cover"
                    />
                    <span className="text-blue-300 text-sm font-medium drop-shadow-sm">Don Vito Corleone</span>
                  </div>
                  <p className="leading-relaxed text-sm drop-shadow-sm whitespace-pre-line">
                    {fullMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Button in bottom right corner */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute bottom-4 right-4"
            >
              <button
                onClick={onEnter}
                className="bg-white/15 text-white border border-white/20 backdrop-blur-sm px-4 py-3 shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-sm"
              >
                Wchodzę...
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default IntroChat;
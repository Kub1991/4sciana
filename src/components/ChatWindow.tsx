import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Share2, RotateCcw, MessageCircle, Volume2, VolumeX, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Character, Message, ShareData, ChatRequest, ChatResponse } from '../types';

interface ChatWindowProps {
  character: Character;
  onBack: () => void;
  onShare: (shareData: ShareData) => void;
  onNewQuestion: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ character, onBack, onShare, onNewQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Add initial greeting
    const greetingMessage: Message = {
      id: '1',
      text: character.greeting,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);

    // Play intro sound if available
    if (character.introSoundUrl && !isMuted) {
      playIntroSound();
    }

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [character, isMuted]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    // Monitor connection quality
    const checkConnectionSpeed = () => {
      if (navigator.connection) {
        const connection = navigator.connection as any;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setNetworkStatus('slow');
        } else if (connection.effectiveType === '3g' || connection.effectiveType === '4g') {
          setNetworkStatus('online');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial connection
    if (!navigator.onLine) {
      setNetworkStatus('offline');
    } else {
      checkConnectionSpeed();
    }

    // Monitor connection changes
    if (navigator.connection) {
      navigator.connection.addEventListener('change', checkConnectionSpeed);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', checkConnectionSpeed);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  const playIntroSound = async () => {
    if (!character.introSoundUrl) return;

    try {
      // Create audio element
      const audio = new Audio(character.introSoundUrl);
      audioRef.current = audio;

      // Set audio properties - use character's volume or default to 0.4
      audio.volume = character.volume || 0.4;
      audio.preload = 'auto';

      // Handle audio events
      audio.addEventListener('loadeddata', () => {
        setAudioLoaded(true);
      });

      audio.addEventListener('error', (e) => {
        console.warn('Audio failed to load:', e);
        setAudioError(true);
      });

      audio.addEventListener('ended', () => {
        // Clean up after playing
        if (audioRef.current) {
          audioRef.current.src = '';
        }
      });

      // Play the audio
      await audio.play();
    } catch (error) {
      console.warn('Failed to play intro sound:', error);
      setAudioError(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  };

  // Smooth scrolling with delay for better UX
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    };

    // Add delay to allow message animation to start before scrolling
    const timeoutId = setTimeout(scrollToBottom, 150);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async (text: string, isRetry: boolean = false) => {
    if (!text.trim()) return;

    // Check network status before sending
    if (networkStatus === 'offline') {
      setError('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
      setLastFailedMessage(text.trim());
      return;
    }

    if (!isRetry) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
    }

    setShowSuggestions(false);
    setIsTyping(true);
    setError(null);
    setLastFailedMessage(null);

    try {
      // Get Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration not found. Please set up your Supabase connection.');
      }

      const apiUrl = `${supabaseUrl}/functions/v1/chat`;
      
      const requestBody: ChatRequest = {
        message: isRetry ? lastFailedMessage || text.trim() : text.trim(),
        characterId: character.id,
        threadId: threadId
      };

      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
            
            // Add helpful context for common errors
            if (errorMessage.includes('OpenAI API key not configured')) {
              errorMessage += '\n\nPlease add your OPENAI_API_KEY to your Supabase environment variables.';
            } else if (errorMessage.includes('No assistant configured')) {
              errorMessage += `\n\nPlease add the ${character.id.toUpperCase().replace('-', '_')}_ASSISTANT_ID to your Supabase environment variables.`;
            }
          }
          
          if (errorData.details) {
            errorMessage += `\n\nDetails: ${errorData.details}`;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage);
      }

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update thread ID for future messages
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date()
      };

      // Add delay before showing AI message to allow typing animation to complete
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
      }, 300); // 300ms delay after typing dots disappear

      // Reset retry count on success
      setRetryCount(0);

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = '';
      let shouldRetry = false;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Żądanie przekroczyło limit czasu. Sprawdź połączenie internetowe.';
          shouldRetry = true;
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Błąd połączenia sieciowego. Sprawdź internet i spróbuj ponownie.';
          shouldRetry = true;
        } else if (error.message.includes('Internal Server Error')) {
          errorMessage = 'Tymczasowy błąd serwera. Spróbuj ponownie za chwilę.';
          shouldRetry = true;
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Wystąpił nieoczekiwany błąd';
        shouldRetry = true;
      }
      
      setError(errorMessage);
      
      if (shouldRetry && retryCount < 3) {
        setLastFailedMessage(isRetry ? lastFailedMessage || text.trim() : text.trim());
        setIsRetrying(true);
        
        // Auto-retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsRetrying(false);
          handleSendMessage(text, true);
        }, retryDelay);
      } else {
        setLastFailedMessage(isRetry ? lastFailedMessage || text.trim() : text.trim());
      }
      
      // Show a fallback message in chat
      if (!shouldRetry || retryCount >= 3) {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Przepraszam, ale mam problem z połączeniem. Sprawdź komunikat błędu powyżej lub spróbuj ponownie.",
          isUser: false,
          timestamp: new Date()
        };

        setTimeout(() => {
          setMessages(prev => [...prev, fallbackMessage]);
        }, 300);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetryLastMessage = () => {
    if (lastFailedMessage) {
      setRetryCount(0);
      setIsRetrying(false);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      handleSendMessage(lastFailedMessage, true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleShare = () => {
    const lastBotMessage = messages.filter(m => !m.isUser).pop();
    if (lastBotMessage) {
      const shareData: ShareData = {
        characterName: character.name,
        confession: lastBotMessage.text,
        topic: messages.filter(m => m.isUser).pop()?.text || 'General conversation',
        source: character.source,
        chatLink: `${window.location.origin}?character=${character.id}`
      };
      onShare(shareData);
    }
  };

  const handleNewQuestion = () => {
    setMessages([{
      id: '1',
      text: character.greeting,
      isUser: false,
      timestamp: new Date()
    }]);
    setShowSuggestions(true);
    setThreadId(undefined); // Reset thread ID for new conversation
    setError(null);
    setLastFailedMessage(null);
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    onNewQuestion();
  };

  // Get background style for specific characters
  const getBackgroundStyle = () => {
    if (character.id === 'walter-white') {
      return {
        backgroundImage: `url('/walter white.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'eleven') {
      return {
        backgroundImage: `url('/eleven.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'jon-snow') {
      return {
        backgroundImage: `url('/jon snow.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'thomas-shelby') {
      return {
        backgroundImage: `url('/tom shelby.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'tony-stark') {
      return {
        backgroundImage: `url('/stark.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'hannibal-lecter') {
      return {
        backgroundImage: `url('/haniball.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'marty-mcfly') {
      return {
        backgroundImage: `url('/marty mcfly.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'mathilda') {
      return {
        backgroundImage: `url('/matylda.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'joseph-cooper') {
      return {
        backgroundImage: `url('/cooper.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'rose-dewitt-bukater') {
      return {
        backgroundImage: `url('/titanic.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'jack-shephard') {
      return {
        backgroundImage: `url('/lost.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (character.id === 'mark-scout') {
      return {
        backgroundImage: `url('/rozdzieleniev2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      style={getBackgroundStyle()}
      onClick={onBack}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-black/40 to-zinc-900/50 backdrop-blur-sm border border-white/20 w-full max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        className="bg-gradient-to-br from-black/40 to-zinc-900/50 backdrop-blur-sm border border-white/20 w-full max-w-2xl h-[50vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover border-2 border-slate-400/40"
            />
            <div>
              <h2 className="text-white font-semibold drop-shadow-lg text-sm sm:text-base">{character.name}</h2>
              <p className="text-zinc-200 text-xs sm:text-sm drop-shadow-sm">{character.source}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Network Status Indicator */}
            <div className="flex items-center gap-1">
              {networkStatus === 'offline' && (
                <div className="flex items-center gap-1 text-red-400" title="Brak połączenia">
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              )}
              {networkStatus === 'slow' && (
                <div className="flex items-center gap-1 text-yellow-400" title="Wolne połączenie">
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              )}
              {networkStatus === 'online' && (
                <div className="flex items-center gap-1 text-green-400" title="Połączenie OK">
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
            
            {/* Audio Control */}
            {character.introSoundUrl && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  className="p-1.5 sm:p-2 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
                  title={isMuted ? 'Włącz dźwięk' : 'Wyłącz dźwięk'}
                >
                  {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            )}
            
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-200 p-3 sm:p-4 mx-2 sm:mx-4 mt-2 sm:mt-4 text-xs sm:text-sm backdrop-blur-sm flex-shrink-0">
            <p className="font-medium text-red-100 mb-2">Configuration Error:</p>
            <div className="whitespace-pre-line text-red-200">
              {error}
            </div>
            
            {/* Retry Button for Network Errors */}
            {lastFailedMessage && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetryLastMessage}
                  disabled={isRetrying}
                  className="flex items-center gap-2 bg-red-700/50 hover:bg-red-600/50 text-red-100 px-3 py-2 text-xs border border-red-500/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Ponawiam... ({retryCount + 1}/3)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Spróbuj ponownie
                    </>
                  )}
                </button>
                {retryCount > 0 && (
                  <span className="text-red-300 text-xs flex items-center">
                    Próba {retryCount}/3
                  </span>
                )}
              </div>
            )}
            
            {error.includes('OpenAI') && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-900/40 border border-red-500/60 backdrop-blur-sm">
                <p className="font-medium text-red-100 mb-1">Setup Required:</p>
                <p className="text-xs sm:text-xs text-red-300">
                  1. Get your OpenAI API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-red-200"
                  >
                    OpenAI Platform
                  </a>
                </p>
                <p className="text-xs sm:text-xs text-red-300">
                  2. Create character assistants in{' '}
                  <a 
                    href="https://platform.openai.com/playground" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-red-200"
                  >
                    OpenAI Playground
                  </a>
                </p>
                <p className="text-xs sm:text-xs text-red-300">
                  3. Add the API key and assistant IDs to your Supabase environment variables
                </p>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 25, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 1.0,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.isUser 
                    ? 'bg-slate-600/80 text-white backdrop-blur-sm' 
                    : 'bg-white/15 text-white border border-white/20 backdrop-blur-sm'
                } px-3 sm:px-4 py-2 sm:py-3 shadow-lg`}>
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-cover"
                      />
                      <span className="text-blue-300 text-xs sm:text-sm font-medium drop-shadow-sm">{character.name}</span>
                    </div>
                  )}
                  <p className="leading-relaxed text-xs sm:text-sm drop-shadow-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {(isTyping || isRetrying) && (
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
                <div className="bg-white/15 border border-white/20 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-5 h-5 sm:w-6 sm:h-6 object-cover"
                    />
                    <span className="text-blue-300 text-xs sm:text-sm font-medium drop-shadow-sm">
                      {character.name} {isRetrying && '(ponawiam...)'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="p-2 sm:p-4 pb-1 sm:pb-2 flex-shrink-0"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {character.suggestedQuestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-white/10 border border-white/20 text-white/90 px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-slate-600/30 hover:border-slate-400/50 hover:text-slate-200 transition-all duration-200 backdrop-blur-sm drop-shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {messages.length > 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 sm:p-4 pt-1 sm:pt-2 flex-shrink-0"
          >
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-2 sm:mb-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 sm:gap-2 bg-blue-600/30 border border-blue-500/50 text-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-blue-600/40 transition-all duration-200 backdrop-blur-sm drop-shadow-sm"
              >
                <Share2 className="w-3 h-3 sm:w-3 sm:h-3" />
                Udostępnij
              </button>
              <button
                onClick={handleNewQuestion}
                className="flex items-center gap-1 sm:gap-2 bg-white/10 border border-white/20 text-white/90 px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-white/20 transition-all duration-200 backdrop-blur-sm drop-shadow-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-3 sm:h-3" />
                Nowe pytanie
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 bg-white/10 border border-white/20 text-white/90 px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-white/20 transition-all duration-200 backdrop-blur-sm drop-shadow-sm"
              >
                <MessageCircle className="w-3 h-3 sm:w-3 sm:h-3" />
                Zmień postać
              </button>
            </div>
          </motion.div>
        )}

        {/* Input */}
        <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-2 sm:p-4 flex-shrink-0">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Zadaj swoje pytanie..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-xs sm:text-sm focus:outline-none focus:border-slate-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm drop-shadow-sm"
                disabled={isTyping || isRetrying || networkStatus === 'offline'}
              />
            </div>
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isTyping || isRetrying || networkStatus === 'offline'}
              className="bg-slate-600/80 text-white p-2 sm:p-2.5 hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 backdrop-blur-sm drop-shadow-sm"
            >
              {isRetrying ? (
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
          
          {/* Network Status Message */}
          {networkStatus === 'offline' && (
            <div className="mt-2 text-center">
              <p className="text-red-300 text-xs">
                Brak połączenia z internetem
              </p>
            </div>
          )}
          {networkStatus === 'slow' && (
            <div className="mt-2 text-center">
              <p className="text-yellow-300 text-xs">
                Wolne połączenie - odpowiedzi mogą być opóźnione
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatWindow;
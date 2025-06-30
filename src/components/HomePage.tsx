import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import IntroChat from './IntroChat';

interface HomePageProps {
  onEnter: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play Godfather intro music when component mounts
    if (!isMuted) {
      playIntroMusic();
    }

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [isMuted]);

  const playIntroMusic = async () => {
    try {
      // Get Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        console.warn('Supabase URL not found');
        return;
      }

      const audioUrl = `${supabaseUrl}/storage/v1/object/public/character-sounds/godfather_intro.mp3`;
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set audio properties
      audio.volume = 0.1; // Lower volume for background music
      audio.loop = true; // Loop the music
      audio.preload = 'auto';

      // Handle audio events
      audio.addEventListener('loadeddata', () => {
        setAudioLoaded(true);
      });

      audio.addEventListener('error', (e) => {
        console.warn('Audio failed to load:', e);
        setAudioError(true);
      });

      // Play the audio
      await audio.play();
    } catch (error) {
      console.warn('Failed to play intro music:', error);
      setAudioError(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) {
        // Muting - pause the audio
        audioRef.current.pause();
      } else {
        // Unmuting - play the audio
        audioRef.current.play().catch(error => {
          console.warn('Failed to resume audio:', error);
        });
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: 'url("/marlonv2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black/20"
      />
      
      {/* Audio Control Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleMute}
          className="p-3 bg-black/30 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-black/40 transition-all duration-200 shadow-lg"
          title={isMuted ? 'Włącz muzykę' : 'Wyłącz muzykę'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <IntroChat onEnter={onEnter} onMusicToggle={toggleMute} isMuted={isMuted} />
      </div>
    </div>
  );
};

export default HomePage;
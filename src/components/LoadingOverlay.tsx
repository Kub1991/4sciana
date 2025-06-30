import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Character } from '../types';

interface LoadingOverlayProps {
  character: Character;
  onLoaded: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ character, onLoaded }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Przygotowuję rozmowę...');

  // Get background image URL for the character
  const getBackgroundImageUrl = (characterId: string): string | null => {
    const imageMap: Record<string, string> = {
      'walter-white': '/walter white.jpg',
      'eleven': '/eleven.jpg',
      'jon-snow': '/jon snow.jpg',
      'thomas-shelby': '/tom shelby.jpg',
      'tony-stark': '/stark.jpg',
      'hannibal-lecter': '/haniball.jpg',
      'marty-mcfly': '/marty mcfly.jpg',
      'mathilda': '/matylda.jpg',
      'joseph-cooper': '/cooper.jpg',
      'rose-dewitt-bukater': '/titanic.jpg',
      'jack-shephard': '/lost.jpg',
      'mark-scout': '/rozdzieleniev2.jpg',
    };
    return imageMap[characterId] || null;
  };

  useEffect(() => {
    const backgroundImageUrl = getBackgroundImageUrl(character.id);
    
    if (!backgroundImageUrl) {
      // No background image for this character, proceed immediately
      setTimeout(() => {
        onLoaded();
      }, 800); // Still show loading for a bit for consistency
      return;
    }

    setLoadingText('Ładuję tło...');

    // Preload the background image
    const img = new Image();
    
    const handleImageLoad = () => {
      setImageLoaded(true);
      setLoadingText('Gotowe!');
      
      // Small delay to show "Gotowe!" message
      setTimeout(() => {
        onLoaded();
      }, 300);
    };

    const handleImageError = () => {
      console.warn(`Failed to load background image: ${backgroundImageUrl}`);
      setLoadingText('Kontynuuję bez tła...');
      
      // Still proceed even if image fails to load
      setTimeout(() => {
        onLoaded();
      }, 500);
    };

    // Set up event listeners
    img.addEventListener('load', handleImageLoad);
    img.addEventListener('error', handleImageError);
    
    // Start loading the image
    img.src = backgroundImageUrl;

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (!imageLoaded) {
        console.warn('Image loading timeout, proceeding anyway');
        onLoaded();
      }
    }, 5000); // 5 second timeout

    // Cleanup
    return () => {
      img.removeEventListener('load', handleImageLoad);
      img.removeEventListener('error', handleImageError);
      clearTimeout(fallbackTimeout);
    };
  }, [character.id, onLoaded, imageLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-br from-black/60 to-zinc-900/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
      >
        {/* Character Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-20 h-20 object-cover rounded-full border-2 border-white/30"
            />
            {/* Pulsing ring around avatar */}
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/50 animate-ping"></div>
          </div>
        </div>

        {/* Character Info */}
        <div className="text-center mb-6">
          <h3 className="text-white font-semibold text-lg mb-1 drop-shadow-lg">
            {character.name}
          </h3>
          <p className="text-gray-300 text-sm drop-shadow-sm">
            {character.source}
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-center text-gray-300 text-sm font-light">
          {loadingText}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;
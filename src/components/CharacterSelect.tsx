import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv } from 'lucide-react';
import { characters } from '../data/characters';
import { Character } from '../types';

interface CharacterSelectProps {
  onCharacterSelect: (character: Character) => void;
}

type FilterType = 'all' | 'movie' | 'series';
const CharacterSelect: React.FC<CharacterSelectProps> = ({ onCharacterSelect }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Filter characters based on active filter
  const filteredCharacters = characters.filter(character => {
    if (activeFilter === 'all') return true;
    return character.type === activeFilter;
  });

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 bg-black">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Static Header */}
        <div className="text-center mb-8 h-24 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="text-xl md:text-3xl font-light text-orange-100 font-mono tracking-wide leading-relaxed max-w-4xl mx-auto px-4"
          >
            Nie musisz już zgadywać, co czuli. Możesz ich zapytać.
          </motion.h1>
        </div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-orange-600/80 text-white shadow-lg backdrop-blur-sm border border-orange-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setActiveFilter('movie')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === 'movie'
                  ? 'bg-orange-600/80 text-white shadow-lg backdrop-blur-sm border border-orange-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20'
              }`}
            >
              <Film className="w-4 h-4" />
              Filmy
            </button>
            <button
              onClick={() => setActiveFilter('series')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === 'series'
                  ? 'bg-orange-600/80 text-white shadow-lg backdrop-blur-sm border border-orange-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20'
              }`}
            >
              <Tv className="w-4 h-4" />
              Seriale
            </button>
          </div>
        </motion.div>
        {/* Character Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer group"
                onClick={() => onCharacterSelect(character)}
              >
              <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 overflow-hidden shadow-2xl hover:border-orange-500/30 transition-all duration-300">
                {/* Character Image */}
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback for placeholder images
                      e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Character Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-orange-300 transition-colors duration-300">
                      {character.name}
                    </h3>
                    <p className="text-gray-300 text-sm font-light">
                      {character.source}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-orange-500/5 group-hover:to-orange-500/0 transition-all duration-300 pointer-events-none"></div>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 font-light tracking-wide">
            More characters coming soon!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} available
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CharacterSelect;
import React from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Facebook } from 'lucide-react';
import { ShareData } from '../types';

interface ShareCardProps {
  shareData: ShareData;
  onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ shareData, onClose }) => {
  const handleCopyLink = () => {
    const copyText = `${shareData.characterName} wyznał mi:
"${shareData.confession}"

Temat: ${shareData.topic}
Źródło: ${shareData.source}

Zapytaj go sam: ${shareData.chatLink}`;
    
    navigator.clipboard.writeText(copyText);
    // Could add a toast notification here
  };

  const handleShare = (platform: string) => {
    const text = `${shareData.characterName} wyznał mi:\n"${shareData.confession.slice(0, 100)}..."\n\nTemat: ${shareData.topic}\nŹródło: ${shareData.source}\nZapytaj go sam: ${shareData.chatLink}`;
    
    let url = '';
    switch (platform) {
      case 'x':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.chatLink)}&quote=${encodeURIComponent(text)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-black/90 to-zinc-900/90 backdrop-blur-sm border border-white/20 w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white drop-shadow-lg">Character Confession</h3>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Confession Preview */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-6">
            <div className="mb-4">
              <h4 className="text-orange-200 font-semibold text-lg mb-3 drop-shadow-sm">
                {shareData.characterName} wyznał mi:
              </h4>
              <blockquote className="text-gray-200 italic leading-relaxed border-l-2 border-orange-500/50 pl-4 drop-shadow-sm">
                "{shareData.confession.length > 150 ? shareData.confession.slice(0, 150) + '...' : shareData.confession}"
              </blockquote>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <span className="font-medium text-white/90 min-w-[60px]">Temat:</span>
                <span className="drop-shadow-sm">{shareData.topic}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-medium text-white/90 min-w-[60px]">Źródło:</span>
                <span className="drop-shadow-sm">{shareData.source}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-orange-300 text-sm drop-shadow-sm">
                Zapytaj go sam: <span className="underline break-all">{shareData.chatLink}</span>
              </p>
            </div>
          </div>

          {/* Share Section */}
          <div className="space-y-4">
            {/* Share Header */}
            <h5 className="text-center text-white font-medium text-base drop-shadow-sm">
              Udostępnij rozmowę na socialach
            </h5>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShare('x')}
                className="flex items-center justify-center bg-black/80 text-white py-4 px-3 hover:bg-gray-900/80 transition-colors duration-200 backdrop-blur-sm border border-gray-700/50"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="text-xl font-bold">𝕏</span>
                </div>
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center bg-blue-800/80 text-white py-4 px-3 hover:bg-blue-900/80 transition-colors duration-200 backdrop-blur-sm border border-blue-700/50"
              >
                <Facebook className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center bg-white/10 text-white py-4 px-3 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm border border-white/20"
              >
                <Copy className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareCard;
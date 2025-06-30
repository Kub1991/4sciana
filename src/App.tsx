import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import CharacterSelect from './components/CharacterSelect';
import ChatWindow from './components/ChatWindow';
import LoadingOverlay from './components/LoadingOverlay';
import ShareCard from './components/ShareCard';
import { Character, AppScreen, ShareData } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleEnterApp = () => {
    setCurrentScreen('characters');
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen('loading');
    setIsLoadingChat(true);
  };

  const handleChatImageLoaded = () => {
    setCurrentScreen('chat');
    setIsLoadingChat(false);
  };

  const handleBackToCharacters = () => {
    setCurrentScreen('characters');
    setSelectedCharacter(null);
  };

  const handleShare = (data: ShareData) => {
    setShareData(data);
  };

  const handleCloseShare = () => {
    setShareData(null);
  };

  const handleNewQuestion = () => {
    // Reset any conversation context here if needed
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <HomePage key="home" onEnter={handleEnterApp} />
        )}
        
        {currentScreen === 'characters' && (
          <CharacterSelect 
            key="characters" 
            onCharacterSelect={handleCharacterSelect} 
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {currentScreen === 'loading' && selectedCharacter && (
          <LoadingOverlay
            key="loading"
            character={selectedCharacter}
            onLoaded={handleChatImageLoaded}
          />
        )}
      </AnimatePresence>

      {/* Chat window as overlay when character is selected */}
      <AnimatePresence>
        {currentScreen === 'chat' && selectedCharacter && (
          <ChatWindow
            key="chat"
            character={selectedCharacter}
            onBack={handleBackToCharacters}
            onShare={handleShare}
            onNewQuestion={handleNewQuestion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareData && (
          <ShareCard
            shareData={shareData}
            onClose={handleCloseShare}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
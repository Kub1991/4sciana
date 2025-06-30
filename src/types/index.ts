export interface Character {
  id: string;
  name: string;
  title: string;
  source: string;
  type: 'movie' | 'series'; // Add type field
  avatar: string;
  greeting: string;
  suggestedQuestions: string[];
  personality: string;
  introSoundUrl?: string; // Add intro sound URL
  assistantId?: string; // Add assistant ID for OpenAI integration
  volume?: number; // Volume for intro sound (0.0 to 1.0)
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Conversation {
  characterId: string;
  messages: Message[];
  context: string[];
  threadId?: string; // Add thread ID for OpenAI integration
}

export type AppScreen = 'home' | 'characters' | 'chat' | 'share';
export type AppScreen = 'home' | 'characters' | 'chat' | 'share' | 'loading';

export interface ShareData {
  characterName: string;
  confession: string;
  topic: string;
  source: string;
  chatLink: string;
}

export interface ChatRequest {
  message: string;
  characterId: string;
  threadId?: string;
}

export interface ChatResponse {
  message: string;
  threadId: string;
  error?: string;
}
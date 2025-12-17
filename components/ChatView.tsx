import React, { useState, useEffect, useRef } from 'react';
import { InsightData, ChatMessage } from '../types';
import { Button } from './Button';
import { getChatResponse } from '../services/geminiService';

interface ChatViewProps {
  insight: InsightData;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ insight, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message from the AI based on the insight
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `I've analyzed your expression. You seem to be feeling "${insight.currentPattern}". Do you want to talk about what's on your mind?`
      }
    ]);
  }, [insight]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', text: userText }
    ];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Get AI response
      const responseText = await getChatResponse(newHistory, insight);
      
      setMessages(prev => [
        ...prev,
        { role: 'model', text: responseText }
      ]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-lg h-[80vh] flex flex-col animate-fade-in relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-zinc-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-white font-serif-display text-sm">Kosha</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Your Soul Mirror</p>
          </div>
        </div>
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors text-xs font-bold px-3 py-1 rounded-lg hover:bg-white/5">
          End Session
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 no-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                msg.role === 'user' 
                  ? 'bg-white/10 text-white rounded-tr-sm border border-white/10' 
                  : 'bg-zinc-900/80 text-zinc-200 rounded-tl-sm border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-zinc-900/60 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce animation-delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your thoughts..."
          className="w-full bg-zinc-900/80 border border-white/10 text-white p-4 pr-14 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-zinc-800 transition-all shadow-xl placeholder-zinc-600"
          autoFocus
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-white flex items-center justify-center transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <line x1="22" y1="2" x2="11" y2="13"></line>
             <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};
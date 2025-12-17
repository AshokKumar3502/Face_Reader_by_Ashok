import React, { useState } from 'react';
import { Button } from './Button';

interface TextModeProps {
  onSubmit: (text: string) => void;
}

export const TextMode: React.FC<TextModeProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const questions = [
    "Who are you secretly jealous of?",
    "What are you hiding from your parents?",
    "When did you last cry alone?",
    "What is your biggest fear?"
  ];
  
  const [randomQ] = useState(questions[Math.floor(Math.random() * questions.length)]);

  return (
    <div className="w-full max-w-md animate-fade-in">
      <p className="text-zinc-500 mb-6 text-center italic font-light tracking-wide">
        "{randomQ}"
      </p>
      
      <textarea
        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 p-4 text-sm focus:border-zinc-500 focus:outline-none rounded-sm min-h-[120px] mb-6 placeholder-zinc-700"
        placeholder="Type your secret here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      
      <Button 
        fullWidth 
        onClick={() => onSubmit(input)}
        disabled={input.length < 3}
      >
        Submit to Veil
      </Button>
    </div>
  );
};
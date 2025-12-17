import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface VoiceModeProps {
  onCapture: (base64: string, mimeType: string) => void;
  onCancel: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onCapture, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onCapture(base64data, 'audio/webm');
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic denied", err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <div className={`w-32 h-32 rounded-full border border-zinc-800 flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-900/20 border-red-900 scale-110' : 'bg-transparent'}`}>
        <div className={`w-16 h-16 rounded-full bg-zinc-100 transition-transform duration-200 ${isRecording ? 'animate-pulse scale-90' : 'scale-100'}`}></div>
      </div>

      <p className="text-zinc-500 text-sm text-center max-w-xs">
        {isRecording 
          ? "I am listening to your voice..." 
          : "Press and hold to speak. Tell me your biggest fear."}
      </p>

      <Button 
        fullWidth
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
      >
        {isRecording ? 'Listening...' : 'Hold to Speak'}
      </Button>
    </div>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { Button } from './Button';
import { UserContext } from '../types';

interface VisionModeProps {
  context: UserContext;
  onCapture: (image: string, manualDay?: number, audio?: string) => void;
  onCancel: () => void;
}

export const VisionMode: React.FC<VisionModeProps> = ({ context, onCapture, onCancel }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(mediaStream);
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) { console.error("Access denied", err); }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [mode]);

  const toggleRecording = () => {
    if (!isRecording) {
      if (!stream) return;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setAudioBase64(reader.result as string);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => stopRecording(), 8000); // Max 8 seconds
    } else {
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
        onCapture(dataUrl, 1, audioBase64 || undefined);
      }
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fade-in z-20 px-2 sm:px-0">
      <div className="flex w-full bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/20">
         <button onClick={() => setMode('camera')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'camera' ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-500'}`}>Camera</button>
         <button onClick={() => setMode('upload')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'upload' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Upload</button>
      </div>

      <div className="relative w-full aspect-[4/5] bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
        {mode === 'camera' && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Voice UI */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
           <button 
             onClick={(e) => { e.preventDefault(); toggleRecording(); }} 
             className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : audioBase64 ? 'bg-emerald-500' : 'bg-white/10 backdrop-blur-md'}`}
           >
              {isRecording ? <div className="w-3 h-3 bg-white rounded-sm"></div> : audioBase64 ? <span className="text-white text-xs">✓</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1v10m0 0a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v3a3 3 0 0 0 3 3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2m7 11v-3"/></svg>}
           </button>
           <span className="text-[8px] font-black uppercase text-white/50 tracking-widest">{isRecording ? "Listening..." : audioBase64 ? "Voice Recorded" : "Tap to record voice (optional)"}</span>
        </div>
      </div>

      <div className="flex w-full gap-4">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Back</Button>
        <Button onClick={handleCapture} fullWidth className="flex-[2]">Analyze</Button>
      </div>
    </div>
  );
};

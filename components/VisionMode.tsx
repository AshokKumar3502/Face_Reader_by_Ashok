
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: true 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Force play for mobile compatibility
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error("Video play failed", e));
              setIsCameraReady(true);
            };
          }
        } catch (err) { 
          console.error("Camera access denied or failed", err);
          alert("Please enable camera permissions to use Kosha.");
          setMode('upload');
        }
      };
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const toggleRecording = () => {
    if (!isRecording) {
      if (!streamRef.current) return;
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
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
        // Automatically stop recording after 7 seconds for efficiency
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') stopRecording();
        }, 7000);
      } catch (err) {
        console.error("Audio recording failed", err);
      }
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
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl, 1, audioBase64 || undefined);
      }
    } else if (mode === 'upload') {
       // Placeholder for file input logic
       alert("Please use the Camera mode for real-time analysis.");
    } else {
       alert("Camera is still warming up. Please wait a moment.");
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fade-in z-20 px-2 sm:px-0">
      <div className="flex w-full bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/10">
         <button onClick={() => setMode('camera')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'camera' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-white/60'}`}>Camera</button>
         <button onClick={() => setMode('upload')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'upload' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white/60'}`}>Upload</button>
      </div>

      <div className="relative w-full aspect-[4/5] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
        {mode === 'camera' ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror-mode" 
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">☁️</div>
             <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Select an image from your device</p>
             <input type="file" accept="image/*" className="mt-4 text-[10px] text-white/40 font-black cursor-pointer" />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Voice Trigger */}
        {mode === 'camera' && (
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
             <button 
               onClick={(e) => { e.preventDefault(); toggleRecording(); }} 
               className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-500 animate-pulse scale-110' : audioBase64 ? 'bg-emerald-500 border-2 border-white/20' : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'}`}
             >
                {isRecording ? (
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                ) : audioBase64 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1v10m0 0a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v3a3 3 0 0 0 3 3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2m7 11v-3"/></svg>
                )}
             </button>
             <span className="text-[9px] font-black uppercase text-white/60 tracking-[0.3em] drop-shadow-md">
               {isRecording ? "Listening..." : audioBase64 ? "Vocal Signature Captured" : "Hold to add voice (Optional)"}
             </span>
          </div>
        )}
      </div>

      <div className="flex w-full gap-4">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleCapture} disabled={mode === 'camera' && !isCameraReady} fullWidth className="flex-[2] py-5">Analyze Reflection</Button>
      </div>
      
      <style>{`
        .mirror-mode { transform: scaleX(-1); }
      `}</style>
    </div>
  );
};

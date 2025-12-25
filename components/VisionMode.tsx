
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
            audio: true 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                // Multi-stage Hardware Verification
                let checkAttempts = 0;
                const checkReady = setInterval(() => {
                  checkAttempts++;
                  // Update calibration UI progress
                  setCalibrationProgress(Math.min(checkAttempts * 10, 100));

                  if (videoRef.current && videoRef.current.readyState >= 3 && videoRef.current.videoWidth > 0) {
                    // Small additional delay for sensor exposure adjustment
                    setTimeout(() => {
                      setIsCameraReady(true);
                      setCalibrationProgress(100);
                      clearInterval(checkReady);
                    }, 800);
                  }
                  
                  if (checkAttempts > 50) { // Timeout after 5 seconds
                    clearInterval(checkReady);
                    setMode('upload');
                  }
                }, 100);
              }).catch(e => console.error("Hardware Play Error", e));
            };
          }
        } catch (err) { 
          console.error("Camera Hardware Access Denied:", err);
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
        setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') stopRecording(); }, 6000);
      } catch (err) { console.error("Neural Voice Sync Error", err); }
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
    if (videoRef.current && canvasRef.current && isCameraReady && !isCapturing) {
      setIsCapturing(true);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Final frame extraction
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Deep verification: ensures image is not black
        const pixelData = ctx.getImageData(0, 0, 10, 10).data;
        let sum = 0;
        for (let i = 0; i < pixelData.length; i += 4) {
          sum += pixelData[i] + pixelData[i+1] + pixelData[i+2];
        }
        
        if (sum === 0) {
          alert("Mirror check failed. Re-syncing hardware...");
          setIsCapturing(false);
          setIsCameraReady(false);
          // Force a small reload/re-warmup if blank
          return;
        }

        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl, 1, audioBase64 || undefined);
      }
    } else if (!isCameraReady) {
       alert("Lens is still calibrating. Please wait...");
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fade-in z-20 px-4 sm:px-0">
      <div className="flex w-full bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-lg">
         <button onClick={() => setMode('camera')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'camera' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white/60'}`}>Live Mirror</button>
         <button onClick={() => setMode('upload')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'upload' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white/60'}`}>File Sync</button>
      </div>

      <div className="relative w-full aspect-[4/5] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
        {mode === 'camera' ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror-mode transition-opacity duration-1000" style={{ opacity: isCameraReady ? 1 : 0.3 }} />
            {!isCameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                <div className="relative w-12 h-12 mb-6">
                   <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
                   <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Calibrating Lens...</p>
                <div className="mt-4 w-32 h-[1px] bg-white/5 overflow-hidden">
                   <div className="h-full bg-white transition-all duration-300" style={{ width: `${calibrationProgress}%` }}></div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-black/10 transition-opacity group-hover:opacity-0 opacity-100"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-zinc-900/40">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-3xl border border-white/10 shadow-2xl animate-pulse">📸</div>
             <input type="file" accept="image/*" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onloadend = () => onCapture(reader.result as string, 1);
                 reader.readAsDataURL(file);
               }
             }} className="text-[10px] text-white/40 font-black cursor-pointer bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors w-full" />
             <p className="mt-4 text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-black">Neural Import Pattern</p>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {mode === 'camera' && isCameraReady && (
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none">
             <button 
               onClick={(e) => { e.preventDefault(); toggleRecording(); }} 
               className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : audioBase64 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'}`}
             >
                {isRecording ? <div className="w-4 h-4 bg-white rounded-sm"></div> : audioBase64 ? <span className="text-white text-xl">✓</span> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1v10m0 0a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v3a3 3 0 0 0 3 3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2m7 11v-3"/></svg>}
             </button>
             <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.4em] drop-shadow-lg">
               {isRecording ? "Recording Soul..." : audioBase64 ? "Vocal DNA Cached" : "Voice Signature"}
             </span>
          </div>
        )}
      </div>

      <div className="flex w-full gap-4">
        <Button variant="secondary" onClick={onCancel} className="flex-1 py-5 opacity-60 hover:opacity-100">Cancel</Button>
        <Button onClick={handleCapture} disabled={(mode === 'camera' && !isCameraReady) || isCapturing} fullWidth className="flex-[2] py-5 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)]">
          {isCapturing ? "Processing..." : isCameraReady ? "Synthesize Reflection" : "Warming Up..."}
        </Button>
      </div>
      
      <style>{` .mirror-mode { transform: scaleX(-1); } `}</style>
    </div>
  );
};

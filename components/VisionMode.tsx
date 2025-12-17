import React, { useRef, useEffect, useState } from 'react';
import { Button } from './Button';
import { UserContext } from '../types';

interface VisionModeProps {
  context: UserContext;
  onCapture: (base64: string, manualDay?: number) => void;
  onCancel: () => void;
}

export const VisionMode: React.FC<VisionModeProps> = ({ context, onCapture, onCancel }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
     setSelectedDay(1);
  }, []);

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Camera denied", err);
        }
      };
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
        onCapture(dataUrl, selectedDay);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = () => {
    if (!previewImage || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        const ctx = canvasRef.current.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const compressedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
        onCapture(compressedDataUrl, selectedDay);
      }
    };
    img.src = previewImage;
  };

  const getContextLabel = () => {
    switch(context) {
        case 'WAKING_UP': return "Wake up";
        case 'WORK': return "Work";
        case 'EVENING': return "Evening";
        case 'BEFORE_SLEEP': return "Going to sleep";
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 sm:gap-6 animate-fade-in z-20 px-2 sm:px-0">
      
      {/* Context Badge */}
      <div className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
         <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white font-bold">{getContextLabel()}</span>
      </div>

      {/* Control Bar: Mode & Day */}
      <div className="flex items-stretch gap-3 sm:gap-4 w-full">
        {/* Mode Switcher */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl p-1 rounded-lg sm:rounded-xl border border-white/20 flex shadow-lg">
          <button 
            onClick={() => setMode('camera')}
            className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${mode === 'camera' ? 'bg-zinc-700/80 text-white shadow-md ring-1 ring-white/20' : 'text-zinc-400 hover:text-white'}`}
          >
            Camera
          </button>
          <button 
            onClick={() => setMode('upload')}
            className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${mode === 'upload' ? 'bg-zinc-700/80 text-white shadow-md ring-1 ring-white/20' : 'text-zinc-400 hover:text-white'}`}
          >
            Upload
          </button>
        </div>

        {/* Custom Day Selector */}
        <div className="relative">
          <button 
             onClick={() => setIsDaySelectorOpen(!isDaySelectorOpen)}
             className="h-full px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-xl border border-white/20 text-white text-[10px] sm:text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5 sm:gap-2 min-w-[70px] sm:min-w-[80px] justify-center shadow-lg"
          >
             Day {selectedDay}
             {/* Fix: Replaced invalid sm:width/sm:height props with responsive Tailwind classes */}
             <svg viewBox="0 0 10 6" fill="none" className={`w-2 h-1.25 sm:w-2.5 sm:h-1.5 transition-transform ${isDaySelectorOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </button>
          
          {isDaySelectorOpen && (
             <div className="absolute top-full right-0 mt-2 w-28 sm:w-32 bg-zinc-800 border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50 py-1">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                   <button
                      key={day}
                      onClick={() => { setSelectedDay(day); setIsDaySelectorOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs hover:bg-zinc-700 transition-colors ${selectedDay === day ? 'text-teal-300 font-bold bg-zinc-700/50' : 'text-zinc-300'}`}
                   >
                      Day {day}
                   </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Main Viewfinder */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/5] bg-black rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 group">
        {mode === 'camera' ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-90"
            />
            {/* HUD Overlay */}
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
               <div className="flex justify-between opacity-30 sm:opacity-50">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-white rounded-tl-lg shadow-sm"></div>
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-white rounded-tr-lg shadow-sm"></div>
               </div>
               <div className="flex justify-center items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                     <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                  </div>
               </div>
               <div className="flex justify-between opacity-30 sm:opacity-50">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-white rounded-bl-lg shadow-sm"></div>
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-white rounded-br-lg shadow-sm"></div>
               </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-zinc-900/50">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-white/5 transition-colors"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center mb-4 sm:mb-6 text-zinc-400 group-hover:scale-110 transition-transform shadow-xl">
                  {/* Fix: Replaced invalid sm:width/sm:height props with responsive Tailwind classes */}
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-zinc-200 text-sm sm:text-base font-bold">Tap to upload</p>
                <p className="text-zinc-500 text-[10px] sm:text-xs mt-2">Supports JPG, PNG</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        )}
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="text-center space-y-1 sm:space-y-2">
        <p className="text-white font-serif-display text-lg sm:text-xl tracking-wide opacity-90 drop-shadow-md">
          {mode === 'camera' ? 'Breathe out.' : 'Choose your moment.'}
        </p>
        <p className="text-zinc-400 text-[9px] sm:text-[10px] tracking-[0.1em] uppercase">
          {mode === 'camera' ? 'Natural Expression Only' : 'Wait for the truth'}
        </p>
      </div>
      
      {mode === 'upload' && previewImage && (
         <div className="text-center">
            <button onClick={() => { setPreviewImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
               Change Photo
            </button>
         </div>
      )}

      <div className="flex w-full gap-3 sm:gap-4 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1 border-white/20 text-zinc-300 hover:text-white text-xs sm:text-sm">
          Back
        </Button>
        <Button 
          fullWidth 
          onClick={mode === 'camera' ? handleCapture : handleUploadConfirm} 
          disabled={mode === 'upload' && !previewImage}
          className="flex-[2] shadow-emerald-500/20 text-xs sm:text-sm"
        >
          {mode === 'camera' ? 'Capture' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};
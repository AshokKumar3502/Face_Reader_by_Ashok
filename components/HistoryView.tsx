
import React, { useState, useEffect } from 'react';
import { getJournal, clearJournal } from '../services/storageService';
import { JournalEntry, WeeklyInsight } from '../types';
import { InsightCard } from './InsightCard';
import { generateWeeklyReport } from '../services/geminiService';
import { WeeklyReport } from './WeeklyReport';
import { Button } from './Button';

interface HistoryViewProps {
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  // Weekly Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);

  useEffect(() => {
    const data = getJournal();
    setEntries(data.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to delete all history?")) {
      clearJournal();
      setEntries([]);
    }
  };

  const handleWeeklyAnalysis = async () => {
    if (entries.length < 2) return; 
    setIsAnalyzing(true);
    try {
      const recentEntries = entries.slice(0, 14); 
      const report = await generateWeeklyReport(recentEntries);
      setWeeklyInsight(report);
    } catch (e) {
      console.error(e);
      alert("Could not generate report. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const grouped = entries.reduce((acc, entry) => {
    const day = `Day ${entry.dayNumber}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  if (weeklyInsight) {
    return <WeeklyReport data={weeklyInsight} onClose={() => setWeeklyInsight(null)} />;
  }

  if (selectedEntry) {
    return (
      <div className="w-full">
         <div className="mb-6">
            <button onClick={() => setSelectedEntry(null)} className="group flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
               <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </button>
         </div>
         {selectedEntry.image && (
             <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
               <img src={selectedEntry.image} alt="Recorded mood" className="w-full h-full object-cover" />
               <div className="absolute bottom-8 left-8 text-white">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                   {new Date(selectedEntry.timestamp).toLocaleString([], {
                     weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                   })}
                 </div>
               </div>
             </div>
         )}
         <InsightCard 
            data={selectedEntry.insight} 
            onReset={() => setSelectedEntry(null)} 
            readonly 
         />
      </div>
    );
  }

  if (viewingImage) {
      return (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade-in" onClick={() => setViewingImage(null)}>
              <div className="relative max-w-full max-h-full">
                  <img src={viewingImage} className="max-w-full max-h-[80vh] rounded-[2rem] shadow-2xl border border-white/20" alt="Full view" />
                  <p className="text-center text-zinc-500 mt-8 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Tap to close</p>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full max-w-lg animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-4xl font-serif-display text-white italic">Journal</h2>
           <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Evolution Timeline</p>
        </div>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-6 py-3 rounded-xl border border-white/5 hover:bg-white/5">Close</button>
      </div>

      {entries.length >= 2 && (
         <div className="mb-12">
            <button 
              onClick={handleWeeklyAnalysis}
              disabled={isAnalyzing}
              className="w-full relative group overflow-hidden rounded-[2rem] p-8 bg-zinc-900 border border-white/10 text-left transition-all hover:bg-zinc-800"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-all"></div>
               <div className="flex items-center justify-between">
                  <div className="space-y-2">
                     <h3 className="text-indigo-300 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        {isAnalyzing ? (
                           <>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              Synthesizing...
                           </>
                        ) : (
                           <>
                              <span>✨</span> Weekly Insight
                           </>
                        )}
                     </h3>
                     <p className="text-white font-serif-display text-xl italic leading-tight">
                        Deep Meta-Analysis
                     </p>
                     <p className="text-zinc-500 text-[10px] font-medium leading-relaxed max-w-[200px]">
                        Review the hidden patterns of your past 7 days.
                     </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:border-white/30 transition-all">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
               </div>
            </button>
         </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
          <p className="text-zinc-500 font-serif-display text-2xl mb-2 italic">A blank page</p>
          <p className="text-zinc-700 text-[10px] uppercase font-black tracking-widest">Capture your first reflection</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([dayLabel, rawEntries]) => {
            const dayEntries = rawEntries as JournalEntry[];
            const firstEntry = dayEntries[0];
            const dateStr = new Date(firstEntry.timestamp).toLocaleDateString([], { 
              month: 'long', day: 'numeric' 
            });
            
            return (
            <div key={dayLabel} className="relative">
              <div className="absolute left-5 top-14 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent -z-10"></div>
              
              <div className="flex items-center gap-5 mb-8">
                 <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-10">
                    {dayLabel.split(' ')[1]}
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-2xl font-serif-display text-white italic">
                        {dayLabel}
                    </h3>
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">{dateStr}</span>
                 </div>
              </div>
              
              <div className="pl-14 space-y-6">
                {dayEntries.some(e => e.image) && (
                   <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {dayEntries.map(entry => (
                          entry.image && (
                              <div key={`img-${entry.id}`} className="shrink-0 w-24 h-32 rounded-2xl overflow-hidden border border-white/10 relative group transition-all hover:scale-105 active:scale-95 shadow-xl">
                                  <img 
                                    src={entry.image} 
                                    className="w-full h-full object-cover cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity" 
                                    onClick={() => setViewingImage(entry.image)}
                                    alt="Thumbnail"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                  <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-white/40 font-black tracking-tighter uppercase">
                                    {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                              </div>
                          )
                      ))}
                   </div>
                )}

                {dayEntries.map(entry => (
                  <button 
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all hover:border-white/10 group relative overflow-hidden backdrop-blur-3xl"
                  >
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] text-zinc-600 font-black tracking-widest">
                         {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    
                    <h4 className="text-zinc-300 text-sm font-serif-display italic leading-relaxed group-hover:text-white transition-colors">
                      "{entry.insight.psychProfile}"
                    </h4>
                  </button>
                ))}
              </div>
            </div>
          )})}

          <div className="pt-16 flex justify-center">
             <Button variant="danger" onClick={handleClear} className="w-full max-w-xs">
                Purge All History
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

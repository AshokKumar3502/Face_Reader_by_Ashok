import React, { useState, useEffect } from 'react';
import { getJournal, clearJournal } from '../services/storageService';
import { JournalEntry, WeeklyInsight } from '../types';
import { InsightCard } from './InsightCard';
import { generateWeeklyReport } from '../services/geminiService';
import { WeeklyReport } from './WeeklyReport';

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
      // Take up to the last 14 entries for analysis
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

  const getContextLabel = (ctx: string) => {
    const map: Record<string, string> = {
      'WAKING_UP': 'Morning',
      'WORK': 'Work',
      'FAMILY': 'Family',
      'SOCIAL': 'Friends',
      'BEFORE_SLEEP': 'Night'
    };
    return map[ctx] || ctx;
  };

  const grouped = entries.reduce((acc, entry) => {
    const day = `Day ${entry.dayNumber}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  // --- RENDER MODALS ---

  if (weeklyInsight) {
    return <WeeklyReport data={weeklyInsight} onClose={() => setWeeklyInsight(null)} />;
  }

  if (selectedEntry) {
    return (
      <div className="w-full">
         <div className="mb-6">
            <button onClick={() => setSelectedEntry(null)} className="group flex items-center gap-2 text-zinc-400 text-sm hover:text-white transition-colors">
               <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Journal
            </button>
         </div>
         {selectedEntry.image && (
             <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-8 border border-white/10 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
               <img src={selectedEntry.image} alt="Recorded mood" className="w-full h-full object-cover" />
               <div className="absolute bottom-6 left-6 text-white">
                 <div className="font-serif-display text-2xl mb-1">{getContextLabel(selectedEntry.context)}</div>
                 <div className="font-mono text-xs opacity-80">
                   {new Date(selectedEntry.timestamp).toLocaleString([], {
                     weekday: 'short', 
                     month: 'short', 
                     day: 'numeric', 
                     hour: '2-digit', 
                     minute: '2-digit'
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
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in" onClick={() => setViewingImage(null)}>
              <div className="relative max-w-full max-h-full">
                  <img src={viewingImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10" alt="Full view" />
                  <p className="text-center text-zinc-400 mt-6 text-sm font-medium tracking-wide">Tap anywhere to close</p>
              </div>
          </div>
      )
  }

  // --- MAIN VIEW ---

  return (
    <div className="w-full max-w-lg animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-serif-display text-white">Journal</h2>
           <p className="text-zinc-500 text-sm mt-1">Your emotional timeline</p>
        </div>
        <button onClick={onBack} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Close</button>
      </div>

      {/* Weekly Analysis Trigger */}
      {entries.length >= 2 && (
         <div className="mb-10">
            <button 
              onClick={handleWeeklyAnalysis}
              disabled={isAnalyzing}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px]"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/50 via-purple-500/50 to-amber-500/50 animate-[shimmer_2s_infinite] opacity-70 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative bg-zinc-900 rounded-2xl p-5 flex items-center justify-between group-hover:bg-zinc-800 transition-colors">
                  <div>
                     <h3 className="text-amber-200 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                        {isAnalyzing ? (
                           <>
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                              Analyzing...
                           </>
                        ) : (
                           <>
                              <span>✨</span> Unlock Weekly Insight
                           </>
                        )}
                     </h3>
                     <p className="text-zinc-500 text-xs mt-1">AI Meta-Analysis of your past week.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                     →
                  </div>
               </div>
            </button>
         </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/5 rounded-3xl bg-white/5">
          <p className="text-zinc-400 font-serif-display text-xl mb-2">Empty Pages</p>
          <p className="text-zinc-600 text-sm">Your journey begins with a single photo.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([dayLabel, rawEntries]) => {
            const dayEntries = rawEntries as JournalEntry[];
            // Use date of the most recent entry in this group
            const firstEntry = dayEntries[0];
            const dateStr = new Date(firstEntry.timestamp).toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric' 
            });
            
            return (
            <div key={dayLabel} className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-10 bottom-0 w-px bg-white/5 -z-10"></div>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 z-10">
                    {dayLabel.split(' ')[1]}
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-lg font-serif-display text-zinc-200 leading-none">
                        {dayLabel}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono mt-1 ml-0.5">{dateStr}</span>
                 </div>
              </div>
              
              <div className="pl-12 space-y-4">
                {/* Photo Strip */}
                {dayEntries.some(e => e.image) && (
                   <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mb-4">
                      {dayEntries.map(entry => (
                          entry.image && (
                              <div key={`img-${entry.id}`} className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-white/10 relative group transition-transform hover:scale-105">
                                  <img 
                                    src={entry.image} 
                                    className="w-full h-full object-cover cursor-pointer transition-opacity opacity-80 group-hover:opacity-100" 
                                    onClick={() => setViewingImage(entry.image)}
                                    alt="Thumbnail"
                                  />
                                  {/* Timestamp Overlay on Photo */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[8px] text-center text-white/80 font-mono backdrop-blur-sm">
                                    {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                              </div>
                          )
                      ))}
                   </div>
                )}

                {/* Entry Cards */}
                {dayEntries.map(entry => (
                  <button 
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left p-5 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-white/5 transition-all hover:border-white/10 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold tracking-widest text-teal-500/80 uppercase">
                         {getContextLabel(entry.context)}
                       </span>
                       <span className="text-[10px] text-zinc-600 font-mono">
                         {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    
                    <h4 className="text-zinc-300 text-sm font-serif-display leading-relaxed group-hover:text-white transition-colors">
                      "{entry.insight.psychProfile}"
                    </h4>
                  </button>
                ))}
              </div>
            </div>
          )})}

          <div className="pt-12 text-center pb-8">
             <button onClick={handleClear} className="text-xs font-bold text-red-900/40 hover:text-red-500 transition-colors uppercase tracking-widest">
                Delete All History
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
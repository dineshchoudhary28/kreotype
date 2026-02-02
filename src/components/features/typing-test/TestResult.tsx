"use client";

import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useResultStore } from "@/store/useResultStore";
import { useConfigStore } from "@/store/useConfigStore";
import { WordsDisplay } from "./WordsDisplay";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  Star, 
  ChevronRight, 
  RotateCcw, 
  TriangleAlert, 
  Image as ImageIcon,
  AlignLeft,
  Rewind
} from "lucide-react";

const ResultChart = lazy(() => import("./ResultChart").then((m) => ({ default: m.ResultChart })));

interface TestResultProps {
  onRestart: () => void;
  onRepeat: () => void;
  onPractice: () => void;
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function TestResult({ onRestart, onRepeat, onPractice }: TestResultProps) {
  const result = useResultStore((s) => s.result);
  const alwaysShowWordsHistory = useConfigStore((s) => s.alwaysShowWordsHistory);
  
  // Chart visibility state
  const [showWpm, setShowWpm] = useState(true);
  const [showRaw, setShowRaw] = useState(true);
  const [showBurst, setShowBurst] = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [showWordsHistory, setShowWordsHistory] = useState(alwaysShowWordsHistory);

  if (!result) return null;

  return (
    <motion.div
      className="w-full max-w-6xl flex flex-col font-mono h-[calc(100vh-140px)] py-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      variants={staggerContainer}
    >
      {/* SECTION 1: Main Stats & Secondary Stats Grid */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start md:items-end flex-shrink-0 px-4">
        {/* Main Stats (WPM / Acc) */}
        <motion.div className="flex gap-12 items-baseline" variants={fadeUp}>
          <div>
            <div className="text-2xl text-secondary mb-1">wpm</div>
            <div className="text-7xl font-bold text-primary leading-none">{Math.round(result.wpm)}</div>
          </div>
          <div>
            <div className="text-2xl text-secondary mb-1">acc</div>
            <div className="text-7xl font-bold text-primary leading-none">{Math.round(result.accuracy)}%</div>
          </div>
        </motion.div>

        {/* Secondary Stats Grid */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm pb-2" variants={fadeUp}>
           {/* Row 1 */}
           <div>
            <div className="text-xs text-secondary">test type</div>
            <div className="text-text font-medium">time 60<br/>english</div>
          </div>
          <div>
            <div className="text-xs text-secondary">raw</div>
            <div className="text-2xl text-text font-medium leading-none">{Math.round(result.rawWpm)}</div>
          </div>
          <div>
             <div className="text-xs text-secondary">characters</div>
             <div className="text-2xl text-text font-medium leading-none">
               {result.correctChars}/{result.incorrectChars}/{result.extraChars}/{result.missedChars}
             </div>
          </div>
           {/* Row 2 */}
          <div>
             <div className="text-xs text-secondary">consistency</div>
             <div className="text-2xl text-text font-medium leading-none">{Math.round(result.consistency)}%</div>
          </div>
          <div>
             <div className="text-xs text-secondary">time</div>
             <div className="text-2xl text-text font-medium leading-none">{result.time}s</div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 2: Chart with Legend OR Words History */}
      <motion.div variants={fadeUp} className="w-full flex-1 min-h-0 flex flex-col px-4 relative group">
        {/* Legend / Toggles */}
        {!showWordsHistory && (
          <div className="flex justify-center gap-4 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-2 right-4 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-lg">
             <button 
               onClick={() => setShowWpm(!showWpm)}
               className={cn("text-xs px-2 py-1 rounded transition-colors border", showWpm ? "border-primary text-primary" : "border-transparent text-secondary hover:text-text")}
             >
               wpm
             </button>
             <button 
               onClick={() => setShowRaw(!showRaw)}
               className={cn("text-xs px-2 py-1 rounded transition-colors border", showRaw ? "border-secondary text-secondary" : "border-transparent text-secondary hover:text-text")}
             >
               raw
             </button>
             <button 
               onClick={() => setShowBurst(!showBurst)}
               className={cn("text-xs px-2 py-1 rounded transition-colors border", showBurst ? "border-error-extra text-error-extra" : "border-transparent text-secondary hover:text-text")}
             >
               burst
             </button>
             <button 
               onClick={() => setShowErrors(!showErrors)}
               className={cn("text-xs px-2 py-1 rounded transition-colors border", showErrors ? "border-error text-error" : "border-transparent text-secondary hover:text-text")}
             >
               errors
             </button>
          </div>
        )}

        <div className="flex-1 w-full min-h-0 overflow-hidden relative">
          {showWordsHistory ? (
            <div className="absolute inset-0 overflow-y-auto">
                <WordsDisplay showHistory={true} />
            </div>
          ) : (
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-secondary/10 rounded" />}>
              <ResultChart
                wpmHistory={result.wpmHistory}
                rawHistory={result.rawHistory}
                burstHistory={result.burstHistory}
                errorHistory={result.errorHistory}
                showWpm={showWpm}
                showRaw={showRaw}
                showBurst={showBurst}
                showErrors={showErrors}
              />
            </Suspense>
          )}
        </div>
      </motion.div>
      
      {/* SECTION 3: Action Toolbar */}
       <motion.div variants={fadeUp} className="flex justify-center gap-6 px-4 py-2 flex-shrink-0">
         <button
           onClick={onRestart}
           className="group flex flex-col items-center gap-1 text-secondary hover:text-text transition-colors"
           title="Next Test"
           autoFocus
         >
           <ChevronRight size={20} className="group-hover:text-text" />
         </button>
         <button
           onClick={onRepeat}
           className="group flex flex-col items-center gap-1 text-secondary hover:text-text transition-colors"
           title="Repeat Test"
         >
           <RotateCcw size={18} className="group-hover:text-text" />
         </button>
         <button
           onClick={onPractice}
           className="group flex flex-col items-center gap-1 text-secondary hover:text-text transition-colors"
           title="Practice Words"
         >
           <TriangleAlert size={18} className="group-hover:text-text" />
         </button>
         <button
           onClick={() => setShowWordsHistory(!showWordsHistory)}
           className={cn("group flex flex-col items-center gap-1 transition-colors", showWordsHistory ? "text-primary" : "text-secondary hover:text-text")}
           title="Toggle Words History"
         >
           <AlignLeft size={18} className="group-hover:text-text" />
         </button>
         <button
           className="group flex flex-col items-center gap-1 text-secondary hover:text-text transition-colors"
           title="Watch Replay"
         >
           <Rewind size={18} className="group-hover:text-text" />
         </button>
         <button
           className="group flex flex-col items-center gap-1 text-secondary hover:text-text transition-colors"
           title="Copy Screenshot"
         >
           <ImageIcon size={18} className="group-hover:text-text" />
         </button>
       </motion.div>

      {/* SECTION 4: Ad Banner (Bottom, 16:9, centered) */}
      <motion.div variants={fadeUp} className="w-full flex justify-center flex-shrink-0 pb-2">
        <a 
          href="https://kreo-tech.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative block w-64 aspect-video bg-surface/30 border border-secondary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
        >
          <div className="absolute inset-0 p-3 flex flex-col justify-between">
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-surface px-1.5 py-0.5 rounded text-secondary border border-secondary/20">Ad</span>
               </div>
               <Star size={14} className="text-primary fill-current" />
            </div>
            
            <div className="mt-auto">
               <h3 className="text-xs font-bold text-text group-hover:text-primary transition-colors leading-tight mb-1">Kreo Hive</h3>
               <div className="flex items-center gap-1 text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                 Shop <ArrowRight size={10} />
               </div>
            </div>
          </div>
        </a>
      </motion.div>
    </motion.div>
  );
}

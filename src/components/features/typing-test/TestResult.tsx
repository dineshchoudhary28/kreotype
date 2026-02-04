"use client";

import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useResultStore, type SaveStatus } from "@/store/useResultStore";
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
import { getPageWidthClass } from "@/lib/page-width";

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

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const labels: Record<SaveStatus, { text: string; color: string }> = {
    idle: { text: "", color: "" },
    saving: { text: "saving...", color: "text-secondary" },
    saved: { text: "saved", color: "text-primary" },
    failed: { text: "not saved", color: "text-error" },
    unauthenticated: { text: "log in to save results", color: "text-secondary" },
  };
  const { text, color } = labels[status];
  return <span className={`text-xs ${color}`}>{text}</span>;
}

export function TestResult({ onRestart, onRepeat, onPractice }: TestResultProps) {
  const result = useResultStore((s) => s.result);
  const error = useResultStore((s) => s.error);
  const saveStatus = useResultStore((s) => s.saveStatus);
  const alwaysShowWordsHistory = useConfigStore((s) => s.alwaysShowWordsHistory);
  const mode = useConfigStore((s) => s.mode);
  const time = useConfigStore((s) => s.time);
  const words = useConfigStore((s) => s.words);
  const language = useConfigStore((s) => s.language);
  const pageWidth = useConfigStore((s) => s.pageWidth);

  const mode2 = mode === "time" ? time : mode === "words" ? words : "";
  const testTypeLabel = `${mode} ${mode2}`.trim();

  // Chart visibility state
  const [showWpm, setShowWpm] = useState(true);
  const [showRaw, setShowRaw] = useState(true);
  const [showBurst, setShowBurst] = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [showWordsHistory, setShowWordsHistory] = useState(alwaysShowWordsHistory);

  if (!result) {
    if (error) {
      return (
        <div
          className={`w-full ${getPageWidthClass(pageWidth)} flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4`}
        >
          <p className="text-secondary text-sm">Something went wrong calculating your results.</p>
          <p className="text-secondary/60 text-xs">{error}</p>
          <button
            onClick={onRestart}
            className="px-4 py-2 text-sm text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
          >
            Try another test
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <motion.div
      className={`w-full ${getPageWidthClass(pageWidth)} flex flex-col h-[calc(100vh-140px)] py-2 gap-4`}
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
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-base pb-2" variants={fadeUp}>
           {/* Row 1 */}
           <div>
            <div className="text-sm text-secondary">test type</div>
            <div className="text-text font-medium text-base">{testTypeLabel}<br/>{language}</div>
          </div>
          <div>
            <div className="text-sm text-secondary">raw</div>
            <div className="text-3xl text-text font-medium leading-none">{Math.round(result.rawWpm)}</div>
          </div>
          <div>
             <div className="text-sm text-secondary">characters</div>
             <div className="text-3xl text-text font-medium leading-none">
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
       <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 px-4 py-2 flex-shrink-0">
         <SaveStatusIndicator status={saveStatus} />
         <div className="flex justify-center gap-6">
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
         </div>
       </motion.div>

      {/* SECTION 4: Ad Banner */}
      <motion.div variants={fadeUp} className="w-full flex justify-center flex-shrink-0 pb-2">
        <a
          href="https://kreo-tech.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-72 rounded-xl overflow-hidden group"
        >
          {/* Shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite] -translate-x-full"
               style={{ animation: "shimmer 3s ease-in-out infinite" }} />
          <div className="relative flex items-center gap-3 px-4 py-3 bg-surface/20 border border-secondary/10 rounded-xl backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Star size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-text group-hover:text-primary transition-colors">Kreo Hive</div>
              <div className="text-[10px] text-secondary">Keyboards & gear</div>
            </div>
            <ArrowRight size={14} className="text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </a>
      </motion.div>
    </motion.div>
  );
}

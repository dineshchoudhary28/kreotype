"use client";

import { TestStats, useTypingTestStore } from "@/store/useTypingTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useSession } from "next-auth/react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { RefreshCw, ChevronRight, Share2, Info, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { CompletedEventInput } from "@/server/validators/result";


const swarm65Images = [
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Frame1000006038.png?v=1764739426&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.622.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.623.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.626.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.624.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.620.png?v=1764825408&width=1080"
];

const swarmWhiteImages = [
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.489.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.491.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.490.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.427_ded55aee-2e01-4dcc-bc87-79d332dbbaed.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.493.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.494.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.429.png?v=1763559972&width=1080"
];

interface TestResultsProps {
  stats: TestStats;
  onRestart: () => void;
  onNext: () => void;
}

export function TestResults({ stats, onRestart, onNext }: TestResultsProps) {
  const { status } = useSession();
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const language = useConfigStore((s) => s.language);
  const testId = useTypingTestStore((s) => s.testId);
  const isSaved = useTypingTestStore((s) => s.isSaved);
  const setSaved = useTypingTestStore((s) => s.setSaved);
  const isSyncing = useTypingTestStore((s) => s.isSyncing);

  const [swarm65Index, setSwarm65Index] = useState(0);
  const [swarmWhiteIndex, setSwarmWhiteIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const saveAttemptedRef = useRef(false);

  const saveToLocalStorage = (data: CompletedEventInput & { testId: string }) => {
    try {
      const localResults = JSON.parse(localStorage.getItem("kreotype_local_results") || "[]");
      // Deduplicate: skip if testId already exists (e.g. React StrictMode re-render)
      if (localResults.some((r: { testId: string }) => r.testId === data.testId)) return;
      localResults.push(data);
      // Keep only last 50 local results
      if (localResults.length > 50) localResults.shift();
      localStorage.setItem("kreotype_local_results", JSON.stringify(localResults));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  };

  useEffect(() => {
    const performSave = async () => {
      // Use ref to prevent double-execution from React re-renders / StrictMode
      if (saveAttemptedRef.current || isSaved || isSyncing || status === "loading") return;
      saveAttemptedRef.current = true;
      setSaved(true);

      // Cheating detection
      const afkCount = useTypingTestStore.getState().afkCount;
      const tabCount = useTypingTestStore.getState().tabCount;
      const blurCount = useTypingTestStore.getState().blurCount;
      const totalAfkDuration = useTypingTestStore.getState().totalAfkDuration;
      const invalidReasons: string[] = [];
      if (afkCount > 0) invalidReasons.push(`afk:${afkCount}`);
      if (tabCount > 0) invalidReasons.push(`tab:${tabCount}`);
      if (blurCount > 0) invalidReasons.push(`blur:${blurCount}`);
      const isValid = invalidReasons.length === 0;

      // Add testId to the type
      const resultData: CompletedEventInput & { testId: string } = {
        testId, // Send client testId for server-side deduplication
        wpm: stats.wpm,
        rawWpm: stats.rawWpm,
        accuracy: stats.accuracy,
        consistency: stats.consistency,
        keyConsistency: stats.keyConsistency,
        mode: mode as "time" | "words" | "zen",
        mode2: mode === "time" || mode === "words" ? (parseInt(value) || value) : value,
        timestamp: Date.now(),
        testDuration: stats.time,
        afkDuration: totalAfkDuration,
        charStats: {
          correct: stats.correctChars,
          incorrect: stats.incorrectChars,
          extra: stats.extraChars,
          missed: stats.missedChars,
        },
        keypressTimings: {
          spacing: stats.keypressTimings.spacing,
          duration: stats.keypressTimings.duration,
          keyOverlap: 0,
          startToFirstKey: 0,
          lastKeyToEnd: 0,
        },
        wpmHistory: stats.wpmHistory,
        rawHistory: stats.rawWpmHistory,
        burstHistory: stats.burstHistory,
        errorHistory: stats.errorHistory,
        language: language,
        difficulty: "normal",
        punctuation: punctuation,
        numbers: numbers,
        blindMode: false,
        validation: {
          isValid,
          invalidReasons,
        },
      };

      if (status === "authenticated") {
        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resultData),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.isPb && isValid) { // Only show PB toast if valid
              toast.success("New Personal Best!", {
                description: `You set a new PB of ${stats.wpm} WPM!`,
              });
            }
          } else {
            saveToLocalStorage(resultData);
            toast.error("Failed to sync with server, saved locally");
          }
        } catch {
          saveToLocalStorage(resultData);
          toast.error("Network error, saved locally");
        }
      } else if (status === "unauthenticated") {
        saveToLocalStorage(resultData);
        toast.info("Result saved locally", {
          description: "Log in to sync your results to your profile.",
        });
      }
    };

    performSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, testId]);

  const handleShare = async () => {
    if (!shareRef.current) return;

    setIsSharing(true);
    // Give a tiny bit of time for any hover states to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Find the action buttons row to hide it temporarily
      const buttonsRow = shareRef.current.querySelector('.action-buttons-row') as HTMLElement;
      if (buttonsRow) buttonsRow.style.display = 'none';

      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        backgroundColor: '#000000', // Capture with a solid background
        style: {
          padding: '40px',
          borderRadius: '32px',
        }
      });

      if (buttonsRow) buttonsRow.style.display = '';

      const link = document.createElement('a');
      link.download = `kreotype-${stats.wpm}wpm-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to share results:", err);
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSwarm65Index((prev) => (prev + 1) % swarm65Images.length);
      setSwarmWhiteIndex((prev) => (prev + 1) % swarmWhiteImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Get cheating counts from store
  const afkCount = useTypingTestStore(s => s.afkCount);
  const tabCount = useTypingTestStore(s => s.tabCount);
  const blurCount = useTypingTestStore(s => s.blurCount);

  useEffect(() => {
    if (tabCount > 0 || blurCount > 0) {
      const message = [
        afkCount > 0 && `AFK: ${afkCount}`,
        tabCount > 0 && `Alt+Tab: ${tabCount}`,
        blurCount > 0 && `Blur: ${blurCount}`,
      ].filter(Boolean).join(' | ');

      toast.warning("Integrity Report", {
        description: message,
      });
    }
  }, [afkCount, tabCount, blurCount]);

  // Prepare data for the chart - ensure we have at least some data
  const chartData = stats.wpmHistory.length > 0
    ? stats.wpmHistory.map((wpm, index) => ({
      time: index + 1,
      wpm: wpm,
      raw: stats.rawWpmHistory[index] || wpm,
    }))
    : [{ time: 1, wpm: stats.wpm, raw: stats.rawWpm }];

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto py-8 md:py-12 px-4 md:px-6 gap-8 md:gap-12 animate-in fade-in zoom-in-95 duration-700">
      {/* Left Content Area (Stats & Graph) */}
      <div ref={shareRef} className="flex-1 flex flex-col min-w-0">
        {/* Main Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8 md:mb-10">
          <div className="md:col-span-3 flex flex-row md:flex-col justify-around md:justify-start md:gap-10">
            <div className="flex flex-col group">
              <span className="text-secondary text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] mb-1 opacity-50 group-hover:opacity-100 transition-opacity">wpm</span>
              <span className="text-primary text-5xl md:text-8xl font-black leading-none tabular-nums tracking-tighter">
                {stats.wpm}
              </span>
            </div>
            <div className="flex flex-col group">
              <span className="text-secondary text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] mb-1 opacity-50 group-hover:opacity-100 transition-opacity">accuracy</span>
              <span className="text-primary text-5xl md:text-8xl font-black leading-none tabular-nums tracking-tighter">
                {stats.accuracy}%
              </span>
            </div>
          </div>

          {/* Graph Section */}
          <div className="md:col-span-9 h-[250px] md:h-[400px] w-full bg-surface/40 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 relative group overflow-hidden border border-surface shadow-2xl">
            <div className="absolute top-4 md:top-6 left-4 md:left-8 flex items-center gap-4 md:gap-6 z-10">
              <div className="flex items-center gap-2 group/legend cursor-help">
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                <span className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-widest opacity-40 group-hover/legend:opacity-100 transition-opacity">wpm</span>
              </div>
              <div className="flex items-center gap-2 group/legend cursor-help">
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-secondary opacity-30" />
                <span className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-widest opacity-40 group-hover/legend:opacity-100 transition-opacity">raw</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 50, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-secondary)" strokeOpacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis
                  stroke="var(--color-secondary)"
                  strokeOpacity={0.3}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  fontWeight="700"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-surface)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="raw"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  strokeOpacity={0.2}
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorWpm)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-10">
          <StatItem label="test type" value={mode} subValue={value} />
          <StatItem label="raw wpm" value={stats.rawWpm.toString()} />
          <StatItem label="consistency" value={`${stats.consistency}%`} />
          <StatItem label="time" value={`${stats.time}s`} />
          <StatItem
            label="characters"
            value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`}
            tooltip="correct/incorrect/extra/missed"
          />
        </div>

        {/* Action Buttons Row - Centered */}
        <div className="action-buttons-row flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <div className="flex gap-2 order-2 sm:order-1">
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover text-text px-4 py-2 rounded-lg transition-colors cursor-pointer border border-surface active:scale-95 group"
              title="Restart Test"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Restart</span>
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="p-2.5 bg-surface hover:bg-surface-hover text-text rounded-lg transition-colors cursor-pointer border border-surface active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share Results"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={onNext}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary text-background font-black py-2.5 px-8 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all group shadow-xl shadow-primary/10 cursor-pointer uppercase text-[10px] tracking-[0.1em] order-1 sm:order-2"
          >
            <span>Next Test</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Kreo Advertisement - Horizontal Bottom - Adjusted for mobile */}
        <a
          href="https://kreo-tech.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="group relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-surface border border-surface shadow-2xl h-[250px] md:h-[300px] cursor-pointer hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <AnimatePresence mode="wait">
              <motion.div
                key={swarm65Images[swarm65Index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center scale-110 group-hover:scale-100 transition-transform duration-1000 blur-[2px] group-hover:blur-0"
                style={{ backgroundImage: `url('${swarm65Images[swarm65Index]}')` }}
              />
            </AnimatePresence>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 px-6 md:px-12 py-8 md:py-10 z-10 h-full">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="bg-primary text-background text-[8px] md:text-[9px] font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                    New Arrival
                  </div>
                  <div className="hidden md:block h-px w-12 bg-secondary/20" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter text-text uppercase leading-tight">
                  Swarm65 <span className="text-primary group-hover:text-text transition-colors">Black Purple</span>
                </h3>
                <p className="text-secondary text-[11px] md:text-sm font-medium max-w-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  Wireless Mechanical Gaming Keyboard with premium switches and elite purple accents.
                </p>
                <p className="text-primary/50 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-2">
                  kreo-tech.com
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
                <div className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary text-background px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest group-hover:opacity-90 transition-all shadow-xl">
                  Shop Now
                  <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </a>

        {/* Shortcuts - hidden on mobile */}
        <div className="mt-8 md:mt-10 flex justify-center gap-10">
          <div className="hidden md:flex items-center gap-3 group">
            <kbd className="bg-surface px-2 py-1 rounded-lg border border-surface text-[10px] text-text font-black group-hover:border-primary/50 transition-colors shadow-inner">TAB</kbd>
            <span className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">next test</span>
          </div>
          <div className="hidden md:flex items-center gap-3 group">
            <kbd className="bg-surface px-2 py-1 rounded-lg border border-surface text-[10px] text-text font-black group-hover:border-primary/50 transition-colors shadow-inner">ESC</kbd>
            <span className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">restart</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar Ad (Vertical) */}
      <aside className="hidden lg:flex flex-col w-[320px] gap-6 shrink-0 pt-4">
        <div className="sticky top-24 flex flex-col gap-6">
          <a
            href="https://kreo-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface border border-surface p-6 flex flex-col gap-6 min-h-[500px] cursor-pointer hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-background/40">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={swarmWhiteImages[swarmWhiteIndex]}
                    src={swarmWhiteImages[swarmWhiteIndex]}
                    alt="Swarm White Purple"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover transition-transform duration-1000"
                  />
                </AnimatePresence>
                <div className="absolute top-4 left-4 bg-primary text-background text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20 z-10">
                  Wireless Elite
                </div>
              </div>

              <div className="relative flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">Swarm Series</span>
                  <h4 className="text-xl font-black text-text uppercase tracking-tighter leading-tight">Swarm <span className="text-primary italic">White</span> Purple</h4>
                </div>
                <p className="text-secondary text-xs font-medium opacity-80 leading-relaxed">
                  Clean aesthetic meets mechanical precision. Tri-mode connectivity for seamless gaming.
                </p>
                <p className="text-primary/50 text-[10px] font-bold tracking-widest uppercase mt-1">
                  kreo-tech.com
                </p>

                <div className="flex items-center justify-end mt-2">
                  <div className="bg-primary text-background p-3 rounded-full group-hover:opacity-90 transition-all group-hover:scale-110 shadow-xl">
                    <ExternalLink className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-secondary/10" />

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-surface" />
                  ))}
                </div>
                <span className="text-[9px] text-secondary font-bold uppercase tracking-widest opacity-60">+200 reviews</span>
              </div>
            </div>
          </a>

        </div>
      </aside>
    </div>
  );
}

function StatItem({
  label,
  value,
  subValue,
  tooltip
}: {
  label: string;
  value: string | number | undefined;
  subValue?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-2 group relative">
      <div className="flex items-center gap-2">
        <span className="text-secondary text-[10px] font-black uppercase tracking-[0.15em] opacity-40 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
        {tooltip && (
          <div className="relative group/tip">
            <Info size={12} className="text-secondary opacity-20 hover:opacity-100 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-surface text-[10px] text-text rounded-xl font-bold whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-all border border-surface pointer-events-none z-50 shadow-2xl translate-y-2 group-hover/tip:translate-y-0">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-text text-4xl font-black tabular-nums tracking-tighter">
          {value ?? "-"}
        </span>
        {subValue && (
          <span className="text-secondary text-sm font-bold uppercase tracking-widest opacity-40">
            {subValue}
          </span>
        )}
      </div>
      <div className="h-1 w-0 group-hover:w-12 bg-primary/40 transition-all duration-500 rounded-full" />
    </div>
  );
}
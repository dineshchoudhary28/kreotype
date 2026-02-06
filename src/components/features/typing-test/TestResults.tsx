"use client";

import { TestStats, useTypingTestStore } from "@/store/useTypingTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { RefreshCw, ChevronRight, Share2, Info, ExternalLink, AlertTriangle } from "lucide-react";

interface TestResultsProps {
  stats: TestStats;
  onRestart: () => void;
  onNext: () => void;
}

export function TestResults({ stats, onRestart, onNext }: TestResultsProps) {
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  
  // Get cheating counts from store
  const afkCount = useTypingTestStore(s => s.afkCount);
  const tabCount = useTypingTestStore(s => s.tabCount);
  const blurCount = useTypingTestStore(s => s.blurCount);

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
      <div className="flex-1 flex flex-col min-w-0">
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
          
          {/* Integrity Indicators - Adjusted for mobile */}
          {(afkCount > 0 || tabCount > 0 || blurCount > 0) && (
            <div className="md:hidden flex flex-col gap-2 p-3 bg-error/5 border border-error/10 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
                <AlertTriangle size={12} />
                Integrity Report
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {afkCount > 0 && <span className="text-error/70 text-[10px] font-medium">AFK: {afkCount}</span>}
                {tabCount > 0 && <span className="text-error/70 text-[10px] font-medium">Alt+Tab: {tabCount}</span>}
                {blurCount > 0 && <span className="text-error/70 text-[10px] font-medium">Blur: {blurCount}</span>}
              </div>
            </div>
          )}

          {/* Graph Section */}
          <div className="md:col-span-9 h-[250px] md:h-[400px] w-full bg-surface/40 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 relative group overflow-hidden border border-white/[0.03] shadow-2xl">
            <div className="absolute top-4 md:top-6 left-4 md:left-8 flex items-center gap-4 md:gap-6 z-10">
              <div className="flex items-center gap-2 group/legend cursor-help">
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(104,90,202,0.5)]" />
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
                    <stop offset="5%" stopColor="#685ACA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#685ACA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="time" 
                  hide 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.1)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  fontWeight="700"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#685ACA', fontWeight: 'bold' }}
                  cursor={{ stroke: '#685ACA', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="raw" 
                  stroke="#6b7280" 
                  strokeWidth={2} 
                  strokeOpacity={0.2}
                  fill="transparent" 
                />
                <Area 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#685ACA" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorWpm)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#685ACA' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Desktop Integrity Indicators */}
          {(afkCount > 0 || tabCount > 0 || blurCount > 0) && (
            <div className="hidden md:flex col-span-3 flex-col gap-2 p-4 bg-error/5 border border-error/10 rounded-xl mt-[-2rem]">
              <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
                <AlertTriangle size={12} />
                Integrity Report
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {afkCount > 0 && <span className="text-error/70 text-[10px] font-medium">AFK: {afkCount}</span>}
                {tabCount > 0 && <span className="text-error/70 text-[10px] font-medium">Alt+Tab: {tabCount}</span>}
                {blurCount > 0 && <span className="text-error/70 text-[10px] font-medium">Blur: {blurCount}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-12">
          <StatItem label="test type" value={mode} subValue={value} />
          <StatItem label="raw wpm" value={stats.rawWpm.toString()} />
          <StatItem label="consistency" value={`${stats.consistency}%`} />
          <StatItem label="time" value={`${stats.time}s`} />
          <StatItem 
            label="characters" 
            value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`} 
            tooltip="correct/incorrect/extra/missed"
          />
          <div className="flex flex-col justify-end gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
            <button 
              onClick={onNext}
              className="flex items-center justify-center gap-2 md:gap-3 bg-primary text-background font-black py-3 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-2xl shadow-primary/20 cursor-pointer uppercase text-[10px] md:text-xs tracking-[0.1em]"
            >
              <span>Next Test</span>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={onRestart}
                className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover text-text py-2 md:py-3 rounded-lg md:rounded-xl transition-colors cursor-pointer border border-white/[0.03] active:scale-95"
              >
                <RefreshCw className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Restart</span>
              </button>
              <button className="p-2 md:p-3 bg-surface hover:bg-surface-hover text-text rounded-lg md:rounded-xl transition-colors cursor-pointer border border-white/[0.03] active:scale-95">
                <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Kreo Advertisement - Horizontal Bottom - Adjusted for mobile */}
        <div className="group relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-black border border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-[url('https://kreo-tech.com/cdn/shop/files/banner_1.jpg')] bg-cover bg-center opacity-20 scale-110 group-hover:scale-100 transition-transform duration-1000 blur-[3px] group-hover:blur-0" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 px-6 md:px-12 py-8 md:py-10 z-10">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="bg-primary text-background text-[8px] md:text-[9px] font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                  Kreo Hardware
                </div>
                <div className="hidden md:block h-px w-12 bg-white/10" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-tight">
                Built for <span className="text-primary group-hover:text-white transition-colors">Precision</span>
              </h3>
              <p className="text-secondary text-[11px] md:text-sm font-medium max-w-sm opacity-60 group-hover:opacity-100 transition-opacity">
                              Upgrade your mechanical game with Kreo&apos;s high-performance gear.
                            </p>            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
              <div className="hidden sm:flex flex-col items-center md:items-end">
                <span className="text-[8px] md:text-[9px] text-secondary font-black uppercase tracking-[0.3em] opacity-40">Collection 2026</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-primary font-bold">₹</span>
                  <span className="text-2xl md:text-4xl font-black text-white tracking-tighter">2,499</span>
                </div>
              </div>
              
              <a 
                href="https://kreo-tech.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-primary/50 group/btn"
              >
                Shop Now
                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Shortcuts - hidden on mobile */}
        <div className="mt-8 md:mt-10 flex justify-center gap-10">
          <div className="hidden md:flex items-center gap-3 group">
            <kbd className="bg-surface px-2 py-1 rounded-lg border border-white/5 text-[10px] text-text font-black group-hover:border-primary/50 transition-colors shadow-inner">TAB</kbd>
            <span className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">next test</span>
          </div>
          <div className="hidden md:flex items-center gap-3 group">
            <kbd className="bg-surface px-2 py-1 rounded-lg border border-white/5 text-[10px] text-text font-black group-hover:border-primary/50 transition-colors shadow-inner">ESC</kbd>
            <span className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">restart</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar Ad (Vertical) - Hidden on medium, shown as separate block on mobile if needed? 
          For now let's keep it as is, it's hidden lg:flex. */}
      <aside className="hidden lg:flex flex-col w-[320px] gap-6 shrink-0 pt-4">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className="relative group overflow-hidden rounded-[2rem] bg-surface/30 border border-white/5 p-6 flex flex-col gap-6">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
              <img 
                src="https://kreo-tech.com/cdn/shop/files/Product_1.jpg" 
                alt="Kreo Product" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute top-4 left-4 bg-primary text-background text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">
                Hot Seller
              </div>
            </div>

            <div className="relative flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Mechanical Series</span>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">Kreo <span className="text-primary italic">Element</span> Pro</h4>
              </div>
              <p className="text-secondary text-xs font-medium opacity-60 leading-relaxed">
                Hot-swappable switches, Gasket mount, and tri-mode connectivity for the ultimate typing feel.
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-secondary font-bold uppercase tracking-widest opacity-40">Price</span>
                  <span className="text-2xl font-black text-white tracking-tighter italic">₹4,999</span>
                </div>
                <a 
                  href="https://kreo-tech.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-xl"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
            
            <div className="h-px w-full bg-white/5" />
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-zinc-800" />
                ))}
              </div>
              <span className="text-[9px] text-secondary font-bold uppercase tracking-widest opacity-60">+200 reviews</span>
            </div>
          </div>

          <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 overflow-hidden group">
            <div className="relative z-10 flex flex-col gap-4 text-center">
              <span className="text-primary text-[9px] font-black uppercase tracking-[0.3em]">Join the Crew</span>
              <h5 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Get 10% OFF Your First Order</h5>
              <button className="bg-primary text-background py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                Claim Offer
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
          </div>
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
  value: string; 
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-surface text-[10px] text-text rounded-xl font-bold whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-all border border-white/5 pointer-events-none z-50 shadow-2xl translate-y-2 group-hover/tip:translate-y-0">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-text text-4xl font-black tabular-nums tracking-tighter">
          {value}
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


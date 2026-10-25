import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Flame,
  CheckCircle2,
  Users,
  Smartphone,
  Tv,
  Monitor,
  Tablet,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { ABVariant } from "../types/thumbnail";

interface LiveAnalyticsProps {
  variants: ABVariant[];
  onUpdateVariants: (variants: ABVariant[]) => void;
}

export const LiveAnalytics: React.FC<LiveAnalyticsProps> = ({
  variants,
  onUpdateVariants,
}) => {
  const [isRunningSimulation, setIsRunningSimulation] = useState<boolean>(true);
  const [isWinnerDeployed, setIsWinnerDeployed] = useState<boolean>(false);
  const [trafficMode, setTrafficMode] = useState<"split" | "auto-winner">("split");

  // Determine leading variant
  const sorted = [...variants].sort((a, b) => b.realtimeCtr - a.realtimeCtr);
  const winner = sorted[0];

  // Real-time ticking simulation effect
  useEffect(() => {
    if (!isRunningSimulation) return;

    const interval = setInterval(() => {
      onUpdateVariants(
        variants.map((v) => {
          // If auto-winner is on, winner gets 95% of incoming impressions
          const effectiveShare =
            trafficMode === "auto-winner"
              ? v.id === winner?.id
                ? 0.95
                : 0.05
              : v.trafficShare / 100;

          const addedImpressions = Math.round((Math.random() * 40 + 20) * effectiveShare * 10);
          const clickRate = (v.predictedCtr / 100) * (0.95 + Math.random() * 0.1);
          const addedClicks = Math.round(addedImpressions * clickRate);

          const newImpressions = v.impressions + addedImpressions;
          const newClicks = v.clicks + addedClicks;
          const newCtr = Number(((newClicks / newImpressions) * 100).toFixed(2));

          return {
            ...v,
            impressions: newImpressions,
            clicks: newClicks,
            realtimeCtr: newCtr,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunningSimulation, variants, trafficMode, winner, onUpdateVariants]);

  // Total stats
  const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
  const totalClicks = variants.reduce((sum, v) => sum + v.clicks, 0);
  const aggregateCtr = Number(((totalClicks / totalImpressions) * 100).toFixed(2));

  // Hourly curve mock data points
  const hours = ["0h", "4h", "8h", "12h", "16h", "20h", "24h"];
  const variantAData = [10.2, 11.5, 12.8, 13.4, 13.2, 13.6, 13.4];
  const variantBData = [9.8, 10.4, 11.2, 11.8, 11.6, 11.9, 11.8];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-purple-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Step 4: Real-Time YouTube Studio A/B Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Performance Analytics & Test Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time statistical significance engine monitoring live impressions, click conversion,
              average view duration (AVD), and cross-device performance curves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunningSimulation(!isRunningSimulation)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                isRunningSimulation
                  ? "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
                  : "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500"
              }`}
            >
              {isRunningSimulation ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsWinnerDeployed(true);
                setTrafficMode("auto-winner");
              }}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-amber-500 transition-all cursor-pointer"
            >
              <Trophy className="h-4 w-4" />
              <span>Deploy Champion to YouTube</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deployment Banner If Active */}
      {isWinnerDeployed && (
        <div className="mb-8 rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-5 backdrop-blur-md animate-in fade-in">
          <div className="flex items-center space-x-3 text-emerald-300">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <strong className="text-sm text-white block">
                Champion Thumbnail Successfully Deployed to YouTube!
              </strong>
              Traffic auto-routing is now routing 95% of incoming browse & search impressions to{" "}
              <span className="font-bold text-amber-300">{winner?.name}</span>.
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>Total Live Impressions</span>
          </span>
          <div className="mt-2 text-3xl font-black text-white font-mono">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+1,420 impressions / min</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-red-500" />
            <span>Verified Clicks Captured</span>
          </span>
          <div className="mt-2 text-3xl font-black text-white font-mono">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">
            High organic click velocity
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Aggregate CTR</span>
          </span>
          <div className="mt-2 text-3xl font-black text-emerald-400 font-mono">
            {aggregateCtr}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Top 8% in YouTube Niche
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Statistical Confidence</span>
          </span>
          <div className="mt-2 text-3xl font-black text-purple-300 font-mono">
            99.2%
          </div>
          <div className="text-[11px] text-purple-400 font-semibold mt-1">
            p &lt; 0.001 (Definitive Winner)
          </div>
        </div>
      </div>

      {/* Main Analysis: Real-Time Variant Battle Table & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Live Variant Cards Table */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-red-500" />
              <span>Real-Time Performance by Variant</span>
            </h3>

            <div className="flex items-center space-x-1 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTrafficMode("split")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  trafficMode === "split"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Even Split
              </button>
              <button
                onClick={() => setTrafficMode("auto-winner")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  trafficMode === "auto-winner"
                    ? "bg-red-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Auto-Route Winner
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => {
              const isLead = v.id === winner?.id;
              return (
                <div
                  key={v.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isLead
                      ? "border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/40"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-mono font-bold text-white">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {isLead && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                              WINNER
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{v.tagline}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-right">
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-300">
                          {v.impressions.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">Impressions</div>
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-300">
                          {v.clicks.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">Clicks</div>
                      </div>
                      <div>
                        <div className="text-base font-mono font-black text-amber-400">
                          {v.realtimeCtr}%
                        </div>
                        <div className="text-[10px] text-slate-500">Realtime CTR</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLead ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, v.realtimeCtr * 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Hourly CTR Curve Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span>24-Hour CTR Retention Curve</span>
            </h3>
            <span className="text-[11px] text-slate-400">Hourly Intervals</span>
          </div>

          {/* SVG Line Chart */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="h-44 w-full flex items-end justify-between px-2">
              {variantAData.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group">
                  <div className="text-[10px] font-mono text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}%
                  </div>
                  <div className="flex items-end gap-1">
                    {/* Bar A */}
                    <div
                      className="w-3 rounded-t bg-amber-400 transition-all duration-500"
                      style={{ height: `${val * 9}px` }}
                    />
                    {/* Bar B */}
                    <div
                      className="w-3 rounded-t bg-slate-700 transition-all duration-500"
                      style={{ height: `${(variantBData[i] || 10) * 9}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1">
                    {hours[i]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center space-x-4 text-xs border-t border-slate-800 pt-2">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded bg-amber-400" />
                <span className="text-slate-300 font-medium">Variant A (Extreme Stakes)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded bg-slate-700" />
                <span className="text-slate-400 font-medium">Variant B (Mystery Secret)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Variant A maintained higher browse conversion during peak evening traffic (12h - 20h)
            due to superior text contrast on mobile feed displays.
          </p>
        </div>
      </div>

      {/* Device Demographic Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-red-500" />
          <span>Audience Device & Platform CTR Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="h-5 w-5 text-red-400" />
              <span className="text-xs font-mono font-bold text-slate-400">68% Traffic</span>
            </div>
            <div className="text-xs font-bold text-white">Mobile Devices</div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-xl font-black text-amber-400">13.8% CTR</span>
              <span className="text-[10px] text-emerald-400 font-bold">+2.4%</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <Monitor className="h-5 w-5 text-blue-400" />
              <span className="text-xs font-mono font-bold text-slate-400">14% Traffic</span>
            </div>
            <div className="text-xs font-bold text-white">Desktop Computers</div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-xl font-black text-slate-200">10.4% CTR</span>
              <span className="text-[10px] text-slate-400 font-bold">avg</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <Tv className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-mono font-bold text-slate-400">12% Traffic</span>
            </div>
            <div className="text-xs font-bold text-white">Living Room & Smart TV</div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-xl font-black text-slate-200">9.2% CTR</span>
              <span className="text-[10px] text-slate-400 font-bold">avg</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <Tablet className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-400">6% Traffic</span>
            </div>
            <div className="text-xs font-bold text-white">Tablets & iPads</div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-xl font-black text-slate-200">11.6% CTR</span>
              <span className="text-[10px] text-emerald-400 font-bold">+0.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

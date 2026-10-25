import React, { useRef, useEffect } from "react";
import {
  Split,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Eye,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ABVariant, ThumbnailDesign } from "../types/thumbnail";
import { renderThumbnailToCanvas } from "../utils/canvasRenderer";

interface ABTestingLabProps {
  variants: ABVariant[];
  onSelectVariantToEdit: (design: ThumbnailDesign) => void;
  onUpdateVariants: (variants: ABVariant[]) => void;
  onNavigateToTab: (tab: "editor" | "analytics") => void;
  heatmapEnabled: boolean;
  onToggleHeatmap: () => void;
}

export const ABTestingLab: React.FC<ABTestingLabProps> = ({
  variants,
  onSelectVariantToEdit,
  onUpdateVariants,
  onNavigateToTab,
  heatmapEnabled,
  onToggleHeatmap,
}) => {
  // Find highest predicted CTR variant
  const sortedVariants = [...variants].sort((a, b) => b.predictedCtr - a.predictedCtr);
  const leadingVariant = sortedVariants[0];

  // Canvas refs for each variant
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Render each variant on canvas
  useEffect(() => {
    variants.forEach((v) => {
      const canvas = canvasRefs.current[v.id];
      if (!canvas) return;
      canvas.width = 1280;
      canvas.height = 720;

      const designWithOverlays: ThumbnailDesign = {
        ...v.design,
        showSafeZoneOverlay: true,
        showHeatmap: heatmapEnabled,
      };

      renderThumbnailToCanvas(canvas, designWithOverlays, v.heatmapPoints);
    });
  }, [variants, heatmapEnabled]);

  // Adjust traffic split
  const handleUpdateTrafficShare = (variantId: string, share: number) => {
    const updated = variants.map((v) =>
      v.id === variantId ? { ...v, trafficShare: share } : v
    );
    onUpdateVariants(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-red-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
              <Split className="h-3.5 w-3.5" />
              <span>Step 3: A/B Variant Comparison & Heatmap Simulation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Algorithmic A/B Battle & Attention Lab
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Compare competing thumbnail hypotheses. Evaluate mobile feed readability, emotional
              expressions, and AI simulated eye-tracking gaze fixations before spending traffic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleHeatmap}
              className={`flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                heatmapEnabled
                  ? "border-amber-500 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{heatmapEnabled ? "Hide Eye Heatmap" : "Overlay Eye Heatmap"}</span>
            </button>

            <button
              onClick={() => onNavigateToTab("analytics")}
              className="flex items-center space-x-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              <span>Launch Live Telemetry</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Leading Winner Callout Card */}
      {leadingVariant && (
        <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Predicted Champion Variant
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                    {leadingVariant.name}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  Predicted to capture{" "}
                  <span className="text-amber-400 font-black">
                    {leadingVariant.predictedCtr}% CTR
                  </span>{" "}
                  ({(leadingVariant.predictedCtr - (sortedVariants[1]?.predictedCtr || 10)).toFixed(1)}% higher than runner-up)
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 sm:text-right">
              <div className="font-semibold text-white">Projected Impact per 500k Impressions:</div>
              <div className="text-emerald-400 font-black text-sm">
                +{Math.round((leadingVariant.predictedCtr - (sortedVariants[1]?.predictedCtr || 9)) * 5000).toLocaleString()} Extra YouTube Clicks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {variants.map((v) => {
          const isWinner = leadingVariant?.id === v.id;
          return (
            <div
              key={v.id}
              className={`flex flex-col justify-between rounded-2xl border bg-slate-900/80 p-5 transition-all ${
                isWinner
                  ? "border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-4">
                {/* Variant Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white">{v.name}</span>
                    {isWinner && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-extrabold text-amber-300 border border-amber-500/30">
                        Top Performer
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">
                      {v.predictedCtr}%
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1">
                      Predicted CTR
                    </span>
                  </div>
                </div>

                {/* Thumbnail Canvas Render */}
                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video shadow-lg">
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[v.id] = el;
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Hypothesis & Tagline */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tested Packaging Hypothesis:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {v.hypothesis}
                  </p>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Mobile Legibility</span>
                    <span className="font-extrabold text-white">
                      {v.readabilityScore} / 10
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Emotion & Face Impact</span>
                    <span className="font-extrabold text-white">
                      {v.emotionScore} / 10
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Contrast Separation</span>
                    <span className="font-extrabold text-white">
                      {v.contrastScore} / 10
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Curiosity Gap</span>
                    <span className="font-extrabold text-white">
                      {v.curiosityScore} / 10
                    </span>
                  </div>
                </div>

                {/* Key Strengths */}
                {v.strengths?.length > 0 && (
                  <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                    {v.strengths.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Traffic Split Slider */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Simulated Traffic Share
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {v.trafficShare}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={v.trafficShare}
                    onChange={(e) => handleUpdateTrafficShare(v.id, Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Action: Open In Editor */}
              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={() => {
                    onSelectVariantToEdit(v.design);
                    onNavigateToTab("editor");
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                >
                  <span>Edit in Canvas Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

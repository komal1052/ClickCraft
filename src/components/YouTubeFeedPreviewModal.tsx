import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  MoreVertical,
  CheckCircle2,
  Play,
  Flame,
} from "lucide-react";
import { ThumbnailDesign } from "../types/thumbnail";
import { renderThumbnailToCanvas } from "../utils/canvasRenderer";

interface YouTubeFeedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesign: ThumbnailDesign;
}

export const YouTubeFeedPreviewModal: React.FC<YouTubeFeedPreviewModalProps> = ({
  isOpen,
  onClose,
  currentDesign,
}) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;
    renderThumbnailToCanvas(canvas, currentDesign);
  }, [isOpen, currentDesign]);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "border-slate-800 bg-[#0f0f0f] text-white"
            : "border-slate-300 bg-[#ffffff] text-slate-900"
        }`}
      >
        {/* Modal Top Bar */}
        <div
          className={`flex items-center justify-between border-b px-6 py-3.5 ${
            isDark ? "border-zinc-800 bg-[#181818]" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
              <Play className="h-4 w-4 fill-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">
              YouTube Feed Simulator
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Device Switcher */}
            <div
              className={`flex items-center rounded-lg p-1 border ${
                isDark ? "border-zinc-800 bg-zinc-900" : "border-slate-300 bg-white"
              }`}
            >
              <button
                onClick={() => setDevice("mobile")}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  device === "mobile"
                    ? "bg-red-600 text-white"
                    : isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile Feed</span>
              </button>
              <button
                onClick={() => setDevice("desktop")}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  device === "desktop"
                    ? "bg-red-600 text-white"
                    : isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop Grid</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle YouTube theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-black"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feed Simulator Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {device === "mobile" ? (
            /* Mobile YouTube App Feed Layout */
            <div className="mx-auto max-w-sm space-y-6">
              {/* YOUR VIDEO CARD (Prominent in Feed) */}
              <div
                className={`rounded-2xl border p-2 overflow-hidden shadow-lg transition-all ${
                  isDark ? "border-red-500/40 bg-zinc-900/50" : "border-red-500/40 bg-red-50/30"
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow">
                  <canvas ref={canvasRef} className="h-full w-full object-contain" />
                  <div className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    YOUR THUMBNAIL
                  </div>
                </div>

                <div className="mt-3 flex items-start space-x-3 px-1">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex-shrink-0 flex items-center justify-center text-xs font-black text-white">
                    CC
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-snug line-clamp-2">
                      {currentDesign.title || "Crazy 24-Hour Experiment (End Result Shocked Me)"}
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      ClickCraft Studio • 142K views • 2 hours ago
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                </div>
              </div>

              {/* COMPETITOR CARD 1 */}
              <div className="space-y-2 opacity-85">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                  <div className="h-full w-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4 text-center">
                    <div className="text-xl font-black text-white">
                      I Built an Underground Bunker in 7 Days
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    21:04
                  </div>
                </div>

                <div className="flex items-start space-x-3 px-1">
                  <div className="h-9 w-9 rounded-full bg-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-snug line-clamp-2">
                      I Built an Underground Bunker in 7 Days (Full Time-Lapse)
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      MrBeast • 12M views • 1 day ago
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                </div>
              </div>

              {/* COMPETITOR CARD 2 */}
              <div className="space-y-2 opacity-85">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                  <div className="h-full w-full bg-gradient-to-br from-amber-900 to-zinc-900 flex items-center justify-center p-4 text-center">
                    <div className="text-xl font-black text-yellow-300">
                      The $10,000 Smartphone You Can't Buy
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    12:35
                  </div>
                </div>

                <div className="flex items-start space-x-3 px-1">
                  <div className="h-9 w-9 rounded-full bg-amber-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-snug line-clamp-2">
                      The $10,000 Smartphone You Can't Buy
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      MKBHD • 2.8M views • 3 days ago
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop YouTube Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* YOUR VIDEO */}
              <div
                className={`rounded-2xl border p-2 overflow-hidden shadow-lg ${
                  isDark ? "border-red-500/50 bg-zinc-900/60" : "border-red-500/50 bg-red-50/40"
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow">
                  <canvas ref={canvasRef} className="h-full w-full object-contain" />
                  <div className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    YOUR THUMBNAIL
                  </div>
                </div>
                <div className="mt-2.5 flex items-start space-x-2.5">
                  <div className="h-8 w-8 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center text-xs font-black text-white">
                    CC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold line-clamp-2">
                      {currentDesign.title || "Crazy 24-Hour Experiment (End Result Shocked Me)"}
                    </h4>
                    <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      ClickCraft Studio • 142K views
                    </p>
                  </div>
                </div>
              </div>

              {/* COMPETITOR 1 */}
              <div className="rounded-2xl border border-transparent p-2 opacity-85">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-900 to-black p-3 flex items-center justify-center text-center">
                  <span className="text-base font-black text-white">
                    I Built an Underground Bunker
                  </span>
                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1 py-0.5 text-[9px] font-mono text-white">
                    21:04
                  </div>
                </div>
                <div className="mt-2.5 flex items-start space-x-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold line-clamp-2">
                      I Built an Underground Bunker in 7 Days
                    </h4>
                    <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      MrBeast • 12M views
                    </p>
                  </div>
                </div>
              </div>

              {/* COMPETITOR 2 */}
              <div className="rounded-2xl border border-transparent p-2 opacity-85">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-900 to-black p-3 flex items-center justify-center text-center">
                  <span className="text-base font-black text-purple-300">
                    Why Everything You Know is Wrong
                  </span>
                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1 py-0.5 text-[9px] font-mono text-white">
                    18:42
                  </div>
                </div>
                <div className="mt-2.5 flex items-start space-x-2.5">
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold line-clamp-2">
                      Why Everything You Know is Wrong
                    </h4>
                    <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Veritasium • 4.1M views
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

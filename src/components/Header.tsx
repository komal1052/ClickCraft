import React from "react";
import {
  Sparkles,
  PlaySquare,
  Palette,
  Split,
  BarChart3,
  Download,
  Eye,
  ShieldCheck,
  Flame,
  Bookmark,
} from "lucide-react";
import { TabType } from "../types/thumbnail";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenFeedPreview: () => void;
  onExportThumbnail: (format: "png" | "jpeg") => void;
  safeZoneEnabled: boolean;
  onToggleSafeZone: () => void;
  heatmapEnabled: boolean;
  onToggleHeatmap: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenFeedPreview,
  onExportThumbnail,
  safeZoneEnabled,
  onToggleSafeZone,
  heatmapEnabled,
  onToggleHeatmap,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-lg shadow-red-500/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-white text-lg">
                ClickCraft<span className="text-red-500">AI</span>
              </span>
              <span className="hidden rounded-full bg-red-950/80 px-2.5 py-0.5 text-[11px] font-bold text-red-400 border border-red-800/60 sm:inline-block">
                HIGH-CTR ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              YouTube Thumbnail Packaging & A/B Studio
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("analyzer")}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "analyzer"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <PlaySquare className="h-4 w-4" />
            <span className="hidden md:inline">1. Video AI</span>
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "editor"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">2. Canvas Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("ab-test")}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "ab-test"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Split className="h-4 w-4" />
            <span className="hidden md:inline">3. A/B Testing</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">4. Live Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "templates"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Bookmark className="h-4 w-4 text-amber-400" />
            <span className="hidden md:inline">5. Templates</span>
          </button>
        </nav>

        {/* Quick Tools & Export */}
        <div className="flex items-center space-x-2">
          {/* Safe-Zone Toggle */}
          <button
            onClick={onToggleSafeZone}
            title="Toggle YouTube 14:28 timestamp safe-zone overlay"
            className={`hidden sm:flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              safeZoneEnabled
                ? "border-red-500/50 bg-red-950/40 text-red-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">YT Safe-Zone</span>
          </button>

          {/* Eye-Tracking Heatmap Toggle */}
          <button
            onClick={onToggleHeatmap}
            title="Toggle AI simulated eye-tracking gaze heatmap"
            className={`hidden sm:flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              heatmapEnabled
                ? "border-amber-500/50 bg-amber-950/40 text-amber-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Eye Heatmap</span>
          </button>

          {/* YouTube Feed Simulator */}
          <button
            onClick={onOpenFeedPreview}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Feed Preview</span>
          </button>

          {/* Export High-Res */}
          <div className="relative group">
            <button
              onClick={() => onExportThumbnail("png")}
              className="flex items-center space-x-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

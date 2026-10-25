import React, { useState, useEffect, useRef } from "react";
import {
  Type,
  User,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Smartphone,
  ShieldCheck,
  Flame,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Move,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Wand2,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  ThumbnailDesign,
  TextLayer,
  StickerLayer,
  FontChoice,
} from "../types/thumbnail";
import {
  CREATOR_CUTOUTS,
  BACKGROUND_PRESETS,
} from "../data/samples";
import { renderThumbnailToCanvas } from "../utils/canvasRenderer";
import { FontPickerModal } from "./FontPickerModal";
import { BackgroundRemoverModal } from "./BackgroundRemoverModal";
import { loadGoogleFont, getSavedCustomFonts, GoogleFontItem } from "../utils/fontLoader";

interface CanvasStudioProps {
  currentDesign: ThumbnailDesign;
  onChangeDesign: (design: ThumbnailDesign) => void;
  safeZoneEnabled: boolean;
  onToggleSafeZone: () => void;
  heatmapEnabled: boolean;
  onToggleHeatmap: () => void;
  onNavigateToTemplates?: () => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  currentDesign,
  onChangeDesign,
  safeZoneEnabled,
  onToggleSafeZone,
  heatmapEnabled,
  onToggleHeatmap,
  onNavigateToTemplates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.75); // 0.5, 0.75, 1
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"text" | "subject" | "bg" | "stickers">("text");

  // Free Custom Fonts Cache
  const [savedCustomFonts, setSavedCustomFonts] = useState<GoogleFontItem[]>([]);

  // Undo / Redo History Stack State
  const [history, setHistory] = useState<ThumbnailDesign[]>([currentDesign]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isHistoryAction = useRef<boolean>(false);
  const lastExternalDesignId = useRef<string>(currentDesign.id);
  const lastCommitAction = useRef<string>("");
  const lastCommitTime = useRef<number>(0);

  // Sync saved custom fonts
  useEffect(() => {
    setSavedCustomFonts(getSavedCustomFonts());
  }, []);

  // Detect external design switches (e.g. from templates, AI generator, or analyzer)
  useEffect(() => {
    if (currentDesign.id !== lastExternalDesignId.current && !isHistoryAction.current) {
      lastExternalDesignId.current = currentDesign.id;
      setHistory([currentDesign]);
      setHistoryIndex(0);
    }
    isHistoryAction.current = false;
  }, [currentDesign]);

  // Central commit helper that manages undo/redo history stack with drag debounce
  const commitChange = (newDesign: ThumbnailDesign, actionKey?: string) => {
    const now = Date.now();
    const isContinuous =
      actionKey &&
      actionKey === lastCommitAction.current &&
      now - lastCommitTime.current < 450;

    lastCommitTime.current = now;
    lastCommitAction.current = actionKey || "";

    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      if (isContinuous && truncated.length > 1) {
        // Replace last continuous step (e.g. slider drag) so Undo reverts smoothly
        const updated = [...truncated];
        updated[updated.length - 1] = newDesign;
        return updated;
      }
      return [...truncated, newDesign].slice(-40); // Cap history at 40 steps
    });

    setHistoryIndex((prev) => {
      if (isContinuous) return prev;
      return Math.min(prev + 1, 39);
    });

    onChangeDesign(newDesign);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = () => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      const targetDesign = history[targetIdx];
      isHistoryAction.current = true;
      setHistoryIndex(targetIdx);
      onChangeDesign(targetDesign);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      const targetDesign = history[targetIdx];
      isHistoryAction.current = true;
      setHistoryIndex(targetIdx);
      onChangeDesign(targetDesign);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z / Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      const activeElem = document.activeElement;
      const isTyping =
        activeElem &&
        (activeElem.tagName === "INPUT" || activeElem.tagName === "TEXTAREA");

      if (e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
          e.preventDefault();
          redo();
        } else {
          // Undo: Ctrl+Z / Cmd+Z
          if (!isTyping) {
            e.preventDefault();
            undo();
          }
        }
      } else if (e.key.toLowerCase() === "y") {
        // Redo: Ctrl+Y / Cmd+Y
        if (!isTyping) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  // CTR Diagnostics State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [ctrDiagnostic, setCtrDiagnostic] = useState<any>(null);

  // Google Fonts & Background Remover Modal State
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [activeTextIdForFont, setActiveTextIdForFont] = useState<string | null>(null);
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);
  const [bgRemoverImage, setBgRemoverImage] = useState<string>(currentDesign.subject.imageUrl);

  // Re-render canvas whenever design or overlays change
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;

    const designToRender: ThumbnailDesign = {
      ...currentDesign,
      showSafeZoneOverlay: safeZoneEnabled,
      showHeatmap: heatmapEnabled,
    };

    renderThumbnailToCanvas(canvas, designToRender, ctrDiagnostic?.heatmapFixations);
  }, [currentDesign, safeZoneEnabled, heatmapEnabled, ctrDiagnostic]);

  // Run AI CTR diagnosis using server endpoint
  const handleRunCtrDiagnosis = async () => {
    if (!canvasRef.current) return;
    setIsDiagnosing(true);

    try {
      const base64 = canvasRef.current.toDataURL("image/jpeg", 0.85);
      const res = await fetch("/api/predict-ctr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnailImageBase64: base64,
          title: currentDesign.title,
          designConfig: currentDesign,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCtrDiagnostic(json.data);
      }
    } catch (err) {
      console.error("CTR Diagnosis failed:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Text layer actions
  const handleAddTextLayer = () => {
    const newText: TextLayer = {
      id: `text-${Date.now()}`,
      text: "NEW HOOK",
      font: "Anton",
      fontSize: 84,
      color: "#FFE600",
      strokeColor: "#000000",
      strokeWidth: 16,
      x: 35,
      y: 40 + currentDesign.texts.length * 16,
      rotation: -3,
      shadowColor: "rgba(0,0,0,0.9)",
      shadowBlur: 20,
      isUppercase: true,
    };

    commitChange({
      ...currentDesign,
      texts: [...currentDesign.texts, newText],
    });
  };

  const handleUpdateTextLayer = (id: string, updates: Partial<TextLayer>, actionKey?: string) => {
    commitChange(
      {
        ...currentDesign,
        texts: currentDesign.texts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      },
      actionKey || `text-${id}`
    );
  };

  const handleDeleteTextLayer = (id: string) => {
    commitChange({
      ...currentDesign,
      texts: currentDesign.texts.filter((t) => t.id !== id),
    });
  };

  // Subject actions
  const handleUpdateSubject = (updates: Partial<typeof currentDesign.subject>, actionKey?: string) => {
    commitChange(
      {
        ...currentDesign,
        subject: { ...currentDesign.subject, ...updates },
      },
      actionKey || "subject"
    );
  };

  const handleCustomSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) {
        handleUpdateSubject({ imageUrl: b64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Background actions
  const handleSelectBgPreset = (preset: typeof BACKGROUND_PRESETS[0]) => {
    commitChange({
      ...currentDesign,
      background: {
        ...preset,
      },
    });
  };

  // Sticker actions
  const handleAddSticker = (type: StickerLayer["type"]) => {
    const newStk: StickerLayer = {
      id: `stk-${Date.now()}`,
      type,
      color: type === "arrow" ? "#ef4444" : "#f59e0b",
      label: type === "badge" ? "100% REAL" : type === "mystery" ? "CENSORED" : undefined,
      x: 45,
      y: 50,
      scale: 1.0,
      rotation: 0,
    };
    commitChange({
      ...currentDesign,
      stickers: [...currentDesign.stickers, newStk],
    });
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerLayer>, actionKey?: string) => {
    commitChange(
      {
        ...currentDesign,
        stickers: currentDesign.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      },
      actionKey || `stk-${id}`
    );
  };

  const handleDeleteSticker = (id: string) => {
    commitChange({
      ...currentDesign,
      stickers: currentDesign.stickers.filter((s) => s.id !== id),
    });
  };

  // 1-Click AI Remix
  const handleAiRemix = () => {
    const randomPreset = BACKGROUND_PRESETS[Math.floor(Math.random() * BACKGROUND_PRESETS.length)];
    const neonColors = ["#facc15", "#38bdf8", "#ec4899", "#22c55e", "#ef4444"];
    const randomGlow = neonColors[Math.floor(Math.random() * neonColors.length)];

    commitChange({
      ...currentDesign,
      background: randomPreset,
      subject: {
        ...currentDesign.subject,
        glowColor: randomGlow,
        glowType: "neon",
        saturation: 1.35,
        brightness: 1.15,
      },
      texts: currentDesign.texts.map((t, idx) => ({
        ...t,
        rotation: idx % 2 === 0 ? -4 : 2,
        strokeWidth: 16,
      })),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-red-500" />
            <span>1280 × 720 HD Studio Canvas</span>
          </span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            16:9 Standard
          </span>
        </div>

        {/* Studio Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo & Redo History System */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Undo design change (Ctrl+Z / Cmd+Z)"
            >
              <Undo2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Undo</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Redo design change (Ctrl+Y / Cmd+Shift+Z)"
            >
              <span className="hidden sm:inline">Redo</span>
              <Redo2 className="h-3.5 w-3.5 text-amber-400" />
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-500 hidden xl:inline" title="History steps">
            Step {historyIndex + 1}/{history.length}
          </span>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Bezel Toggle */}
          <button
            onClick={() => setIsMobileView(!isMobileView)}
            className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isMobileView
                ? "border-amber-500/50 bg-amber-950/40 text-amber-300"
                : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile 3.5in Bezel</span>
          </button>

          {/* Reference Ghost Overlay Controls */}
          {currentDesign.referenceImageOverlay && (
            <div className="flex items-center space-x-2 rounded-lg bg-amber-950/30 border border-amber-500/40 px-2.5 py-1">
              <button
                onClick={() =>
                  commitChange({
                    ...currentDesign,
                    showReferenceGhost: !currentDesign.showReferenceGhost,
                  })
                }
                className={`flex items-center space-x-1 text-xs font-bold transition-colors ${
                  currentDesign.showReferenceGhost
                    ? "text-amber-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Toggle Reference Onion-Skin Ghost"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Ghost Trace</span>
              </button>

              {currentDesign.showReferenceGhost && (
                <div className="flex items-center space-x-1.5 pl-2 border-l border-amber-500/30">
                  <span className="text-[10px] text-amber-400 font-mono">
                    {Math.round((currentDesign.referenceOpacity ?? 0.35) * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.85"
                    step="0.05"
                    value={currentDesign.referenceOpacity ?? 0.35}
                    onChange={(e) =>
                      commitChange(
                        {
                          ...currentDesign,
                          referenceOpacity: Number(e.target.value),
                        },
                        "ghost-opacity"
                      )
                    }
                    className="w-16 accent-amber-500 h-1"
                    title="Ghost Opacity"
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Quick Remix */}
          <button
            onClick={handleAiRemix}
            className="flex items-center space-x-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Viral Remix</span>
          </button>

          {/* AI CTR Diagnosis */}
          <button
            onClick={handleRunCtrDiagnosis}
            disabled={isDiagnosing}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-amber-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDiagnosing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Flame className="h-3.5 w-3.5" />
            )}
            <span>AI CTR Diagnostic</span>
          </button>

          {/* Browse & Save Templates */}
          {onNavigateToTemplates && (
            <button
              onClick={onNavigateToTemplates}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              title="Open Template Gallery to save or load templates"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-400" />
              <span>Templates</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Layout: Canvas Stage on Left, Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Stage */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 overflow-hidden min-h-[460px]">
          <div
            className={`transition-all duration-300 flex items-center justify-center ${
              isMobileView
                ? "rounded-[40px] border-[10px] border-slate-700 bg-black p-2.5 shadow-2xl shadow-black/80 max-w-[420px]"
                : "w-full max-w-[800px]"
            }`}
          >
            {/* 16:9 Aspect Ratio Container */}
            <div
              className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black border border-slate-800"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Quick Safe-Zone Warning & Heatmap note */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-red-400" />
              <span>Safe-zone badge simulated at bottom right (14:28)</span>
            </span>
            {heatmapEnabled && (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Gaze Heatmap Active (Red circles indicate 0.5s eye-fixation)</span>
              </span>
            )}
          </div>

          {/* CTR Scorecard Banner (if diagnosed) */}
          {ctrDiagnostic && (
            <div className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-950/20 p-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                    AI CTR Rating:
                  </span>
                  <span className="text-xl font-black text-white">
                    {ctrDiagnostic.predictedCtr}%
                  </span>
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                    {ctrDiagnostic.ctrBand}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Mobile Readability: <strong className="text-white">{ctrDiagnostic.scores?.mobileReadability}/10</strong>
                </div>
              </div>

              {/* Strengths & Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                {ctrDiagnostic.strengths?.slice(0, 2).map((s: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{s}</span>
                  </div>
                ))}
                {ctrDiagnostic.actionableBoosts?.slice(0, 2).map((a: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference Thumbnail Side Comparison Dock */}
          {currentDesign.referenceImageOverlay && (
            <div className="mt-4 w-full rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="relative h-14 w-24 rounded-lg overflow-hidden border border-amber-500/40 bg-black flex-shrink-0 shadow">
                  <img
                    src={currentDesign.referenceImageOverlay}
                    alt="Active Reference"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-300">
                      Target Reference Active
                    </span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                      FOLLOWING STYLE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use Ghost Trace in the top bar to align text, face framing, and arrow angles.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 border border-slate-700 transition-colors">
                  <span>Replace Reference</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const b64 = ev.target?.result as string;
                        if (b64) {
                          commitChange({
                            ...currentDesign,
                            referenceImageOverlay: b64,
                            showReferenceGhost: true,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <button
                  onClick={() =>
                    commitChange({
                      ...currentDesign,
                      referenceImageOverlay: undefined,
                      showReferenceGhost: false,
                    })
                  }
                  className="rounded-lg text-slate-500 hover:text-red-400 p-1 text-xs"
                  title="Remove reference"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Inspector & Layer Controls */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-5">
          {/* Inspector Tabs */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveInspectorTab("text")}
              className={`flex items-center justify-center space-x-1 rounded-lg py-1.5 transition-colors ${
                activeInspectorTab === "text"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setActiveInspectorTab("subject")}
              className={`flex items-center justify-center space-x-1 rounded-lg py-1.5 transition-colors ${
                activeInspectorTab === "subject"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Subject</span>
            </button>
            <button
              onClick={() => setActiveInspectorTab("bg")}
              className={`flex items-center justify-center space-x-1 rounded-lg py-1.5 transition-colors ${
                activeInspectorTab === "bg"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Backdrop</span>
            </button>
            <button
              onClick={() => setActiveInspectorTab("stickers")}
              className={`flex items-center justify-center space-x-1 rounded-lg py-1.5 transition-colors ${
                activeInspectorTab === "stickers"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Accents</span>
            </button>
          </div>

          {/* TAB 1: TEXT INSPECTOR */}
          {activeInspectorTab === "text" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Text Layers ({currentDesign.texts.length})
                </span>
                <button
                  onClick={handleAddTextLayer}
                  className="flex items-center space-x-1 rounded-lg bg-red-600/20 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Hook</span>
                </button>
              </div>

              {currentDesign.texts.map((txt, idx) => (
                <div
                  key={txt.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">
                      Layer #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteTextLayer(txt.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete text layer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Text Input */}
                  <div>
                    <input
                      type="text"
                      value={txt.text}
                      onChange={(e) => handleUpdateTextLayer(txt.id, { text: e.target.value })}
                      placeholder="Punchline text..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Font & Color */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400 font-semibold block">
                          Font Style
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTextIdForFont(txt.id);
                            setIsFontPickerOpen(true);
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>Google Fonts</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <select
                          value={txt.font}
                          onChange={(e) => {
                            if (e.target.value === "__BROWSE_GOOGLE_FONTS__") {
                              setActiveTextIdForFont(txt.id);
                              setIsFontPickerOpen(true);
                            } else {
                              handleUpdateTextLayer(txt.id, { font: e.target.value as FontChoice });
                            }
                          }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          {savedCustomFonts.length > 0 && (
                            <optgroup label="⭐ Your Saved Free Fonts">
                              {savedCustomFonts.map((cf) => (
                                <option key={cf.name} value={cf.name}>
                                  {cf.name} (Custom Free)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="🔥 High-CTR YouTube Fonts">
                            <option value="Anton">Anton (Viral #1)</option>
                            <option value="Bebas Neue">Bebas Neue (Tall)</option>
                            <option value="Bungee">Bungee (Game Style)</option>
                            <option value="Impact">Impact (Classic)</option>
                            <option value="Montserrat">Montserrat (Modern)</option>
                            <option value="Oswald">Oswald (Condensed)</option>
                            <option value="Russo One">Russo One (Heavy Armor)</option>
                            <option value="Bangers">Bangers (Comic Pop)</option>
                            <option value="Lilita One">Lilita One (Chunky 3D)</option>
                            <option value="Luckiest Guy">Luckiest Guy (Explosive)</option>
                            <option value="Permanent Marker">Permanent Marker (Urgent)</option>
                          </optgroup>
                          <option value="__BROWSE_GOOGLE_FONTS__">⚡ Add / Browse 1,600+ Free Fonts...</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTextIdForFont(txt.id);
                            setIsFontPickerOpen(true);
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Open Font Browser & Add Free Fonts"
                        >
                          <Type className="h-3.5 w-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={txt.color}
                          onChange={(e) => handleUpdateTextLayer(txt.id, { color: e.target.value })}
                          className="h-7 w-7 rounded cursor-pointer border border-slate-700 bg-transparent"
                        />
                        <button
                          onClick={() => handleUpdateTextLayer(txt.id, { color: "#FFE600" })}
                          className="h-5 w-5 rounded bg-[#FFE600] border border-black/40"
                          title="Yellow"
                        />
                        <button
                          onClick={() => handleUpdateTextLayer(txt.id, { color: "#FFFFFF" })}
                          className="h-5 w-5 rounded bg-white border border-black/40"
                          title="White"
                        />
                        <button
                          onClick={() => handleUpdateTextLayer(txt.id, { color: "#00E5FF" })}
                          className="h-5 w-5 rounded bg-[#00E5FF] border border-black/40"
                          title="Cyan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Size & 3D Stroke */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Size</span>
                        <span className="font-mono">{txt.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="36"
                        max="140"
                        value={txt.fontSize}
                        onChange={(e) =>
                          handleUpdateTextLayer(txt.id, { fontSize: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>3D Stroke</span>
                        <span className="font-mono">{txt.strokeWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="26"
                        value={txt.strokeWidth}
                        onChange={(e) =>
                          handleUpdateTextLayer(txt.id, { strokeWidth: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  {/* Position & Rotation */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">X Pos</label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={txt.x}
                        onChange={(e) =>
                          handleUpdateTextLayer(txt.id, { x: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Y Pos</label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={txt.y}
                        onChange={(e) =>
                          handleUpdateTextLayer(txt.id, { y: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Tilt ({txt.rotation}°)
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={txt.rotation}
                        onChange={(e) =>
                          handleUpdateTextLayer(txt.id, { rotation: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  {/* Highlight Banner Pill */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">Background Highlight Box:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleUpdateTextLayer(txt.id, { highlightBg: undefined })}
                        className={`px-1.5 py-0.5 rounded text-[10px] border ${
                          !txt.highlightBg
                            ? "bg-slate-800 text-white border-slate-600"
                            : "text-slate-500 border-transparent"
                        }`}
                      >
                        None
                      </button>
                      <button
                        onClick={() => handleUpdateTextLayer(txt.id, { highlightBg: "#dc2626" })}
                        className="h-4 w-4 rounded bg-red-600 border border-black/40"
                        title="Red Banner"
                      />
                      <button
                        onClick={() => handleUpdateTextLayer(txt.id, { highlightBg: "#000000" })}
                        className="h-4 w-4 rounded bg-black border border-white/40"
                        title="Black Banner"
                      />
                      <button
                        onClick={() => handleUpdateTextLayer(txt.id, { highlightBg: "#7c3aed" })}
                        className="h-4 w-4 rounded bg-purple-600 border border-black/40"
                        title="Purple Banner"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SUBJECT & CUTOUT INSPECTOR */}
          {activeInspectorTab === "subject" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subject Expression Cutout
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBgRemoverImage(currentDesign.subject.imageUrl);
                      setIsBgRemoverOpen(true);
                    }}
                    className="flex items-center space-x-1 rounded-md bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm cursor-pointer"
                    title="Remove background from any photo"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>BG Remover</span>
                  </button>
                  <label className="cursor-pointer text-[11px] font-bold text-red-400 hover:text-red-300">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomSubjectUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Preset Cutout Faces */}
              <div className="grid grid-cols-3 gap-2">
                {CREATOR_CUTOUTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleUpdateSubject({ imageUrl: c.svg })}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      currentDesign.subject.imageUrl === c.svg
                        ? "border-red-500 bg-red-950/40 ring-1 ring-red-500"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-2xl mb-1">{c.preview}</div>
                    <div className="text-[10px] font-bold text-slate-300 line-clamp-1">
                      {c.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Glow & Outline Style */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3">
                <label className="text-xs font-bold text-white block">
                  Cutout Outline / Neon Halo
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
                  {(["none", "neon", "sticker", "flame"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleUpdateSubject({ glowType: type })}
                      className={`rounded-lg py-1 text-center capitalize border transition-colors ${
                        currentDesign.subject.glowType === type
                          ? "border-red-500 bg-red-600/20 text-white"
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {currentDesign.subject.glowType !== "none" && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Outline Color:</span>
                    <input
                      type="color"
                      value={currentDesign.subject.glowColor}
                      onChange={(e) => handleUpdateSubject({ glowColor: e.target.value })}
                      className="h-6 w-8 rounded cursor-pointer border border-slate-700 bg-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Position & Scale Sliders */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Scale</span>
                  <span className="font-mono text-slate-400">
                    {Math.round(currentDesign.subject.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.0"
                  step="0.05"
                  value={currentDesign.subject.scale}
                  onChange={(e) => handleUpdateSubject({ scale: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">X Position</label>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={currentDesign.subject.x}
                      onChange={(e) => handleUpdateSubject({ x: Number(e.target.value) })}
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Y Position</label>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={currentDesign.subject.y}
                      onChange={(e) => handleUpdateSubject({ y: Number(e.target.value) })}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Flip Face Horizontal:</span>
                  <button
                    onClick={() =>
                      handleUpdateSubject({
                        flipHorizontal: !currentDesign.subject.flipHorizontal,
                      })
                    }
                    className={`px-3 py-1 rounded text-xs font-semibold border ${
                      currentDesign.subject.flipHorizontal
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    {currentDesign.subject.flipHorizontal ? "Flipped" : "Normal"}
                  </button>
                </div>
              </div>

              {/* Saturation & Contrast Pop */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Mobile Pop (Saturation)</span>
                  <span className="font-mono text-amber-400">
                    +{Math.round((currentDesign.subject.saturation - 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.05"
                  value={currentDesign.subject.saturation}
                  onChange={(e) => handleUpdateSubject({ saturation: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BACKDROP INSPECTOR */}
          {activeInspectorTab === "bg" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                High-Contrast Background Formulas
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BACKGROUND_PRESETS.map((p) => {
                  const isSelected = currentDesign.background.gradientStart === p.gradientStart;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectBgPreset(p)}
                      className={`text-left rounded-xl border p-2.5 transition-all ${
                        isSelected
                          ? "border-red-500 bg-red-950/30 ring-1 ring-red-500"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className="h-9 w-full rounded-lg mb-1.5 border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${p.gradientStart}, ${p.gradientEnd})`,
                        }}
                      />
                      <div className="text-[11px] font-bold text-white line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[9px] text-slate-400 capitalize">
                        {p.type.replace("-", " ")}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Vignette Slider */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Dark Border Vignette</span>
                  <span className="font-mono text-slate-400">
                    {Math.round(currentDesign.background.vignetteIntensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.95"
                  step="0.05"
                  value={currentDesign.background.vignetteIntensity}
                  onChange={(e) =>
                    commitChange(
                      {
                        ...currentDesign,
                        background: {
                          ...currentDesign.background,
                          vignetteIntensity: Number(e.target.value),
                        },
                      },
                      "bg-vignette"
                    )
                  }
                  className="w-full accent-red-500"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Vignettes darken screen corners, drawing 80% more viewer attention to your center subject.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ACCENTS & STICKERS */}
          {activeInspectorTab === "stickers" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                High-CTR Graphic Stickers
              </span>

              {/* Quick Add Sticker Pills */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddSticker("arrow")}
                  className="rounded-xl border border-red-500/30 bg-red-950/40 p-2 text-center hover:bg-red-900/50 transition-colors"
                >
                  <div className="text-red-400 font-black text-sm">➔ RED ARROW</div>
                  <div className="text-[9px] text-slate-400">+ Action Focal</div>
                </button>

                <button
                  onClick={() => handleAddSticker("badge")}
                  className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-2 text-center hover:bg-amber-900/50 transition-colors"
                >
                  <div className="text-amber-400 font-black text-sm">100% REAL</div>
                  <div className="text-[9px] text-slate-400">+ Trust Pill</div>
                </button>

                <button
                  onClick={() => handleAddSticker("vs")}
                  className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-2 text-center hover:bg-blue-900/50 transition-colors"
                >
                  <div className="text-blue-400 font-black text-sm">VS BADGE</div>
                  <div className="text-[9px] text-slate-400">+ Battle</div>
                </button>

                <button
                  onClick={() => handleAddSticker("mystery")}
                  className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-2 text-center hover:bg-purple-900/50 transition-colors"
                >
                  <div className="text-purple-400 font-black text-sm">CENSORED</div>
                  <div className="text-[9px] text-slate-400">+ Mystery Box</div>
                </button>

                <button
                  onClick={() => handleAddSticker("cash")}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2 text-center hover:bg-emerald-900/50 transition-colors"
                >
                  <div className="text-emerald-400 font-black text-sm">$$$ BURST</div>
                  <div className="text-[9px] text-slate-400">+ High Stakes</div>
                </button>

                <button
                  onClick={() => handleAddSticker("fire")}
                  className="rounded-xl border border-orange-500/30 bg-orange-950/40 p-2 text-center hover:bg-orange-900/50 transition-colors"
                >
                  <div className="text-orange-400 font-black text-sm">🔥 FLAME</div>
                  <div className="text-[9px] text-slate-400">+ Viral Urgency</div>
                </button>
              </div>

              {/* Active Stickers List */}
              {currentDesign.stickers.map((stk) => (
                <div
                  key={stk.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 capitalize">
                      {stk.type} Accent
                    </span>
                    <button
                      onClick={() => handleDeleteSticker(stk.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block">X Pos</label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={stk.x}
                        onChange={(e) => handleUpdateSticker(stk.id, { x: Number(e.target.value) })}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block">Y Pos</label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={stk.y}
                        onChange={(e) => handleUpdateSticker(stk.id, { y: Number(e.target.value) })}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block">Scale</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.1"
                        value={stk.scale}
                        onChange={(e) =>
                          handleUpdateSticker(stk.id, { scale: Number(e.target.value) })
                        }
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Fonts Picker Modal */}
      <FontPickerModal
        isOpen={isFontPickerOpen}
        onClose={() => {
          setIsFontPickerOpen(false);
          setActiveTextIdForFont(null);
          setSavedCustomFonts(getSavedCustomFonts());
        }}
        currentFont={
          currentDesign.texts.find((t) => t.id === activeTextIdForFont)?.font || "Anton"
        }
        sampleText={
          currentDesign.texts.find((t) => t.id === activeTextIdForFont)?.text || "VIRAL HOOK"
        }
        onSelectFont={(fontName) => {
          setSavedCustomFonts(getSavedCustomFonts());
          if (activeTextIdForFont) {
            handleUpdateTextLayer(activeTextIdForFont, { font: fontName });
          } else if (currentDesign.texts.length > 0) {
            handleUpdateTextLayer(currentDesign.texts[0].id, { font: fontName });
          }
        }}
      />

      {/* Background Remover Studio Modal */}
      <BackgroundRemoverModal
        isOpen={isBgRemoverOpen}
        onClose={() => setIsBgRemoverOpen(false)}
        initialImage={bgRemoverImage || currentDesign.subject.imageUrl}
        onApplyCutout={(transparentCutout) => {
          handleUpdateSubject({
            imageUrl: transparentCutout,
            glowType: "neon",
            glowColor: "#facc15",
          });
        }}
      />
    </div>
  );
};

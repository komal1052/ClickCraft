import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  Play,
  Flame,
  ArrowRight,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  Film,
  Zap,
  Target,
  Image as ImageIcon,
  Copy,
  Wand2,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  SAMPLE_VIDEOS,
  CREATOR_CUTOUTS,
  BACKGROUND_PRESETS,
  VIRAL_REFERENCES,
  ViralReference,
} from "../data/samples";
import {
  SampleVideo,
  VideoAnalysisResult,
  ThumbnailDesign,
  ABVariant,
  ReferenceDeconstruction,
} from "../types/thumbnail";
import { BackgroundRemoverModal } from "./BackgroundRemoverModal";

interface VideoAnalyzerProps {
  onApplyDesignToEditor: (design: ThumbnailDesign) => void;
  onUpdateABVariants: (variants: ABVariant[]) => void;
  onNavigateToTab: (tab: "editor" | "ab-test") => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  onApplyDesignToEditor,
  onUpdateABVariants,
  onNavigateToTab,
}) => {
  // Workflow Mode: "video" (analyze video premise/frames) or "reference" (reverse engineer reference thumbnail)
  const [workflowMode, setWorkflowMode] = useState<"video" | "reference">("video");

  const [selectedSample, setSelectedSample] = useState<SampleVideo>(SAMPLE_VIDEOS[0]);
  const [videoTitle, setVideoTitle] = useState(SAMPLE_VIDEOS[0].title);
  const [videoDescription, setVideoDescription] = useState(SAMPLE_VIDEOS[0].description);
  const [category, setCategory] = useState(SAMPLE_VIDEOS[0].niche);
  const [targetVibe, setTargetVibe] = useState("High Energy Viral");

  // Extracted frames from sample or uploaded video
  const [extractedFrames, setExtractedFrames] = useState<string[]>(SAMPLE_VIDEOS[0].frames);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(SAMPLE_VIDEOS[0].frames[0] || null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Thumbnail Reference State
  const [referenceImage, setReferenceImage] = useState<string | null>(VIRAL_REFERENCES[0].svgPreview);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(VIRAL_REFERENCES[0].id);
  const [isAnalyzingReference, setIsAnalyzingReference] = useState<boolean>(false);
  const [referenceResult, setReferenceResult] = useState<ReferenceDeconstruction | null>(null);

  // Background Remover State
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState<boolean>(false);
  const [bgRemoverFrameImage, setBgRemoverFrameImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Handle switching sample video
  const handleSelectSample = (sample: SampleVideo) => {
    setSelectedSample(sample);
    setVideoTitle(sample.title);
    setVideoDescription(sample.description);
    setCategory(sample.niche);
    setExtractedFrames(sample.frames);
    setSelectedFrame(sample.frames[0] || null);
    setAnalysisResult(null);
  };

  // Handle local video upload & frame extraction
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;

    setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
    setErrorMsg(null);

    video.onloadedmetadata = async () => {
      const duration = video.duration || 10;
      const timestamps = [duration * 0.1, duration * 0.35, duration * 0.65, duration * 0.85];
      const captured: string[] = [];

      for (const time of timestamps) {
        await new Promise<void>((resolve) => {
          video.currentTime = time;
          video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, 640, 360);
              captured.push(canvas.toDataURL("image/jpeg", 0.85));
            }
            resolve();
          };
        });
      }

      if (captured.length > 0) {
        setExtractedFrames(captured);
        setSelectedFrame(captured[0]);
      }
    };
  };

  // Handle frame upload as direct image
  const handleImageFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setExtractedFrames((prev) => [base64, ...prev]);
        setSelectedFrame(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle custom reference thumbnail upload
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setReferenceImage(base64);
        setSelectedReferenceId(null);
        setReferenceResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select a viral benchmark reference
  const handleSelectViralReference = (ref: ViralReference) => {
    setSelectedReferenceId(ref.id);
    setReferenceImage(ref.svgPreview);
    setReferenceResult(null);
  };

  // Run AI Video Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoTitle,
          description: videoDescription,
          category,
          targetVibe,
          videoFrameBase64: selectedFrame,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze video packaging");
      }

      const result: VideoAnalysisResult = json.data;
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze video. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run AI Reference Thumbnail Reverse Engineering
  const handleRunReferenceAnalysis = async () => {
    if (!referenceImage) {
      setErrorMsg("Please select or upload a thumbnail reference first.");
      return;
    }

    setIsAnalyzingReference(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/analyze-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceImageBase64: referenceImage,
          videoTitle,
          videoDescription,
          category,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze reference thumbnail");
      }

      const result: ReferenceDeconstruction = {
        ...json.data,
        referenceImageUrl: referenceImage,
      };
      setReferenceResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to deconstruct reference thumbnail. Please try again.");
    } finally {
      setIsAnalyzingReference(false);
    }
  };

  // Build a ThumbnailDesign object from an AI variant recipe
  const buildDesignFromAiVariant = (
    variantRecipe: VideoAnalysisResult["abVariants"][0]
  ): ThumbnailDesign => {
    let bg = BACKGROUND_PRESETS[0];
    if (variantRecipe.bgTheme?.includes("cyber") || variantRecipe.bgTheme?.includes("blue")) {
      bg = BACKGROUND_PRESETS[1];
    } else if (variantRecipe.bgTheme?.includes("mystery") || variantRecipe.bgTheme?.includes("purple")) {
      bg = BACKGROUND_PRESETS[3];
    } else if (variantRecipe.bgTheme?.includes("gold") || variantRecipe.bgTheme?.includes("wealth")) {
      bg = BACKGROUND_PRESETS[4];
    } else if (variantRecipe.bgTheme?.includes("split") || variantRecipe.bgTheme?.includes("volcano")) {
      bg = BACKGROUND_PRESETS[2];
    }

    const cutout = CREATOR_CUTOUTS[0];

    return {
      id: `ai-design-${Date.now()}`,
      title: variantRecipe.name,
      background: bg,
      subject: {
        imageUrl: selectedFrame || cutout.svg,
        x: 72,
        y: 60,
        scale: 1.25,
        flipHorizontal: false,
        glowColor: variantRecipe.accentColor || "#facc15",
        glowWidth: 14,
        glowType: "neon",
        brightness: 1.15,
        contrast: 1.2,
        saturation: 1.25,
      },
      texts: [
        {
          id: "t1-gen",
          text: variantRecipe.headline,
          font: "Anton",
          fontSize: 88,
          color: "#ffffff",
          strokeColor: "#000000",
          strokeWidth: 16,
          x: 30,
          y: 28,
          rotation: -4,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 20,
          isUppercase: true,
          highlightBg: variantRecipe.accentColor || "#dc2626",
        },
        {
          id: "t2-gen",
          text: variantRecipe.subline,
          font: "Bebas Neue",
          fontSize: 96,
          color: variantRecipe.accentColor || "#facc15",
          strokeColor: "#000000",
          strokeWidth: 18,
          x: 34,
          y: 52,
          rotation: -2,
          shadowColor: "rgba(0,0,0,0.95)",
          shadowBlur: 24,
          isUppercase: true,
        },
      ],
      stickers: [
        ...(variantRecipe.showArrow
          ? [
              {
                id: "stk-arrow",
                type: "arrow" as const,
                color: variantRecipe.accentColor || "#ef4444",
                x: 52,
                y: 45,
                scale: 1.1,
                rotation: -18,
              },
            ]
          : []),
        {
          id: "stk-badge",
          type: "badge" as const,
          label: variantRecipe.badgeText || "100% REAL",
          color: variantRecipe.accentColor || "#f59e0b",
          x: 22,
          y: 78,
          scale: 1.0,
          rotation: 3,
        },
      ],
      showSafeZoneOverlay: true,
      showHeatmap: false,
      aspectRatio: "16:9",
      referenceImageOverlay: referenceImage || undefined,
      referenceOpacity: 0.35,
      showReferenceGhost: false,
    };
  };

  // Apply single variant to editor
  const handleApplyVariant = (variantRecipe: VideoAnalysisResult["abVariants"][0]) => {
    const design = buildDesignFromAiVariant(variantRecipe);
    onApplyDesignToEditor(design);
    onNavigateToTab("editor");
  };

  // Push all 3 variants into A/B testing lab
  const handleSendAllToABTesting = () => {
    if (!analysisResult) return;

    const newVariants: ABVariant[] = analysisResult.abVariants.map((v, idx) => {
      const design = buildDesignFromAiVariant(v);
      return {
        id: `ai-ab-${v.id || idx}`,
        name: v.name,
        tagline: v.styleBadge || "High-Impact Variant",
        hypothesis: v.hypothesis,
        design,
        predictedCtr: v.predictedCtr || 11 + idx * 1.4,
        readabilityScore: 9.2,
        emotionScore: 9.4,
        contrastScore: 9.0,
        curiosityScore: 8.8,
        trafficShare: Math.round(100 / analysisResult.abVariants.length),
        impressions: 125000 + idx * 8000,
        clicks: Math.round((125000 + idx * 8000) * ((v.predictedCtr || 11.5) / 100)),
        realtimeCtr: v.predictedCtr || 11.5,
        avdSeconds: 380 + idx * 25,
        heatmapPoints: [
          { x: 70, y: 40, intensity: 0.95, label: "Subject Emotion" },
          { x: 32, y: 30, intensity: 0.92, label: `Hook '${v.headline}'` },
          { x: 45, y: 55, intensity: 0.78, label: "Secondary Focus" },
        ],
        strengths: [
          "Optimized visual hierarchy guides gaze in under 0.4 seconds",
          "Color palette engineered to contrast against YouTube dark theme",
        ],
        weaknesses: [],
      };
    });

    onUpdateABVariants(newVariants);
    onNavigateToTab("ab-test");
  };

  // Apply Reverse-Engineered Reference Style to Canvas Studio
  const handleApplyReferenceToCanvas = () => {
    if (!referenceResult) return;

    const bp = referenceResult.layoutBlueprint;
    const pal = referenceResult.palette;

    const clonedDesign: ThumbnailDesign = {
      id: `ref-cloned-${Date.now()}`,
      title: `${referenceResult.styleTitle} (Cloned)`,
      background: {
        type: bp.bgType || "radial-burst",
        gradientStart: pal.backgroundGradientStart || "#dc2626",
        gradientEnd: pal.backgroundGradientEnd || "#05070e",
        gradientAngle: 45,
        burstColor: pal.accentColor || "#ef4444",
        vignetteIntensity: 0.7,
      },
      subject: {
        imageUrl: selectedFrame || CREATOR_CUTOUTS[0].svg,
        x: bp.subjectX || 72,
        y: bp.subjectY || 60,
        scale: bp.subjectScale || 1.25,
        flipHorizontal: false,
        glowColor: bp.subjectGlowColor || "#FACC15",
        glowWidth: 16,
        glowType: bp.subjectGlowType || "neon",
        brightness: 1.15,
        contrast: 1.2,
        saturation: 1.3,
      },
      texts: [
        {
          id: "t1-ref",
          text: referenceResult.adaptedHeadline || "MUST SEE",
          font: bp.fontFamily || "Anton",
          fontSize: bp.fontSize || 88,
          color: pal.textColor || "#FFE600",
          strokeColor: pal.textStroke || "#000000",
          strokeWidth: bp.strokeWidth || 16,
          x: bp.textX || 30,
          y: bp.textY || 30,
          rotation: bp.textRotation || -4,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 20,
          isUppercase: true,
          highlightBg: pal.highlightBg || undefined,
        },
        {
          id: "t2-ref",
          text: referenceResult.adaptedSubline || "DO NOT MISS",
          font: "Bebas Neue",
          fontSize: 94,
          color: pal.textColor || "#ffffff",
          strokeColor: pal.textStroke || "#000000",
          strokeWidth: bp.strokeWidth || 18,
          x: (bp.textX || 30) + 4,
          y: (bp.textY || 30) + 24,
          rotation: (bp.textRotation || -4) + 1,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 22,
          isUppercase: true,
        },
      ],
      stickers: [
        ...(bp.hasArrow
          ? [
              {
                id: "stk-ref-arrow",
                type: "arrow" as const,
                color: pal.accentColor || "#ef4444",
                x: bp.arrowX || 52,
                y: bp.arrowY || 45,
                scale: 1.1,
                rotation: bp.arrowRotation || -16,
              },
            ]
          : []),
        {
          id: "stk-ref-badge",
          type: "badge" as const,
          label: bp.badgeText || "100% REAL",
          color: pal.accentColor || "#f59e0b",
          x: 22,
          y: 78,
          scale: 1.0,
          rotation: 3,
        },
      ],
      showSafeZoneOverlay: true,
      showHeatmap: false,
      aspectRatio: "16:9",
      referenceImageOverlay: referenceResult.referenceImageUrl,
      referenceOpacity: 0.35,
      showReferenceGhost: true, // Auto-enable tracing mode!
    };

    onApplyDesignToEditor(clonedDesign);
    onNavigateToTab("editor");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-amber-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Step 1: AI Video & Packaging Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Analyze Video, Extract Peaks, or Clone Thumbnail Reference
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Generate high-converting thumbnails from video scripts, or provide a successful
              thumbnail reference so the AI reverse-engineers its layout, colors, and typography to follow!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm">
              <Film className="h-4 w-4 text-red-400" />
              <span>Upload Video (.mp4)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </label>

            <label className="flex cursor-pointer items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm">
              <Upload className="h-4 w-4 text-amber-400" />
              <span>Upload Frame</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFrameUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Workflow Tabs: Standard Video Analysis vs Reference Thumbnail Clone */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWorkflowMode("video")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              workflowMode === "video"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-500"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Mode 1: Video Premise Analysis</span>
          </button>

          <button
            onClick={() => setWorkflowMode("reference")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              workflowMode === "reference"
                ? "bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            }`}
          >
            <ImageIcon className="h-4 w-4 text-amber-400" />
            <span>Mode 2: Follow Thumbnail Reference (Style Clone)</span>
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300 uppercase">
              New
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:block">
          {workflowMode === "video"
            ? "Formulates strategy from scratch based on topic"
            : "Replicates high-performing YouTube visual formulas"}
        </span>
      </div>

      {/* MODE 1: STANDARD VIDEO PREMISE ANALYSIS */}
      {workflowMode === "video" && (
        <>
          {/* Preset Video Samples */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-red-400" />
              <span>Choose A Creator Scenario Benchmark</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = selectedSample.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`text-left rounded-xl p-4 transition-all border ${
                      isSelected
                        ? "border-red-500 bg-red-950/30 shadow-lg shadow-red-500/10 ring-1 ring-red-500"
                        : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-red-400 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
                        {sample.niche}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {sample.duration}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-2 mb-1">
                      {sample.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {sample.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form & Frame Extraction */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-7 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Video Content Metadata & Framing</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Working Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. I Survived 100 Days in the Wild..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Premise / Core Hook Description
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe the stakes, the main climax or the shocking revelation..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Channel Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-red-500 focus:outline-none"
                  >
                    <option>Entertainment & Viral Challenges</option>
                    <option>Tech & Hardware Reviews</option>
                    <option>Gaming & Stream Highlights</option>
                    <option>Education, Coding & Career</option>
                    <option>Finance, Crypto & Business</option>
                    <option>Documentary & True Mystery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Psychological Vibe
                  </label>
                  <select
                    value={targetVibe}
                    onChange={(e) => setTargetVibe(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-red-500 focus:outline-none"
                  >
                    <option>High Energy Viral (MrBeast Style)</option>
                    <option>Curiosity Gap & Untold Secret</option>
                    <option>Extreme Stakes & Dollar Comparison</option>
                    <option>Authoritative Pro & Shocking Fact</option>
                  </select>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !videoTitle.trim()}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Gemini Analyzing Video & Formulating CTR Variants...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate High-CTR Strategy & A/B Variants</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/50 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Extracted Frames */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="h-4 w-4 text-red-400" />
                  <span>Extracted Video Frames</span>
                </h3>
                {selectedFrame && (
                  <button
                    type="button"
                    onClick={() => {
                      setBgRemoverFrameImage(selectedFrame);
                      setIsBgRemoverOpen(true);
                    }}
                    className="flex items-center space-x-1 rounded-md bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm cursor-pointer"
                    title="Remove background from selected video frame"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Cutout / BG Remover</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {extractedFrames.map((frameSrc, idx) => {
                  const isSelected = selectedFrame === frameSrc;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedFrame(frameSrc)}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border aspect-video transition-all ${
                        isSelected
                          ? "border-red-500 ring-2 ring-red-500/80 shadow-md"
                          : "border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={frameSrc}
                        alt={`Frame ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-mono text-white">
                        Peak #{idx + 1}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-red-500/15 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-red-400 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                  <span>Facial Gaze & Energy Detection</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Top YouTube packaging directors extract frames with direct viewer eye contact or extreme emotional expressions. The selected frame will be used as the thumbnail subject cutout.
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Predicted Baseline CTR
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-amber-400">
                      {analysisResult.baselineCtrEstimate}%
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      +3.4% above niche average
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Psychological Trigger
                  </span>
                  <div className="mt-1 text-sm font-bold text-white line-clamp-2">
                    {analysisResult.targetAudience}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Core Cognitive Hook
                  </span>
                  <div className="mt-1 text-xs text-slate-300 line-clamp-2">
                    {analysisResult.contentHook}
                  </div>
                </div>
              </div>

              {/* Recommended Punchlines */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-red-500" />
                  <span>Recommended 3-Word Viral Punchlines (Never Repeat The Title)</span>
                </h3>

                <div className="flex flex-wrap gap-2.5 mb-4">
                  {analysisResult.recommendedPunchlines?.map((punchline, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      <span className="text-amber-400 font-black">#{i + 1}</span>
                      <span>"{punchline}"</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">Recommended Contrast Palette:</span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: analysisResult.colorStrategy.primary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: analysisResult.colorStrategy.secondary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: analysisResult.colorStrategy.accentGlow }}
                    />
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {analysisResult.colorStrategy.rationale}
                  </span>
                </div>
              </div>

              {/* 3 Generated Variants */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-red-500" />
                      <span>3 AI-Engineered A/B Test Variant Blueprints</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Each variant tests a distinct psychological hypothesis to determine the winning packaging formula.
                    </p>
                  </div>

                  <button
                    onClick={handleSendAllToABTesting}
                    className="flex items-center space-x-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                  >
                    <span>Deploy All 3 to A/B Testing Lab</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analysisResult.abVariants.map((variant, idx) => (
                    <div
                      key={variant.id || idx}
                      className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {variant.styleBadge || `Variant ${String.fromCharCode(65 + idx)}`}
                          </span>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            ~{variant.predictedCtr}% Predicted CTR
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-white">
                          {variant.name}
                        </h4>

                        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-4 aspect-video flex flex-col justify-between shadow-inner">
                          <div className="space-y-1">
                            <div
                              className="inline-block px-2 py-0.5 text-xs font-black rounded shadow"
                              style={{ backgroundColor: variant.accentColor || "#dc2626", color: "#ffffff" }}
                            >
                              {variant.headline}
                            </div>
                            <div className="text-lg font-black text-yellow-300 drop-shadow">
                              {variant.subline}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">
                              Badge: {variant.badgeText}
                            </span>
                            {variant.showArrow && (
                              <span className="text-red-400 font-bold">Includes Action Arrow</span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Hypothesis:</strong> {variant.hypothesis}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 mt-4">
                        <button
                          onClick={() => handleApplyVariant(variant)}
                          className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                        >
                          <span>Open in Canvas Studio</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODE 2: REVERSE-ENGINEER & CLONE THUMBNAIL REFERENCE */}
      {workflowMode === "reference" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Reference Selector & Custom Upload Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Reference Image Preview & Controls */}
            <div className="lg:col-span-6 rounded-2xl border border-amber-500/30 bg-slate-900/80 p-6 backdrop-blur-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-amber-400" />
                    <span>Target Reference Thumbnail</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Upload an image or pick a viral YouTube template to follow.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center space-x-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-xs font-bold text-black transition-colors shadow-md shadow-amber-500/20">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Reference (.png, .jpg)</span>
                  <input
                    ref={refFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                </label>
              </div>

              {/* Reference Image Stage */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
                {referenceImage ? (
                  <img
                    src={referenceImage}
                    alt="Reference Thumbnail"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span>No reference selected</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                  REFERENCE BLUEPRINT
                </div>
              </div>

              {/* Your Target Video Info (What will be adapted) */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Adapt To Your Video Topic:
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Your Video Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter your video title..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Your Core Premise / Hook
                  </label>
                  <input
                    type="text"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Brief description of the climax..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunReferenceAnalysis}
                disabled={isAnalyzingReference || !referenceImage}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-red-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAnalyzingReference ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Gemini Deconstructing Reference & Cloning Recipe...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Reverse-Engineer & Follow Reference Style</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Right: Curated Viral Reference Templates */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span>Or Pick A Proven Viral Benchmark Template</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select a classic high-CTR packaging format to reverse-engineer immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {VIRAL_REFERENCES.map((ref) => {
                  const isSelected = selectedReferenceId === ref.id;
                  return (
                    <button
                      key={ref.id}
                      onClick={() => handleSelectViralReference(ref)}
                      className={`text-left rounded-xl p-3 border transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-2 border border-slate-800 bg-black">
                        <img
                          src={ref.svgPreview}
                          alt={ref.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                          {ref.creatorTag}
                        </span>
                        <span className="text-[9px] text-slate-500">{ref.category}</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {ref.name}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {ref.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reference Analysis Deconstruction Results Card */}
          {referenceResult && (
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-6 backdrop-blur-md space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Deconstruction Complete</span>
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {referenceResult.styleTitle}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                    {referenceResult.whyItWorks}
                  </p>
                </div>

                <button
                  onClick={handleApplyReferenceToCanvas}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>Apply Cloned Reference to Canvas Studio</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {/* Deconstructed Blueprint Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Adapted Punchlines */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Adapted Viral Hook Phrasing
                  </span>
                  <div className="rounded-lg bg-red-600/20 border border-red-500/30 px-3 py-2">
                    <div className="text-sm font-black text-white">
                      "{referenceResult.adaptedHeadline}"
                    </div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      "{referenceResult.adaptedSubline}"
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Engineered to match the reference syntax, font weight, and curiosity gap.
                  </p>
                </div>

                {/* 2. Extracted Palette */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Extracted Color Palette
                  </span>
                  <div className="flex items-center space-x-3 pt-1">
                    <div className="text-center">
                      <div
                        className="h-8 w-8 rounded-full border border-white/20 mx-auto mb-1 shadow"
                        style={{ backgroundColor: referenceResult.palette.backgroundGradientStart }}
                      />
                      <span className="text-[9px] text-slate-400 block font-mono">Backdrop</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-8 w-8 rounded-full border border-white/20 mx-auto mb-1 shadow"
                        style={{ backgroundColor: referenceResult.palette.textColor }}
                      />
                      <span className="text-[9px] text-slate-400 block font-mono">Headline</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-8 w-8 rounded-full border border-white/20 mx-auto mb-1 shadow"
                        style={{ backgroundColor: referenceResult.palette.accentColor }}
                      />
                      <span className="text-[9px] text-slate-400 block font-mono">Accent</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Typography: <strong className="text-white">{referenceResult.layoutBlueprint.fontFamily}</strong> with {referenceResult.layoutBlueprint.strokeWidth}px stroke.
                  </div>
                </div>

                {/* 3. Ghost / Onion Skin Tracing Preview */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Onion-Skin Tracing Enabled
                  </span>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <Layers className="h-4 w-4" />
                    <span>Ghost Overlay will appear in Canvas Studio</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    When you open Canvas Studio, an onion-skin slider lets you fade between your thumbnail and this reference to verify alignment!
                  </p>
                </div>
              </div>

              {/* Key Techniques */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Reverse-Engineered Packaging Techniques:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  {referenceResult.keyTechniques?.map((tech, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Background Remover Modal */}
      <BackgroundRemoverModal
        isOpen={isBgRemoverOpen}
        onClose={() => {
          setIsBgRemoverOpen(false);
          setBgRemoverFrameImage(null);
        }}
        initialImage={bgRemoverFrameImage || selectedFrame || CREATOR_CUTOUTS[0].svg}
        onApplyCutout={(transparentCutout) => {
          setExtractedFrames((prev) => [transparentCutout, ...prev]);
          setSelectedFrame(transparentCutout);
        }}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Wand2,
  Sliders,
  Check,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Pipette,
  Layers,
} from "lucide-react";
import { removeBackground, samplePixelColor, BgRemoverOptions } from "../utils/bgRemover";

interface BackgroundRemoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  onApplyCutout: (transparentPngBase64: string) => void;
}

export const BackgroundRemoverModal: React.FC<BackgroundRemoverModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  onApplyCutout,
}) => {
  const [sourceImage, setSourceImage] = useState<string>(initialImage);
  const [processedCutout, setProcessedCutout] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter options
  const [tolerance, setTolerance] = useState<number>(32);
  const [feather, setFeather] = useState<number>(2);
  const [protectCenter, setProtectCenter] = useState<boolean>(true);
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number } | null>(null);

  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen && initialImage) {
      setSourceImage(initialImage);
    }
  }, [isOpen, initialImage]);

  // Run background removal whenever parameters or source changes
  useEffect(() => {
    if (!isOpen || !sourceImage) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const result = await removeBackground(sourceImage, {
          tolerance,
          feather,
          protectCenter,
          targetColor,
        });
        if (isMounted) {
          setProcessedCutout(result);
        }
      } catch (err) {
        console.error("Failed to process background removal:", err);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, sourceImage, tolerance, feather, protectCenter, targetColor]);

  if (!isOpen) return null;

  // Handle uploading a new photo to remove BG from
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      if (b64) {
        setSourceImage(b64);
        setTargetColor(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Eyedropper click on image
  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    try {
      const sampled = await samplePixelColor(sourceImage, nx, ny);
      setTargetColor(sampled);
      setIsEyedropperActive(false);
    } catch (err) {
      console.warn("Could not sample color:", err);
    }
  };

  // Download Transparent Cutout
  const handleDownload = () => {
    if (!processedCutout) return;
    const link = document.createElement("a");
    link.download = `creator-cutout-transparent-${Date.now()}.png`;
    link.href = processedCutout;
    link.click();
  };

  // Apply to canvas
  const handleApply = () => {
    if (!processedCutout) return;
    onApplyCutout(processedCutout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-md shadow-red-500/20">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>AI Background Remover Studio</span>
                <span className="rounded bg-red-600/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                  INSTANT CUTOUT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Isolate creator faces and subjects into clean transparent PNGs for your YouTube thumbnail.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Studio Body: Preview Stage & Controls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Before / After Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Original Photo / Frame</span>
                  {isEyedropperActive && (
                    <span className="text-amber-400 text-[10px] animate-pulse">
                      Click background color to sample
                    </span>
                  )}
                </div>
                <div
                  className={`relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border bg-black shadow-inner flex items-center justify-center ${
                    isEyedropperActive ? "cursor-crosshair ring-2 ring-amber-400" : "border-slate-800"
                  }`}
                >
                  <img
                    ref={imgRef}
                    src={sourceImage}
                    alt="Original"
                    onClick={handleImageClick}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    BEFORE
                  </div>
                </div>
              </div>

              {/* Cutout Result */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Transparent Cutout</span>
                  {isProcessing && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-normal">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Refining...</span>
                    </span>
                  )}
                </div>
                {/* Checkerboard transparent background */}
                <div
                  className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-emerald-500/30 shadow-inner flex items-center justify-center"
                  style={{
                    backgroundColor: "#18181b",
                    backgroundImage: `
                      linear-gradient(45deg, #27272a 25%, transparent 25%),
                      linear-gradient(-45deg, #27272a 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #27272a 75%),
                      linear-gradient(-45deg, transparent 75%, #27272a 75%)
                    `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                >
                  {processedCutout ? (
                    <img
                      src={processedCutout}
                      alt="Cutout"
                      className="max-h-full max-w-full object-contain filter drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs">Processing...</div>
                  )}
                  <div className="absolute top-2 left-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                    AFTER (TRANSPARENT)
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Upload Another Image */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-xs text-slate-400">
                Want to remove background from a different photo?
              </span>
              <label className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors">
                <Upload className="h-3.5 w-3.5 text-amber-400" />
                <span>Upload New Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </label>
            </div>
          </div>

          {/* Right: Fine-Tune Controls */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4 text-xs">
            <h3 className="font-extrabold text-white flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Cutout Precision Controls</span>
            </h3>

            {/* Tolerance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Background Tolerance</span>
                <span className="font-mono text-amber-400">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-500">
                Increase if too much background remains. Decrease if parts of subject vanish.
              </p>
            </div>

            {/* Feather / Edge Smoothness */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Edge Feather (Softness)</span>
                <span className="font-mono text-amber-400">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={feather}
                onChange={(e) => setFeather(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-500">
                Eliminates jagged pixel borders for seamless thumbnail layering.
              </p>
            </div>

            {/* Target Background Color & Eyedropper */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">
                Background Color Keying:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setTargetColor(null);
                    setIsEyedropperActive(false);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                    targetColor === null
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-slate-900 text-slate-400 border-slate-700"
                  }`}
                >
                  Auto Perimeter
                </button>

                <button
                  onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                    isEyedropperActive
                      ? "bg-amber-500 text-black border-amber-400"
                      : "bg-slate-900 text-slate-300 border-slate-700"
                  }`}
                >
                  <Pipette className="h-3 w-3" />
                  <span>{isEyedropperActive ? "Click Image" : "Eyedropper"}</span>
                </button>

                {targetColor && (
                  <div
                    className="h-6 w-6 rounded border border-white/40 shadow"
                    style={{
                      backgroundColor: `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`,
                    }}
                    title={`Color: rgb(${targetColor.r},${targetColor.g},${targetColor.b})`}
                  />
                )}
              </div>
            </div>

            {/* Protect Center Subject */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300 block">
                  Protect Central Face
                </span>
                <span className="text-[10px] text-slate-500">
                  Prevents center subject from erasing
                </span>
              </div>
              <input
                type="checkbox"
                checked={protectCenter}
                onChange={(e) => setProtectCenter(e.target.checked)}
                className="h-4 w-4 rounded accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            disabled={!processedCutout}
            className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PNG Cutout</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!processedCutout}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-5 py-2 text-xs font-black text-white shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
              <span>Apply Cutout to Thumbnail Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

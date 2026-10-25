import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Type,
  Check,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Sliders,
  Plus,
  Upload,
  Globe,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import {
  GOOGLE_FONTS_CATALOG,
  GoogleFontItem,
  loadGoogleFont,
  getSavedCustomFonts,
  saveCustomFont,
  deleteCustomFont,
  loadFontFromFile,
  loadFontFromOnlineUrl,
} from "../utils/fontLoader";

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFont: string;
  onSelectFont: (fontName: string) => void;
  sampleText?: string;
}

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
  isOpen,
  onClose,
  currentFont,
  onSelectFont,
  sampleText = "VIRAL HOOK",
}) => {
  const [activeTab, setActiveTab] = useState<"catalog" | "add_custom">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customPreviewText, setCustomPreviewText] = useState(sampleText);
  const [loadingFontId, setLoadingFontId] = useState<string | null>(null);

  // Custom fonts list
  const [customFonts, setCustomFonts] = useState<GoogleFontItem[]>([]);

  // Add Custom Font Form State
  const [addMode, setAddMode] = useState<"google_name" | "web_url" | "upload_file">("google_name");
  const [googleFontInputName, setGoogleFontInputName] = useState("");
  const [customUrlName, setCustomUrlName] = useState("");
  const [customUrlAddress, setCustomUrlAddress] = useState("");
  const [addStatusMessage, setAddStatusMessage] = useState<{
    type: "success" | "error" | "loading";
    text: string;
  } | null>(null);

  // Load custom fonts and preload popular ones on mount/open
  useEffect(() => {
    if (!isOpen) return;
    const loaded = getSavedCustomFonts();
    setCustomFonts(loaded);

    // Preload top fonts for snappy rendering
    const topFonts = [
      "Anton",
      "Bebas Neue",
      "Bungee",
      "Oswald",
      "Montserrat",
      "Bangers",
      "Lilita One",
      ...loaded.map((f) => f.name),
    ];
    topFonts.forEach((f) => loadGoogleFont(f));
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    "All",
    "Custom Free Fonts",
    "Viral & Display",
    "Bold Sans",
    "Comic & Gaming",
    "Serif & Classic",
    "Impact & Marker",
  ];

  const allAvailableFonts: GoogleFontItem[] = [
    ...customFonts,
    ...GOOGLE_FONTS_CATALOG,
  ];

  const filteredFonts = allAvailableFonts.filter((f) => {
    if (selectedCategory === "Custom Free Fonts") {
      if (!f.isCustom && f.category !== "Custom Free Font") return false;
    } else if (selectedCategory !== "All" && f.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.creatorStyle.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handlePickFont = async (fontName: string) => {
    setLoadingFontId(fontName);
    await loadGoogleFont(fontName);
    setLoadingFontId(null);
    onSelectFont(fontName);
    onClose();
  };

  const handleDeleteSavedFont = (e: React.MouseEvent, fontName: string) => {
    e.stopPropagation();
    deleteCustomFont(fontName);
    setCustomFonts(getSavedCustomFonts());
  };

  // Add free font by Google Font name
  const handleAddGoogleFontByName = async (fontNameToAdd?: string) => {
    const targetName = (fontNameToAdd || googleFontInputName).trim();
    if (!targetName) {
      setAddStatusMessage({
        type: "error",
        text: "Please enter a valid Google Font name (e.g. Orbitron, Creepster, Press Start 2P).",
      });
      return;
    }

    setAddStatusMessage({ type: "loading", text: `Fetching and verifying "${targetName}" from Google Fonts library...` });

    try {
      const ok = await loadGoogleFont(targetName);
      if (ok) {
        const newFontItem: GoogleFontItem = {
          id: `custom-gf-${Date.now()}`,
          name: targetName,
          category: "Custom Free Font",
          creatorStyle: "Free Google Web Font (100% Free to Use)",
          isCustom: true,
        };

        saveCustomFont(newFontItem);
        setCustomFonts(getSavedCustomFonts());
        setAddStatusMessage({
          type: "success",
          text: `"${targetName}" successfully verified and added to your free font collection!`,
        });
        setGoogleFontInputName("");

        // Auto apply and switch back to catalog
        setTimeout(() => {
          onSelectFont(targetName);
          setActiveTab("catalog");
        }, 800);
      } else {
        setAddStatusMessage({
          type: "error",
          text: `Could not load "${targetName}". Please check the spelling or choose from suggested free fonts below.`,
        });
      }
    } catch (err: any) {
      setAddStatusMessage({
        type: "error",
        text: err?.message || "Failed to load Google Font. Please try another name.",
      });
    }
  };

  // Add free font by direct Web Font URL
  const handleAddFontByUrl = async () => {
    if (!customUrlName.trim()) {
      setAddStatusMessage({ type: "error", text: "Please enter a display name for this free font." });
      return;
    }
    if (!customUrlAddress.trim() || !customUrlAddress.startsWith("http")) {
      setAddStatusMessage({ type: "error", text: "Please provide a valid URL starting with http:// or https://" });
      return;
    }

    setAddStatusMessage({ type: "loading", text: `Downloading and registering free web font from URL...` });

    try {
      await loadFontFromOnlineUrl(customUrlName.trim(), customUrlAddress.trim());
      setCustomFonts(getSavedCustomFonts());
      setAddStatusMessage({
        type: "success",
        text: `Font "${customUrlName}" loaded successfully and saved to your library!`,
      });
      const chosenName = customUrlName.trim();
      setCustomUrlName("");
      setCustomUrlAddress("");

      setTimeout(() => {
        onSelectFont(chosenName);
        setActiveTab("catalog");
      }, 800);
    } catch (err: any) {
      setAddStatusMessage({
        type: "error",
        text: err?.message || "Failed to load font from URL. Please ensure CORS is enabled and URL is public.",
      });
    }
  };

  // Add free font by File Upload (.ttf, .otf, .woff2)
  const handleAddFontByFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddStatusMessage({ type: "loading", text: `Processing free font file "${file.name}"...` });

    try {
      const registeredName = await loadFontFromFile(file);
      setCustomFonts(getSavedCustomFonts());
      setAddStatusMessage({
        type: "success",
        text: `Font "${registeredName}" installed into browser session successfully!`,
      });

      setTimeout(() => {
        onSelectFont(registeredName);
        setActiveTab("catalog");
      }, 800);
    } catch (err: any) {
      setAddStatusMessage({
        type: "error",
        text: "Could not parse font file. Ensure it is a valid .ttf, .otf, or .woff2 file.",
      });
    }
  };

  // Popular Free Google Fonts suggestions
  const suggestedFreeFonts = [
    { name: "Orbitron", style: "Sci-Fi & High-Tech Futuristic" },
    { name: "Creepster", style: "Horror, Mystery & Spooky Hype" },
    { name: "Press Start 2P", style: "Retro 8-Bit Pixel Gaming" },
    { name: "Fredoka", style: "Soft Chunky Friendly Rounded" },
    { name: "Syne", style: "Ultra-Avant-Garde Designer Bold" },
    { name: "Cinzel Decorative", style: "Mythic Royal & Fantasy Epic" },
    { name: "Rubik Beastly", style: "Rough Distorted Beastly Impact" },
    { name: "Special Elite", style: "Gritty Vintage Typewriter" },
    { name: "Bungee Shade", style: "Extruded 3D Isometric Headline" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  Typography & Free Custom Fonts
                </h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  100% FREE TO USE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse viral YouTube typography or import any free Google Font / web font URL.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => {
                  setActiveTab("catalog");
                  setAddStatusMessage(null);
                }}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "catalog"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>Font Catalog</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("add_custom");
                  setAddStatusMessage(null);
                }}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "add_custom"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Free Custom Font</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: CATALOG VIEW */}
        {activeTab === "catalog" && (
          <>
            {/* Search, Category Filters, and Sample Text Input */}
            <div className="border-b border-slate-800 bg-slate-950/40 p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by font name or style (e.g. Anton, Gaming, Bold)..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Live Custom Text Previewer */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                    Preview:
                  </span>
                  <input
                    type="text"
                    value={customPreviewText}
                    onChange={(e) => setCustomPreviewText(e.target.value)}
                    placeholder="Type sample hook..."
                    className="w-44 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-bold uppercase focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Quick Add Custom Font CTA */}
                <button
                  onClick={() => setActiveTab("add_custom")}
                  className="flex items-center space-x-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Add Font</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => {
                  const isCustomCat = cat === "Custom Free Fonts";
                  const countLabel = isCustomCat && customFonts.length > 0 ? ` (${customFonts.length})` : "";
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        selectedCategory === cat
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : isCustomCat && customFonts.length > 0
                          ? "text-amber-400 border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40"
                          : "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      {cat}
                      {countLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFonts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 space-y-3">
                  <Type className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold">No fonts found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setActiveTab("add_custom")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Import "{searchQuery}" from Google Fonts</span>
                  </button>
                </div>
              ) : (
                filteredFonts.map((font) => {
                  const isSelected = currentFont.toLowerCase() === font.name.toLowerCase();
                  const displayText = customPreviewText.trim() || font.name.toUpperCase();
                  const isCustomFont = font.isCustom || font.category === "Custom Free Font";

                  return (
                    <button
                      key={font.id}
                      onClick={() => handlePickFont(font.name)}
                      onMouseEnter={() => loadGoogleFont(font.name)}
                      className={`group flex flex-col justify-between text-left rounded-xl p-4 border transition-all relative ${
                        isSelected
                          ? "border-red-500 bg-red-950/30 ring-1 ring-red-500 shadow-lg shadow-red-500/10"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white group-hover:text-red-400 transition-colors">
                            {font.name}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {isCustomFont && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30">
                                CUSTOM FREE
                              </span>
                            )}
                            {font.isPopular && !isCustomFont && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400 flex items-center gap-1 border border-amber-500/30">
                                <Flame className="h-3 w-3" />
                                <span>VIRAL</span>
                              </span>
                            )}
                            {isCustomFont && (
                              <button
                                onClick={(e) => handleDeleteSavedFont(e, font.name)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                                title="Remove saved font"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Font Typography Preview Card */}
                        <div className="rounded-lg bg-black border border-slate-800 p-3 min-h-[72px] flex items-center justify-center overflow-hidden shadow-inner">
                          <span
                            className="text-2xl font-black text-yellow-300 tracking-tight text-center line-clamp-1 drop-shadow"
                            style={{
                              fontFamily: `'${font.name}', Impact, sans-serif`,
                              WebkitTextStroke: "1px black",
                            }}
                          >
                            {displayText}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {font.creatorStyle}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {font.category}
                        </span>
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 group-hover:text-white flex items-center gap-1">
                            <span>Apply</span>
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* TAB 2: ADD FREE CUSTOM FONT */}
        {activeTab === "add_custom" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Free Font Compliance Banner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-300">
                <span className="font-extrabold text-emerald-300 block">
                  100% Free & Open-Source Typography
                </span>
                <p className="text-slate-400 leading-relaxed">
                  All custom fonts integrated through ClickCraft are free to use for both personal and commercial YouTube thumbnails. You can pull directly from Google Fonts' library of 1,600+ open-source typefaces (OFL/Apache 2.0), connect public web font URLs, or load local free font files (.ttf, .otf, .woff2) into your browser session.
                </p>
              </div>
            </div>

            {/* Sub-modes Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setAddMode("google_name");
                  setAddStatusMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  addMode === "google_name"
                    ? "border-red-500 bg-red-950/30 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                  <Globe className="h-4 w-4 text-red-400" />
                  <span>Google Font Search</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Instant 1-click import by font family name from 1,600+ Google Fonts.
                </p>
              </button>

              <button
                onClick={() => {
                  setAddMode("web_url");
                  setAddStatusMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  addMode === "web_url"
                    ? "border-red-500 bg-red-950/30 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                  <ExternalLink className="h-4 w-4 text-amber-400" />
                  <span>Online Web Font URL</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Link direct free .woff2 / .ttf or public stylesheet URL.
                </p>
              </button>

              <button
                onClick={() => {
                  setAddMode("upload_file");
                  setAddStatusMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  addMode === "upload_file"
                    ? "border-red-500 bg-red-950/30 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                  <Upload className="h-4 w-4 text-purple-400" />
                  <span>Upload Free Font File</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Load .ttf, .otf, or .woff2 files from your computer via FontFace API.
                </p>
              </button>
            </div>

            {/* MODE 1: GOOGLE FONT SEARCH */}
            {addMode === "google_name" && (
              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Enter Google Font Name
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={googleFontInputName}
                      onChange={(e) => setGoogleFontInputName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddGoogleFontByName();
                      }}
                      placeholder="e.g. Orbitron, Creepster, Press Start 2P, Syne..."
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddGoogleFontByName()}
                      className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Verify & Add</span>
                    </button>
                  </div>
                </div>

                {/* Popular Suggested Free Fonts */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    ⚡ Trending Free Creator Picks (Click to Add):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestedFreeFonts.map((sug) => (
                      <button
                        key={sug.name}
                        onClick={() => handleAddGoogleFontByName(sug.name)}
                        className="flex flex-col text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-red-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                      >
                        <span className="text-xs font-black text-white group-hover:text-red-400">
                          {sug.name}
                        </span>
                        <span className="text-[9px] text-slate-400 line-clamp-1">
                          {sug.style}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: WEB FONT URL */}
            {addMode === "web_url" && (
              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Font Display Name
                  </label>
                  <input
                    type="text"
                    value={customUrlName}
                    onChange={(e) => setCustomUrlName(e.target.value)}
                    placeholder="e.g. Free Cyberpunk Sans"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none mb-3"
                  />

                  <label className="block text-xs font-bold text-white mb-1.5">
                    Public Web Font URL (.woff2, .ttf, or Google Font css URL)
                  </label>
                  <input
                    type="url"
                    value={customUrlAddress}
                    onChange={(e) => setCustomUrlAddress(e.target.value)}
                    placeholder="https://fonts.googleapis.com/css2?family=Cinzel:wght@900&display=swap"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleAddFontByUrl}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Free Web Font</span>
                </button>
              </div>
            )}

            {/* MODE 3: UPLOAD FILE */}
            {addMode === "upload_file" && (
              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-8 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                  <Upload className="h-10 w-10 text-purple-400 mb-3" />
                  <span className="text-sm font-bold text-white mb-1">
                    Click to browse your free font file
                  </span>
                  <span className="text-xs text-slate-400 mb-3">
                    Supported formats: TrueType (.ttf), OpenType (.otf), WOFF2 (.woff2)
                  </span>
                  <span className="rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 px-3 py-1 text-[11px] font-semibold">
                    100% Client-Side Loaded via FontFace API
                  </span>
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleAddFontByFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Status Message */}
            {addStatusMessage && (
              <div
                className={`rounded-xl p-3.5 text-xs flex items-center space-x-2 ${
                  addStatusMessage.type === "success"
                    ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                    : addStatusMessage.type === "error"
                    ? "bg-red-950/40 border border-red-500/40 text-red-300"
                    : "bg-slate-950 border border-slate-800 text-slate-300"
                }`}
              >
                {addStatusMessage.type === "success" && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                {addStatusMessage.type === "error" && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {addStatusMessage.type === "loading" && <Sparkles className="h-4 w-4 animate-spin flex-shrink-0" />}
                <span>{addStatusMessage.text}</span>
              </div>
            )}

            {/* Currently Saved Custom Fonts List */}
            {customFonts.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Your Free Custom Fonts ({customFonts.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customFonts.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="h-4 w-4 text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {f.creatorStyle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePickFont(f.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold"
                        >
                          Apply
                        </button>
                        <button
                          onClick={(e) => handleDeleteSavedFont(e, f.name)}
                          className="p-1 rounded text-slate-500 hover:text-red-400"
                          title="Delete font"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>All typography 100% royalty-free for commercial YouTube use.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import {
  Bookmark,
  Plus,
  Search,
  FolderHeart,
  Trash2,
  Copy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  Layers,
  X,
  Download,
  Upload,
  Tag,
} from "lucide-react";
import { SavedTemplate, ThumbnailDesign } from "../types/thumbnail";
import { renderThumbnailToCanvas } from "../utils/canvasRenderer";

interface TemplateGalleryProps {
  templates: SavedTemplate[];
  onLoadTemplate: (design: ThumbnailDesign) => void;
  onSaveCurrentAsTemplate: (template: SavedTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  currentDesign: ThumbnailDesign;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onLoadTemplate,
  onSaveCurrentAsTemplate,
  onDeleteTemplate,
  currentDesign,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Save Modal Form State
  const [newTemplateName, setNewTemplateName] = useState<string>(
    `${currentDesign.title || "My High-CTR Design"} Template`
  );
  const [newTemplateCategory, setNewTemplateCategory] = useState<SavedTemplate["category"]>("Challenge");
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>(
    "Custom packaging template with high-contrast text and glowing subject."
  );
  const [newTemplateTags, setNewTemplateTags] = useState<string>("Viral, Custom");

  // Canvas preview refs
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Render previews for all templates
  useEffect(() => {
    templates.forEach((tpl) => {
      const canvas = canvasRefs.current[tpl.id];
      if (!canvas) return;
      canvas.width = 640;
      canvas.height = 360;

      const previewDesign: ThumbnailDesign = {
        ...tpl.design,
        showSafeZoneOverlay: false,
        showHeatmap: false,
      };

      renderThumbnailToCanvas(canvas, previewDesign);
    });
  }, [templates, selectedCategory, searchQuery]);

  // Categories list
  const categories = [
    "All",
    "My Saved",
    "Built-in Pro",
    "Challenge",
    "Tech",
    "Education",
    "Finance",
    "Gaming",
  ];

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    // Category filter
    if (selectedCategory === "My Saved" && tpl.isBuiltIn) return false;
    if (selectedCategory === "Built-in Pro" && !tpl.isBuiltIn) return false;
    if (
      selectedCategory !== "All" &&
      selectedCategory !== "My Saved" &&
      selectedCategory !== "Built-in Pro" &&
      tpl.category !== selectedCategory
    ) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = tpl.description.toLowerCase().includes(q);
      const matchTags = tpl.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchTags;
    }

    return true;
  });

  // Handle Save Template Submission
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const tagsArray = newTemplateTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newTemplate: SavedTemplate = {
      id: `user-tpl-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim(),
      category: newTemplateCategory,
      createdAt: new Date().toISOString().split("T")[0],
      isBuiltIn: false,
      tags: tagsArray.length > 0 ? tagsArray : ["Custom"],
      design: {
        ...currentDesign,
        id: `design-${Date.now()}`,
        title: newTemplateName.trim(),
      },
    };

    onSaveCurrentAsTemplate(newTemplate);
    setIsSaveModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-amber-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/20">
              <Bookmark className="h-3.5 w-3.5" />
              <span>Step 5: High-CTR Template Gallery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Reusable Thumbnail Templates & Formula Presets
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Save your winning thumbnail designs as reusable formulas with 1 click. Load curated
              creator templates directly into Canvas Studio to speed up your packaging workflow.
            </p>
          </div>

          <button
            onClick={() => {
              setNewTemplateName(`${currentDesign.title || "My High-CTR Design"} Template`);
              setIsSaveModalOpen(true);
            }}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Save Current Canvas as Template</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900/80 p-1.5 border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tags..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          return (
            <div
              key={tpl.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-md"
            >
              <div className="space-y-3.5">
                {/* 16:9 Thumbnail Canvas Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner">
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[tpl.id] = el;
                    }}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      {tpl.category}
                    </span>
                    {tpl.isBuiltIn ? (
                      <span className="rounded bg-red-600/90 px-1.5 py-0.5 text-[9px] font-black text-white">
                        PRO FORMULA
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-black text-white">
                        MY SAVED
                      </span>
                    )}
                  </div>
                </div>

                {/* Template Meta */}
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                {/* Layer Specs & Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {tpl.design.texts.length} Text Hooks • {tpl.design.stickers.length} Accents
                  </span>
                  {tpl.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => onLoadTemplate(tpl.design)}
                  className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <span>Load into Canvas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {!tpl.isBuiltIn && (
                  <button
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete saved template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-xs">
          <FolderHeart className="h-10 w-10 mx-auto mb-2 opacity-40 text-red-500" />
          <p className="font-semibold text-slate-400">No templates found matching your filter</p>
          <p className="mt-1">Try clearing your search query or save your first custom design above.</p>
        </div>
      )}

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-extrabold text-white">
                  Save Current Canvas as Reusable Template
                </h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Extreme Survival Climax Template"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) =>
                      setNewTemplateCategory(e.target.value as SavedTemplate["category"])
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="Challenge">Challenge / Viral</option>
                    <option value="Tech">Tech & Gadgets</option>
                    <option value="Education">Education & Career</option>
                    <option value="Finance">Finance & Business</option>
                    <option value="Gaming">Gaming & Stream</option>
                    <option value="Vlog">Vlog & Lifestyle</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTemplateTags}
                    onChange={(e) => setNewTemplateTags(e.target.value)}
                    placeholder="e.g. Viral, Stakes, Red"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Template Formula Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Brief note on when to use this layout formula..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 block">Saved Attributes:</span>
                <p>
                  Includes current background ({currentDesign.background.type}), subject framing,{" "}
                  {currentDesign.texts.length} text hooks, 3D stroke weights, and all visual stickers.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Save to My Templates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

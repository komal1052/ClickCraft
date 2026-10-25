import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { VideoAnalyzer } from "./components/VideoAnalyzer";
import { CanvasStudio } from "./components/CanvasStudio";
import { ABTestingLab } from "./components/ABTestingLab";
import { LiveAnalytics } from "./components/LiveAnalytics";
import { TemplateGallery } from "./components/TemplateGallery";
import { YouTubeFeedPreviewModal } from "./components/YouTubeFeedPreviewModal";
import {
  TabType,
  ThumbnailDesign,
  ABVariant,
  SavedTemplate,
} from "./types/thumbnail";
import { DEFAULT_INITIAL_VARIANTS } from "./data/samples";
import { BUILTIN_TEMPLATES } from "./data/templates";
import { renderThumbnailToCanvas } from "./utils/canvasRenderer";

const LOCAL_STORAGE_KEY = "clickcraft_user_saved_templates";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("analyzer");
  const [variants, setVariants] = useState<ABVariant[]>(DEFAULT_INITIAL_VARIANTS);
  const [currentDesign, setCurrentDesign] = useState<ThumbnailDesign>(
    DEFAULT_INITIAL_VARIANTS[0].design
  );
  const [safeZoneEnabled, setSafeZoneEnabled] = useState<boolean>(true);
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(false);
  const [isFeedPreviewOpen, setIsFeedPreviewOpen] = useState<boolean>(false);

  // Saved Templates State (Built-in + User Saved)
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const savedJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedJson) {
        const userSaved: SavedTemplate[] = JSON.parse(savedJson);
        return [...userSaved, ...BUILTIN_TEMPLATES];
      }
    } catch (e) {
      console.warn("Could not load templates from localStorage:", e);
    }
    return BUILTIN_TEMPLATES;
  });

  // Save current design as a new reusable template
  const handleSaveTemplate = (newTemplate: SavedTemplate) => {
    setTemplates((prev) => {
      const updated = [newTemplate, ...prev];
      try {
        const userOnly = updated.filter((t) => !t.isBuiltIn);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userOnly));
      } catch (e) {
        console.warn("Could not save template to localStorage:", e);
      }
      return updated;
    });
  };

  // Delete a saved template
  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        const userOnly = updated.filter((t) => !t.isBuiltIn);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userOnly));
      } catch (e) {
        console.warn("Could not update localStorage after deletion:", e);
      }
      return updated;
    });
  };

  // Load template into Canvas Studio
  const handleLoadTemplate = (design: ThumbnailDesign) => {
    setCurrentDesign({
      ...design,
      id: `loaded-design-${Date.now()}`,
    });
    setActiveTab("editor");
  };

  // High-Res 1280x720 Image Export
  const handleExportThumbnail = async (format: "png" | "jpeg" = "png") => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 1280;
    offscreenCanvas.height = 720;

    const exportDesign: ThumbnailDesign = {
      ...currentDesign,
      showSafeZoneOverlay: false,
      showHeatmap: false,
    };

    await renderThumbnailToCanvas(offscreenCanvas, exportDesign);

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = offscreenCanvas.toDataURL(mime, 0.95);

    const downloadLink = document.createElement("a");
    downloadLink.download = `high-ctr-thumbnail-1280x720.${format}`;
    downloadLink.href = dataUrl;
    downloadLink.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFeedPreview={() => setIsFeedPreviewOpen(true)}
        onExportThumbnail={handleExportThumbnail}
        safeZoneEnabled={safeZoneEnabled}
        onToggleSafeZone={() => setSafeZoneEnabled(!safeZoneEnabled)}
        heatmapEnabled={heatmapEnabled}
        onToggleHeatmap={() => setHeatmapEnabled(!heatmapEnabled)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {activeTab === "analyzer" && (
          <VideoAnalyzer
            onApplyDesignToEditor={(newDesign) => {
              setCurrentDesign(newDesign);
              setActiveTab("editor");
            }}
            onUpdateABVariants={(newVariants) => {
              setVariants(newVariants);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "editor" && (
          <CanvasStudio
            currentDesign={currentDesign}
            onChangeDesign={setCurrentDesign}
            safeZoneEnabled={safeZoneEnabled}
            onToggleSafeZone={() => setSafeZoneEnabled(!safeZoneEnabled)}
            heatmapEnabled={heatmapEnabled}
            onToggleHeatmap={() => setHeatmapEnabled(!heatmapEnabled)}
            onNavigateToTemplates={() => setActiveTab("templates")}
          />
        )}

        {activeTab === "ab-test" && (
          <ABTestingLab
            variants={variants}
            onSelectVariantToEdit={(design) => {
              setCurrentDesign(design);
              setActiveTab("editor");
            }}
            onUpdateVariants={setVariants}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            heatmapEnabled={heatmapEnabled}
            onToggleHeatmap={() => setHeatmapEnabled(!heatmapEnabled)}
          />
        )}

        {activeTab === "analytics" && (
          <LiveAnalytics
            variants={variants}
            onUpdateVariants={setVariants}
          />
        )}

        {activeTab === "templates" && (
          <TemplateGallery
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onSaveCurrentAsTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            currentDesign={currentDesign}
          />
        )}
      </main>

      {/* YouTube Feed Simulator Modal */}
      <YouTubeFeedPreviewModal
        isOpen={isFeedPreviewOpen}
        onClose={() => setIsFeedPreviewOpen(false)}
        currentDesign={currentDesign}
      />
    </div>
  );
}

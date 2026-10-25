export type TabType = "analyzer" | "editor" | "ab-test" | "analytics" | "templates";

export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  category: "Gaming" | "Challenge" | "Tech" | "Education" | "Finance" | "Vlog" | "General";
  createdAt: string;
  isBuiltIn?: boolean;
  design: ThumbnailDesign;
  previewDataUrl?: string;
  tags?: string[];
}

export type FontChoice = string;

export interface TextLayer {
  id: string;
  text: string;
  font: FontChoice;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number; // degrees -30 to 30
  shadowColor: string;
  shadowBlur: number;
  highlightBg?: string; // e.g. yellow or black banner behind text
  isUppercase: boolean;
}

export interface StickerLayer {
  id: string;
  type: "arrow" | "badge" | "emoji" | "vs" | "fire" | "warning" | "mystery" | "cash" | "custom";
  label?: string;
  color: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface SubjectLayer {
  imageUrl: string;
  x: number; // percentage
  y: number;
  scale: number;
  flipHorizontal: boolean;
  glowColor: string;
  glowWidth: number;
  glowType: "none" | "neon" | "sticker" | "flame" | "drop-shadow";
  brightness: number; // 0.5 to 1.5
  contrast: number; // 0.5 to 1.5
  saturation: number; // 0.5 to 2.0
}

export interface BackgroundConfig {
  type: "gradient" | "radial-burst" | "speed-lines" | "cyber-grid" | "solid" | "image";
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  radialCenter?: { x: number; y: number };
  burstColor?: string;
  imageUrl?: string;
  vignetteIntensity: number; // 0 to 1
}

export interface ThumbnailDesign {
  id: string;
  title: string;
  background: BackgroundConfig;
  subject: SubjectLayer;
  texts: TextLayer[];
  stickers: StickerLayer[];
  showSafeZoneOverlay: boolean;
  showHeatmap: boolean;
  aspectRatio: "16:9";
  referenceImageOverlay?: string; // Image to trace or compare against
  referenceOpacity?: number; // 0 to 1 for onion skin ghosting
  showReferenceGhost?: boolean;
}

export interface ReferenceDeconstruction {
  styleTitle: string;
  whyItWorks: string;
  adaptedHeadline: string;
  adaptedSubline: string;
  palette: {
    backgroundGradientStart: string;
    backgroundGradientEnd: string;
    textColor: string;
    textStroke: string;
    accentColor: string;
    highlightBg?: string;
  };
  layoutBlueprint: {
    subjectX: number;
    subjectY: number;
    subjectScale: number;
    subjectGlowType: "neon" | "sticker" | "flame" | "none";
    subjectGlowColor: string;
    textX: number;
    textY: number;
    textRotation: number;
    fontFamily: FontChoice;
    fontSize: number;
    strokeWidth: number;
    hasArrow: boolean;
    arrowX: number;
    arrowY: number;
    arrowRotation: number;
    badgeText?: string;
    bgType: "radial-burst" | "gradient" | "speed-lines" | "cyber-grid";
  };
  keyTechniques: string[];
  referenceImageUrl: string;
}

export interface ABVariant {
  id: string;
  name: string;
  tagline: string;
  hypothesis: string;
  design: ThumbnailDesign;
  predictedCtr: number;
  readabilityScore: number;
  emotionScore: number;
  contrastScore: number;
  curiosityScore: number;
  heatmapPoints: Array<{ x: number; y: number; intensity: number; label: string }>;
  strengths: string[];
  weaknesses: string[];
  trafficShare: number; // e.g. 50%
  // Live analytics state
  impressions: number;
  clicks: number;
  realtimeCtr: number;
  avdSeconds: number; // average view duration
}

export interface VideoAnalysisResult {
  contentHook: string;
  targetAudience: string;
  baselineCtrEstimate: number;
  recommendedPunchlines: string[];
  colorStrategy: {
    primary: string;
    secondary: string;
    background: string;
    accentGlow: string;
    rationale: string;
  };
  compositionGuide: {
    subjectPlacement: string;
    focalElement: string;
    textColor: string;
    textStroke: string;
    safeZoneCheck: string;
  };
  abVariants: Array<{
    id: string;
    name: string;
    hypothesis: string;
    headline: string;
    subline: string;
    accentColor: string;
    bgTheme: string;
    predictedCtr: number;
    styleBadge: string;
    badgeText: string;
    showArrow: boolean;
  }>;
  creatorTips: string[];
}

export interface SampleVideo {
  id: string;
  title: string;
  niche: string;
  duration: string;
  description: string;
  previewColor: string;
  frames: string[]; // data URLs or sample images
  defaultHeadline: string;
  defaultSubline: string;
  subjectPreset: string;
}

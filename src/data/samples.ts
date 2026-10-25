import { SampleVideo, ThumbnailDesign, ABVariant } from "../types/thumbnail";

// High-converting creator facial cutout presets formatted as clean inline SVGs
export const CREATOR_CUTOUTS = [
  {
    id: "shocked-reaction",
    name: "Hyper-Shocked Reaction",
    preview: "😲",
    category: "Extreme Reaction",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
      <defs>
        <radialGradient id="skin" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="%23ffdfba"/>
          <stop offset="80%" stop-color="%23f3be8a"/>
          <stop offset="100%" stop-color="%23d6995e"/>
        </radialGradient>
        <linearGradient id="hoodie" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231e293b"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </linearGradient>
      </defs>
      <!-- Shoulders & Hoodie -->
      <path d="M 60 480 C 70 360 120 320 200 320 C 280 320 330 360 340 480 Z" fill="url(%23hoodie)"/>
      <path d="M 160 320 L 200 370 L 240 320 Z" fill="%23e2e8f0"/>
      <!-- Neck -->
      <rect x="170" y="240" width="60" height="90" rx="10" fill="%23d6995e"/>
      <!-- Head -->
      <ellipse cx="200" cy="180" rx="105" ry="125" fill="url(%23skin)"/>
      <!-- Hair (Dynamic spiky creator style) -->
      <path d="M 95 160 C 90 70 140 30 200 30 C 270 30 310 75 305 160 C 290 80 230 65 200 65 C 160 65 110 85 95 160 Z" fill="%232b1d14"/>
      <path d="M 110 90 L 140 45 L 165 75 L 200 35 L 235 70 L 270 45 L 290 95 Z" fill="%233b281c"/>
      <!-- Eyes Wide Open (High shock value) -->
      <ellipse cx="155" cy="155" rx="26" ry="32" fill="%23ffffff" stroke="%231a1a1a" stroke-width="4"/>
      <circle cx="155" cy="155" r="14" fill="%231e293b"/>
      <circle cx="160" cy="148" r="6" fill="%23ffffff"/>
      <ellipse cx="245" cy="155" rx="26" ry="32" fill="%23ffffff" stroke="%231a1a1a" stroke-width="4"/>
      <circle cx="245" cy="155" r="14" fill="%231e293b"/>
      <circle cx="250" cy="148" r="6" fill="%23ffffff"/>
      <!-- Eyebrows raised high -->
      <path d="M 125 105 Q 160 85 185 105" fill="none" stroke="%232b1d14" stroke-width="9" stroke-linecap="round"/>
      <path d="M 215 105 Q 240 85 275 105" fill="none" stroke="%232b1d14" stroke-width="9" stroke-linecap="round"/>
      <!-- Open Gasping Mouth (Drop-jaw) -->
      <ellipse cx="200" cy="235" rx="36" ry="46" fill="%23450a0a" stroke="%23991b1b" stroke-width="4"/>
      <ellipse cx="200" cy="212" rx="24" ry="10" fill="%23ffffff"/>
      <path d="M 180 265 Q 200 245 220 265" fill="%23f43f5e"/>
      <!-- Raised Hands to Cheeks / Shock gesture -->
      <ellipse cx="105" cy="210" rx="22" ry="45" transform="rotate(-25 105 210)" fill="%23f3be8a" stroke="%23d6995e" stroke-width="3"/>
      <ellipse cx="295" cy="210" rx="22" ry="45" transform="rotate(25 295 210)" fill="%23f3be8a" stroke="%23d6995e" stroke-width="3"/>
    </svg>`
  },
  {
    id: "laser-eyes-intense",
    name: "Ultra-Intense Focus & Smirk",
    preview: "🔥",
    category: "Confidence / Authority",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
      <defs>
        <radialGradient id="skin2" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="%23fde047"/>
          <stop offset="70%" stop-color="%23f59e0b"/>
          <stop offset="100%" stop-color="%23b45309"/>
        </radialGradient>
        <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%230284c7"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </linearGradient>
      </defs>
      <!-- Jacket -->
      <path d="M 50 480 C 70 340 120 310 200 310 C 280 310 330 340 350 480 Z" fill="url(%23suit)"/>
      <polygon points="170,310 200,380 230,310" fill="%2338bdf8"/>
      <!-- Neck -->
      <rect x="175" y="235" width="50" height="85" rx="8" fill="%23b45309"/>
      <!-- Head -->
      <ellipse cx="200" cy="170" rx="98" ry="120" fill="url(%23skin2)"/>
      <!-- Hair -->
      <path d="M 100 145 C 90 60 145 25 200 25 C 265 25 305 60 300 145 C 285 70 230 55 200 55 C 160 55 115 70 100 145 Z" fill="%23172554"/>
      <!-- Brows aggressive forward angle -->
      <path d="M 125 125 L 180 145" fill="none" stroke="%230f172a" stroke-width="12" stroke-linecap="round"/>
      <path d="M 275 125 L 220 145" fill="none" stroke="%230f172a" stroke-width="12" stroke-linecap="round"/>
      <!-- Eyes Intense with Glow -->
      <ellipse cx="155" cy="165" rx="22" ry="16" fill="%23ffffff"/>
      <circle cx="158" cy="165" r="10" fill="%230284c7"/>
      <circle cx="160" cy="163" r="4" fill="%23ffffff"/>
      <ellipse cx="245" cy="165" rx="22" ry="16" fill="%23ffffff"/>
      <circle cx="242" cy="165" r="10" fill="%230284c7"/>
      <circle cx="240" cy="163" r="4" fill="%23ffffff"/>
      <!-- Laser Eye Flare Highlights -->
      <circle cx="158" cy="165" r="18" fill="none" stroke="%2338bdf8" stroke-width="4" opacity="0.8"/>
      <circle cx="242" cy="165" r="18" fill="none" stroke="%2338bdf8" stroke-width="4" opacity="0.8"/>
      <!-- Confident Smirk / Smile -->
      <path d="M 160 235 Q 210 265 250 225" fill="none" stroke="%23451a03" stroke-width="8" stroke-linecap="round"/>
      <path d="M 165 235 Q 205 255 240 232" fill="%23ffffff" stroke="%23451a03" stroke-width="2"/>
    </svg>`
  },
  {
    id: "curious-conspiracy",
    name: "Skeptical & Whispering Secret",
    preview: "🤫",
    category: "Mystery & Intrigue",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
      <defs>
        <radialGradient id="skin3" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stop-color="%23fed7aa"/>
          <stop offset="85%" stop-color="%23ea580c"/>
        </radialGradient>
        <linearGradient id="darkHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23581c87"/>
          <stop offset="100%" stop-color="%231e1b4b"/>
        </linearGradient>
      </defs>
      <!-- Hood covering head background -->
      <path d="M 70 480 C 80 330 110 100 200 80 C 290 100 320 330 330 480 Z" fill="url(%23darkHoodie)"/>
      <!-- Face -->
      <ellipse cx="200" cy="190" rx="85" ry="105" fill="url(%23skin3)"/>
      <!-- Eyes squinting suspiciously to side -->
      <ellipse cx="160" cy="175" rx="19" ry="12" fill="%23ffffff" stroke="%231e1b4b" stroke-width="3"/>
      <circle cx="170" cy="175" r="8" fill="%23a855f7"/>
      <circle cx="172" cy="173" r="3" fill="%23ffffff"/>
      <ellipse cx="240" cy="175" rx="19" ry="12" fill="%23ffffff" stroke="%231e1b4b" stroke-width="3"/>
      <circle cx="250" cy="175" r="8" fill="%23a855f7"/>
      <circle cx="252" cy="173" r="3" fill="%23ffffff"/>
      <!-- Brows: one raised quizzically -->
      <path d="M 140 150 Q 160 135 180 150" fill="none" stroke="%23431407" stroke-width="7" stroke-linecap="round"/>
      <path d="M 220 160 Q 240 160 260 165" fill="none" stroke="%23431407" stroke-width="7" stroke-linecap="round"/>
      <!-- Finger to lips "Shhh / Secret" -->
      <rect x="190" y="210" width="22" height="70" rx="10" transform="rotate(10 190 210)" fill="%23fed7aa" stroke="%23ea580c" stroke-width="3"/>
      <!-- Mouth small round "o" -->
      <ellipse cx="205" cy="245" rx="12" ry="16" fill="%232e1065"/>
    </svg>`
  }
];

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "sample-1",
    title: "I Survived 100 Days in the World's Most Extreme Forest",
    niche: "Challenge & Survival",
    duration: "24:18",
    description: "Dropped into the deep Canadian wilderness with only a knife, a tarp, and a camera. Day 47 almost ended everything when a blizzard struck.",
    previewColor: "#dc2626",
    frames: [CREATOR_CUTOUTS[0].svg, CREATOR_CUTOUTS[1].svg],
    defaultHeadline: "DAY 47 ALMOST",
    defaultSubline: "ENDED EVERYTHING",
    subjectPreset: "shocked-reaction"
  },
  {
    id: "sample-2",
    title: "$100 Budget Setup vs $10,000 Dream Desk Setup",
    niche: "Tech & Workspace",
    duration: "18:42",
    description: "Comparing ultra-cheap Amazon budget tech gear against an insane $10k dream developer and gaming battle station. The results shocked our audio engineer.",
    previewColor: "#2563eb",
    frames: [CREATOR_CUTOUTS[1].svg, CREATOR_CUTOUTS[0].svg],
    defaultHeadline: "$100 VS $10,000",
    defaultSubline: "DON'T BUY THIS!",
    subjectPreset: "laser-eyes-intense"
  },
  {
    id: "sample-3",
    title: "Why 99% of People Fail at Coding in 2026 (The Brutal Truth)",
    niche: "Education & Career",
    duration: "14:05",
    description: "AI tools have fundamentally shifted how software is engineered. Here is the exact mental trap junior engineers fall into and how the top 1% thrive.",
    previewColor: "#7c3aed",
    frames: [CREATOR_CUTOUTS[2].svg, CREATOR_CUTOUTS[1].svg],
    defaultHeadline: "THE BRUTAL TRUTH",
    defaultSubline: "YOU ARE DOING IT WRONG",
    subjectPreset: "curious-conspiracy"
  },
  {
    id: "sample-4",
    title: "I Tried the Secret 4AM Millionaire Routine for 30 Days",
    niche: "Self-Improvement & Finance",
    duration: "16:50",
    description: "Waking up at 4:00 AM every day, ice baths, deep work blocks, and no social media. Did it actually make me productive or completely burn me out?",
    previewColor: "#eab308",
    frames: [CREATOR_CUTOUTS[0].svg, CREATOR_CUTOUTS[2].svg],
    defaultHeadline: "NEVER AGAIN.",
    defaultSubline: "30 DAYS RUINED ME",
    subjectPreset: "shocked-reaction"
  }
];

export const BACKGROUND_PRESETS = [
  {
    id: "hyper-red-burst",
    name: "MrBeast Red Hyper-Burst",
    type: "radial-burst" as const,
    gradientStart: "#dc2626",
    gradientEnd: "#030712",
    gradientAngle: 45,
    burstColor: "#ef4444",
    vignetteIntensity: 0.65
  },
  {
    id: "cyber-neon-blue",
    name: "Cyber Neon Glow",
    type: "gradient" as const,
    gradientStart: "#0284c7",
    gradientEnd: "#090d16",
    gradientAngle: 135,
    vignetteIntensity: 0.7
  },
  {
    id: "volcano-flame-split",
    name: "Volcanic Dual Tone",
    type: "speed-lines" as const,
    gradientStart: "#b91c1c",
    gradientEnd: "#d97706",
    gradientAngle: 90,
    burstColor: "#f59e0b",
    vignetteIntensity: 0.6
  },
  {
    id: "mystery-purple-void",
    name: "Deep Mystery Void",
    type: "radial-burst" as const,
    gradientStart: "#6b21a8",
    gradientEnd: "#020617",
    gradientAngle: 0,
    burstColor: "#a855f7",
    vignetteIntensity: 0.8
  },
  {
    id: "gold-wealth-contrast",
    name: "Gold & Dark Obsidian",
    type: "gradient" as const,
    gradientStart: "#eab308",
    gradientEnd: "#0c0a09",
    gradientAngle: 120,
    vignetteIntensity: 0.75
  }
];

export const DEFAULT_INITIAL_VARIANTS: ABVariant[] = [
  {
    id: "var-1",
    name: "Variant A: High Shock & Stakes",
    tagline: "Primal reaction + High Stakes Numbers",
    hypothesis: "Shocked facial expression paired with electric red-yellow colors triggers visceral curiosity in browse feeds.",
    predictedCtr: 13.4,
    readabilityScore: 9.4,
    emotionScore: 9.7,
    contrastScore: 9.1,
    curiosityScore: 8.8,
    trafficShare: 50,
    impressions: 142850,
    clicks: 19142,
    realtimeCtr: 13.4,
    avdSeconds: 412,
    heatmapPoints: [
      { x: 74, y: 38, intensity: 0.98, label: "Face Emotion (Shocked Eyes/Mouth)" },
      { x: 32, y: 32, intensity: 0.92, label: "Headline 'DAY 47 ALMOST'" },
      { x: 38, y: 55, intensity: 0.84, label: "Punchline 'ENDED EVERYTHING'" },
      { x: 52, y: 45, intensity: 0.76, label: "Curved Action Arrow" }
    ],
    strengths: [
      "Ultra-bold 3D text outline gives 100% legibility on 3.5in mobile display",
      "Subject eye gaze naturally directs attention to left hook",
      "Safe zone is completely clear of YouTube timestamp badge"
    ],
    weaknesses: [
      "Might feel overly sensationalized for documentary audience"
    ],
    design: {
      id: "design-var-a",
      title: "Variant A",
      background: BACKGROUND_PRESETS[0],
      subject: {
        imageUrl: CREATOR_CUTOUTS[0].svg,
        x: 72,
        y: 60,
        scale: 1.25,
        flipHorizontal: false,
        glowColor: "#facc15",
        glowWidth: 14,
        glowType: "neon",
        brightness: 1.15,
        contrast: 1.2,
        saturation: 1.3
      },
      texts: [
        {
          id: "t1",
          text: "DAY 47 ALMOST",
          font: "Anton",
          fontSize: 88,
          color: "#ffffff",
          strokeColor: "#000000",
          strokeWidth: 16,
          x: 28,
          y: 28,
          rotation: -4,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 20,
          isUppercase: true,
          highlightBg: "#dc2626"
        },
        {
          id: "t2",
          text: "ENDED EVERYTHING!",
          font: "Bebas Neue",
          fontSize: 98,
          color: "#facc15",
          strokeColor: "#000000",
          strokeWidth: 18,
          x: 32,
          y: 52,
          rotation: -3,
          shadowColor: "rgba(0,0,0,0.95)",
          shadowBlur: 24,
          isUppercase: true
        }
      ],
      stickers: [
        {
          id: "s1",
          type: "arrow",
          color: "#ef4444",
          x: 52,
          y: 46,
          scale: 1.1,
          rotation: -18
        },
        {
          id: "s2",
          type: "badge",
          label: "100% REAL",
          color: "#f59e0b",
          x: 20,
          y: 78,
          scale: 1.0,
          rotation: 4
        }
      ],
      showSafeZoneOverlay: true,
      showHeatmap: false,
      aspectRatio: "16:9"
    }
  },
  {
    id: "var-2",
    name: "Variant B: Mystery & Curiosity Gap",
    tagline: "Withheld Information + Skeptic Hook",
    hypothesis: "Framing the premise as an untold secret with intense cyan-purple contrast creates an irresistible cognitive itch.",
    predictedCtr: 11.8,
    readabilityScore: 9.1,
    emotionScore: 8.7,
    contrastScore: 9.4,
    curiosityScore: 9.6,
    trafficShare: 50,
    impressions: 141920,
    clicks: 16746,
    realtimeCtr: 11.8,
    avdSeconds: 438,
    heatmapPoints: [
      { x: 30, y: 35, intensity: 0.94, label: "Secret Hook 'NEVER DO THIS'" },
      { x: 70, y: 44, intensity: 0.89, label: "Creator Gaze" },
      { x: 48, y: 70, intensity: 0.72, label: "Warning Seal" }
    ],
    strengths: [
      "Extremely strong curiosity hook creates high retention viewers",
      "Striking cyber-neon color separation stands out from typical red YouTube thumbnails"
    ],
    weaknesses: [
      "Slightly lower instant emotional shock compared to Variant A"
    ],
    design: {
      id: "design-var-b",
      title: "Variant B",
      background: BACKGROUND_PRESETS[3],
      subject: {
        imageUrl: CREATOR_CUTOUTS[2].svg,
        x: 74,
        y: 62,
        scale: 1.2,
        flipHorizontal: false,
        glowColor: "#a855f7",
        glowWidth: 12,
        glowType: "sticker",
        brightness: 1.1,
        contrast: 1.25,
        saturation: 1.2
      },
      texts: [
        {
          id: "t1b",
          text: "THE SECRET",
          font: "Montserrat",
          fontSize: 78,
          color: "#ffffff",
          strokeColor: "#000000",
          strokeWidth: 14,
          x: 30,
          y: 28,
          rotation: 0,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 16,
          isUppercase: true,
          highlightBg: "#7c3aed"
        },
        {
          id: "t2b",
          text: "THEY HID FROM YOU",
          font: "Anton",
          fontSize: 90,
          color: "#38bdf8",
          strokeColor: "#000000",
          strokeWidth: 18,
          x: 34,
          y: 50,
          rotation: 0,
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 20,
          isUppercase: true
        }
      ],
      stickers: [
        {
          id: "s1b",
          type: "warning",
          color: "#ef4444",
          x: 22,
          y: 75,
          scale: 1.05,
          rotation: -6
        },
        {
          id: "s2b",
          type: "mystery",
          label: "CENSORED",
          color: "#000000",
          x: 52,
          y: 70,
          scale: 1.0,
          rotation: 0
        }
      ],
      showSafeZoneOverlay: true,
      showHeatmap: false,
      aspectRatio: "16:9"
    }
  }
];

export interface ViralReference {
  id: string;
  name: string;
  creatorTag: string;
  headline: string;
  subline: string;
  category: string;
  description: string;
  svgPreview: string;
}

export const VIRAL_REFERENCES: ViralReference[] = [
  {
    id: "ref-mrbeast",
    name: "MrBeast High-Stakes Climax",
    creatorTag: "MrBeast Style",
    headline: "DAY 100 ALMOST",
    subline: "LOST EVERYTHING!",
    category: "Viral Challenge & Extreme Survival",
    description: "Giant shocked face on the right with yellow neon outline, bold tilted 3D text on the left, and curved red arrow pointing from subject to hook.",
    svgPreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
      <defs>
        <radialGradient id="rbg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="%23ef4444"/>
          <stop offset="100%" stop-color="%23450a0a"/>
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill="url(%23rbg)"/>
      <!-- Burst rays -->
      <path d="M 320 180 L 100 0 L 160 0 Z M 320 180 L 250 0 L 320 0 Z M 320 180 L 400 0 L 480 0 Z M 320 180 L 0 100 L 0 160 Z M 320 180 L 0 240 L 0 300 Z M 320 180 L 120 360 L 200 360 Z" fill="%23f87171" opacity="0.25"/>
      <!-- Left Hook Text -->
      <rect x="35" y="45" width="280" height="55" rx="8" fill="%23dc2626" stroke="%23ffffff" stroke-width="3"/>
      <text x="175" y="85" font-family="sans-serif" font-weight="900" font-size="36" fill="%23ffffff" text-anchor="middle">DAY 100 ALMOST</text>
      <text x="180" y="160" font-family="sans-serif" font-weight="900" font-size="48" fill="%23facc15" stroke="%23000000" stroke-width="8" text-anchor="middle">LOST EVERYTHING!</text>
      <!-- Arrow -->
      <path d="M 360 170 Q 280 150 250 210 L 235 185 L 235 240 L 290 235 L 265 215 Q 290 170 360 185 Z" fill="%23facc15" stroke="%23000000" stroke-width="3"/>
      <!-- Right Subject Silhouette with Neon -->
      <circle cx="480" cy="200" r="100" fill="%23facc15" filter="blur(15px)" opacity="0.8"/>
      <circle cx="480" cy="190" r="85" fill="%23fde047"/>
      <circle cx="450" cy="170" r="14" fill="%23ffffff" stroke="%23000" stroke-width="4"/>
      <circle cx="510" cy="170" r="14" fill="%23ffffff" stroke="%23000" stroke-width="4"/>
      <ellipse cx="480" cy="225" rx="22" ry="32" fill="%23450a0a" stroke="%23991b1b" stroke-width="4"/>
      <rect x="390" y="270" width="180" height="100" rx="30" fill="%230f172a"/>
    </svg>`
  },
  {
    id: "ref-veritasium",
    name: "Veritasium Curiosity Gap",
    creatorTag: "Curiosity / Documentary",
    headline: "THE ILLUSION",
    subline: "OF FREE WILL",
    category: "Science, Mystery & Philosophy",
    description: "Deep obsidian-purple vignette, subject gazing quizzically to the side with white sticker border, and sharp cyan text with a censored badge.",
    svgPreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
      <defs>
        <radialGradient id="vbg" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stop-color="%23581c87"/>
          <stop offset="100%" stop-color="%23020617"/>
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill="url(%23vbg)"/>
      <!-- Question Glow -->
      <circle cx="160" cy="180" r="120" fill="%2338bdf8" filter="blur(40px)" opacity="0.3"/>
      <!-- Left Hook Text -->
      <rect x="40" y="60" width="230" height="48" rx="6" fill="%237c3aed"/>
      <text x="155" y="95" font-family="sans-serif" font-weight="900" font-size="32" fill="%23ffffff" text-anchor="middle">THE ILLUSION</text>
      <text x="160" y="165" font-family="sans-serif" font-weight="900" font-size="46" fill="%2338bdf8" stroke="%23000000" stroke-width="6" text-anchor="middle">OF FREE WILL</text>
      <!-- Mystery Box -->
      <rect x="70" y="220" width="180" height="50" rx="6" fill="%23000000" stroke="%23ef4444" stroke-width="3"/>
      <text x="160" y="255" font-family="sans-serif" font-weight="900" font-size="24" fill="%23ef4444" text-anchor="middle">CENSORED ?</text>
      <!-- Right Subject Silhouette with White Sticker border -->
      <circle cx="490" cy="185" r="95" fill="%23ffffff" filter="blur(8px)"/>
      <circle cx="490" cy="185" r="85" fill="%23fed7aa"/>
      <rect x="400" y="260" width="180" height="110" rx="20" fill="%231e1b4b"/>
      <circle cx="465" cy="175" r="10" fill="%23000000"/>
      <circle cx="515" cy="175" r="10" fill="%23000000"/>
    </svg>`
  },
  {
    id: "ref-aliabdaal",
    name: "Ali Abdaal High-Trust Clean",
    creatorTag: "Education & Productivity",
    headline: "HOW I STUDY",
    subline: "3x FASTER WITH AI",
    category: "Education & Career",
    description: "Deep slate minimalist backdrop, confident authority smirk with soft teal rim light, clean bold sans-serif text and 100% Proven trust badge.",
    svgPreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
      <defs>
        <linearGradient id="abg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%230284c7"/>
          <stop offset="100%" stop-color="%230b1329"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(%23abg)"/>
      <text x="180" y="90" font-family="sans-serif" font-weight="900" font-size="36" fill="%23ffffff">HOW I STUDY</text>
      <text x="180" y="160" font-family="sans-serif" font-weight="900" font-size="44" fill="%2338bdf8" stroke="%23000000" stroke-width="6">3x FASTER</text>
      <!-- Trust pill -->
      <rect x="50" y="210" width="180" height="46" rx="23" fill="%23f59e0b" stroke="%23ffffff" stroke-width="3"/>
      <text x="140" y="242" font-family="sans-serif" font-weight="900" font-size="20" fill="%23000000" text-anchor="middle">100% PROVEN</text>
      <!-- Subject -->
      <circle cx="490" cy="170" r="80" fill="%23fde047"/>
      <rect x="410" y="250" width="160" height="120" rx="20" fill="%230f172a"/>
    </svg>`
  },
  {
    id: "ref-mkbhd",
    name: "Tech Battle / Extreme VS",
    creatorTag: "Tech & Comparison",
    headline: "$100 VS $10,000",
    subline: "DON'T BUY THIS!",
    category: "Tech & Product Reviews",
    description: "Split volcanic-cyber duel background, massive central 'VS' lightning badge, laser eyes subject, and contrasting product spotlight.",
    svgPreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
      <defs>
        <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%23dc2626"/>
          <stop offset="50%" stop-color="%231e1b4b"/>
          <stop offset="100%" stop-color="%230284c7"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(%23mbg)"/>
      <text x="80" y="75" font-family="sans-serif" font-weight="900" font-size="34" fill="%23ffffff">CHEAP $100</text>
      <text x="420" y="75" font-family="sans-serif" font-weight="900" font-size="34" fill="%2338bdf8">DREAM $10K</text>
      <!-- Big VS Badge in Center -->
      <circle cx="320" cy="180" r="55" fill="%23dc2626" stroke="%23facc15" stroke-width="8"/>
      <text x="320" y="200" font-family="sans-serif" font-weight="900" font-size="52" fill="%23ffffff" stroke="%23000000" stroke-width="8" text-anchor="middle">VS</text>
    </svg>`
  }
];


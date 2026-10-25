export interface GoogleFontItem {
  id: string;
  name: string;
  category: "Viral & Display" | "Bold Sans" | "Comic & Gaming" | "Serif & Classic" | "Impact & Marker" | "Custom Free Font";
  creatorStyle: string;
  previewSample?: string;
  isPopular?: boolean;
  isCustom?: boolean;
  customFileUrl?: string;
}

export const GOOGLE_FONTS_CATALOG: GoogleFontItem[] = [
  // Viral & Display
  {
    id: "Anton",
    name: "Anton",
    category: "Viral & Display",
    creatorStyle: "MrBeast & Challenge Viral #1 Pick",
    isPopular: true,
  },
  {
    id: "Bebas Neue",
    name: "Bebas Neue",
    category: "Viral & Display",
    creatorStyle: "Ultra-Tall Punchline (Top 1% Creators)",
    isPopular: true,
  },
  {
    id: "Bungee",
    name: "Bungee",
    category: "Comic & Gaming",
    creatorStyle: "Gaming Streamers & Esports Highlights",
    isPopular: true,
  },
  {
    id: "Oswald",
    name: "Oswald",
    category: "Bold Sans",
    creatorStyle: "Condensed Authority (Vox & Vice Style)",
    isPopular: true,
  },
  {
    id: "Montserrat",
    name: "Montserrat",
    category: "Bold Sans",
    creatorStyle: "Ali Abdaal & Tech Review Modern",
    isPopular: true,
  },
  {
    id: "Russo One",
    name: "Russo One",
    category: "Viral & Display",
    creatorStyle: "Heavy Block Armor & Action",
    isPopular: true,
  },
  {
    id: "Bangers",
    name: "Bangers",
    category: "Comic & Gaming",
    creatorStyle: "Comic Book Comic Pop & Cartoon",
    isPopular: true,
  },
  {
    id: "Lilita One",
    name: "Lilita One",
    category: "Viral & Display",
    creatorStyle: "Chunky Rounded 3D Pop (Kids & Fun)",
    isPopular: true,
  },
  {
    id: "Luckiest Guy",
    name: "Luckiest Guy",
    category: "Comic & Gaming",
    creatorStyle: "Retro Comic Explosion & Hype",
    isPopular: true,
  },
  {
    id: "Titan One",
    name: "Titan One",
    category: "Viral & Display",
    creatorStyle: "Heavy Bulbous 3D Sticker Font",
  },
  {
    id: "Kanit",
    name: "Kanit",
    category: "Bold Sans",
    creatorStyle: "Ultra-Black Modern Minimalist",
  },
  {
    id: "Black Han Sans",
    name: "Black Han Sans",
    category: "Bold Sans",
    creatorStyle: "Massive Solid Monumental Sans",
  },
  {
    id: "Rubik Glitch",
    name: "Rubik Glitch",
    category: "Comic & Gaming",
    creatorStyle: "Cyberpunk & Hacker Mystery",
  },
  {
    id: "Permanent Marker",
    name: "Permanent Marker",
    category: "Impact & Marker",
    creatorStyle: "Authentic Hand-Drawn Urgent Stamp",
    isPopular: true,
  },
  {
    id: "Alfa Slab One",
    name: "Alfa Slab One",
    category: "Serif & Classic",
    creatorStyle: "Extreme Heavy Slab Serif / Western",
  },
  {
    id: "Changa One",
    name: "Changa One",
    category: "Viral & Display",
    creatorStyle: "Geometric Bold Contrast",
  },
  {
    id: "Cinzel",
    name: "Cinzel",
    category: "Serif & Classic",
    creatorStyle: "Luxury, Dark Mystery & History",
  },
  {
    id: "Righteous",
    name: "Righteous",
    category: "Comic & Gaming",
    creatorStyle: "Sci-Fi Retro Future & Synthwave",
  },
  {
    id: "Teko",
    name: "Teko",
    category: "Viral & Display",
    creatorStyle: "Extreme Tall Compressed Headline",
  },
  {
    id: "Impact",
    name: "Impact",
    category: "Viral & Display",
    creatorStyle: "Classic Internet Legend & Viral Memes",
    isPopular: true,
  },
];

const CUSTOM_FONTS_STORAGE_KEY = "clickcraft_user_custom_fonts";

// Track loaded font families in DOM
const loadedFonts = new Set<string>();

/**
 * Get user custom fonts from localStorage
 */
export function getSavedCustomFonts(): GoogleFontItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FONTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read custom fonts from localStorage:", err);
  }
  return [];
}

/**
 * Save user custom font to localStorage
 */
export function saveCustomFont(font: GoogleFontItem) {
  try {
    const existing = getSavedCustomFonts();
    const updated = [font, ...existing.filter((f) => f.name.toLowerCase() !== font.name.toLowerCase())];
    localStorage.setItem(CUSTOM_FONTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save custom font to localStorage:", err);
  }
}

/**
 * Delete a user custom font
 */
export function deleteCustomFont(fontName: string) {
  try {
    const existing = getSavedCustomFonts();
    const updated = existing.filter((f) => f.name.toLowerCase() !== fontName.toLowerCase());
    localStorage.setItem(CUSTOM_FONTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not delete custom font from localStorage:", err);
  }
}

/**
 * Loads ANY font from the free Google Fonts library by name
 * Supports all 1,600+ Google Fonts!
 */
export async function loadGoogleFont(fontName: string): Promise<boolean> {
  const cleanName = fontName.trim();
  if (cleanName === "Impact") return true;

  if (loadedFonts.has(cleanName)) {
    return true;
  }

  try {
    const formattedFontName = cleanName.replace(/ /g, "+");
    const linkId = `google-font-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${formattedFontName}:wght@400;700;800;900&display=swap`;
      document.head.appendChild(link);
    }

    if ("fonts" in document) {
      await (document as any).fonts.load(`900 36px "${cleanName}"`);
      await (document as any).fonts.ready;
    }

    loadedFonts.add(cleanName);
    return true;
  } catch (err) {
    console.warn(`Failed to dynamically load Google Font ${cleanName}:`, err);
    return false;
  }
}

/**
 * Loads a free custom font file (.ttf, .otf, .woff, .woff2) using FontFace API
 */
export async function loadFontFromFile(file: File): Promise<string> {
  const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
  const buffer = await file.arrayBuffer();

  const fontFace = new FontFace(fontName, buffer);
  await fontFace.load();
  (document.fonts as any).add(fontFace);

  loadedFonts.add(fontName);

  // Save to custom fonts storage
  saveCustomFont({
    id: `custom-${Date.now()}`,
    name: fontName,
    category: "Custom Free Font",
    creatorStyle: "User Uploaded Free Web Font",
    isCustom: true,
  });

  return fontName;
}

/**
 * Loads a free online custom web font via direct URL (.woff2, .ttf, or css)
 */
export async function loadFontFromOnlineUrl(fontName: string, url: string): Promise<boolean> {
  const cleanName = fontName.trim();
  const cleanUrl = url.trim();

  try {
    if (cleanUrl.includes("fonts.googleapis.com") || cleanUrl.endsWith(".css")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cleanUrl;
      document.head.appendChild(link);
    } else {
      const fontFace = new FontFace(cleanName, `url(${cleanUrl})`);
      await fontFace.load();
      (document.fonts as any).add(fontFace);
    }

    if ("fonts" in document) {
      await (document as any).fonts.load(`900 36px "${cleanName}"`);
      await (document as any).fonts.ready;
    }

    loadedFonts.add(cleanName);

    saveCustomFont({
      id: `custom-url-${Date.now()}`,
      name: cleanName,
      category: "Custom Free Font",
      creatorStyle: "Online Web Font URL",
      isCustom: true,
      customFileUrl: cleanUrl,
    });

    return true;
  } catch (err) {
    console.warn(`Failed to load online custom font ${cleanName}:`, err);
    throw new Error(`Could not load font from "${cleanUrl}". Please ensure the link is publicly accessible or try entering a Google Font name.`);
  }
}

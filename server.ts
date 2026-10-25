import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing with large limit for base64 image frames
app.use(express.json({ limit: "25mb" }));

// Initialize GoogleGenAI server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Video Analysis and High-CTR Strategy Generation Endpoint
app.post("/api/analyze-video", async (req, res) => {
  try {
    const { title, description, category, targetVibe, videoFrameBase64 } = req.body;

    const systemPrompt = `You are the world's elite YouTube Thumbnail & Packaging Director (consultant for top creators like MrBeast, Ryan Trahan, Ali Abdaal, and MKBHD).
Analyze the provided video premise/sample, and output a high-converting thumbnail packaging strategy and 3 distinct A/B test variants.
Key YouTube Thumbnail Psychology principles:
1. Cognitive Curiosity Gap (Pose a visual question without giving away the full answer)
2. 3-Second Rule (Understood instantly on a tiny 3.5-inch mobile screen)
3. Maximum 3-4 words of punchy text (NEVER repeat the title word-for-word)
4. High contrast color palette (pops against YouTube's dark & light app interface)
5. Rule of Thirds & Safe Zones (NEVER place key focal points or text in the bottom right 20% where the duration badge '12:45' renders)
6. Emotional Hyper-Expression (Shock, awe, determination, disbelief, or intense intrigue)

Return STRICTLY valid JSON conforming to this structure:
{
  "contentHook": "Short summary of the core emotional/curiosity hook",
  "targetAudience": "Psychological trigger of target audience",
  "baselineCtrEstimate": 8.4,
  "recommendedPunchlines": ["3-4 words max", "punchy alternative", "action teaser"],
  "colorStrategy": {
    "primary": "#FFE600",
    "secondary": "#FF0033",
    "background": "#0B0F19",
    "accentGlow": "#00F0FF",
    "rationale": "High-contrast electric colors to maximize mobile clickability"
  },
  "compositionGuide": {
    "subjectPlacement": "Right third with high emotional reaction",
    "focalElement": "Glowing object or dynamic arrow on left third",
    "textColor": "#FFFFFF",
    "textStroke": "#000000",
    "safeZoneCheck": "Keep bottom right empty for YouTube timestamp overlay"
  },
  "abVariants": [
    {
      "id": "variant-a",
      "name": "Extreme Reaction & Stakes",
      "hypothesis": "High-intensity facial expression combined with bold dollar/stakes text triggers primal curiosity",
      "headline": "I REGRET THIS!",
      "subline": "$10,000 MISTAKE",
      "accentColor": "#FF3366",
      "bgTheme": "dramatic-red-gradient",
      "predictedCtr": 11.2,
      "styleBadge": "Hyper-Emotional",
      "badgeText": "100% REAL",
      "showArrow": true
    },
    {
      "id": "variant-b",
      "name": "Curiosity Gap / Mystery",
      "hypothesis": "Hiding the final result behind a subtle blur or glowing mystery box drives viewers to click to satisfy curiosity",
      "headline": "DO NOT BUY THIS",
      "subline": "Until You See This",
      "accentColor": "#FFE600",
      "bgTheme": "cyber-glow",
      "predictedCtr": 13.8,
      "styleBadge": "Mystery Hook",
      "badgeText": "EXPOSED",
      "showArrow": false
    },
    {
      "id": "variant-c",
      "name": "Clean Contrast & Authority",
      "hypothesis": "Ultra-clean high contrast typography with sharp product spotlight builds immediate trust and clicks from mature viewers",
      "headline": "THE TRUTH.",
      "subline": "Everything Changed",
      "accentColor": "#00E5FF",
      "bgTheme": "dark-cinematic",
      "predictedCtr": 9.7,
      "styleBadge": "High-Trust Pro",
      "badgeText": "UPDATED",
      "showArrow": true
    }
  ],
  "creatorTips": [
    "Increase face brightness and saturation by 15% to pop on dim phone screens",
    "Ensure text stroke is at least 12px for readability in mobile browse feeds",
    "Direct the subject's eye gaze directly toward the text hook or arrow"
  ]
}`;

    const userPrompt = `Video Title: "${title || "Crazy 24-Hour Experiment"}"
Video Description/Premise: "${description || "Testing if it is actually possible to accomplish this crazy challenge with zero preparation"}"
Category: "${category || "Entertainment & Tech"}"
Vibe Preference: "${targetVibe || "High Energy Viral"}"

Provide the complete JSON packaging analysis and A/B test variants.`;

    let contents: any = userPrompt;
    if (videoFrameBase64 && videoFrameBase64.includes("base64,")) {
      const parts = videoFrameBase64.split("base64,");
      const mime = videoFrameBase64.substring(videoFrameBase64.indexOf(":") + 1, videoFrameBase64.indexOf(";"));
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mime || "image/jpeg",
              data: parts[1],
            },
          },
          {
            text: userPrompt + "\nAnalyze this representative video frame to select the optimal subject expression, framing, and contrast.",
          },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error analyzing video:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze video and generate thumbnail strategy",
    });
  }
});

// Thumbnail CTR Quality & Eye-Tracking Heatmap Predictor
app.post("/api/predict-ctr", async (req, res) => {
  try {
    const { thumbnailImageBase64, title, designConfig } = req.body;

    const systemPrompt = `You are an AI YouTube Algorithm & Visual Attention Engine.
Evaluate the given thumbnail design (either visual frame or design configuration) for Click-Through-Rate (CTR) potential against competing videos in YouTube Home Feed and Search Results.
Analyze:
1. Visual Hierarchy & Eye Gaze (Focal point within first 500ms)
2. Mobile Readability (Would text be readable at 120x68px on mobile feed?)
3. Safe-zone check: Is bottom-right corner clear from YouTube timestamp overlay (e.g. '15:42')?
4. Contrast ratio and pop factor against YouTube Dark/Light modes
5. Emotional pull & Curiosity gap

Return STRICTLY valid JSON conforming to this schema:
{
  "predictedCtr": 12.6,
  "ctrBand": "Top 5% High Performer",
  "scores": {
    "readability": 9.2,
    "contrast": 8.8,
    "emotionalPull": 9.5,
    "curiosityGap": 8.9,
    "mobileReadability": 9.0
  },
  "heatmapFixations": [
    {"x": 68, "y": 42, "intensity": 0.95, "label": "Subject Face / Expression"},
    {"x": 30, "y": 38, "intensity": 0.88, "label": "Primary Bold Hook"},
    {"x": 48, "y": 62, "intensity": 0.74, "label": "Visual Accent / Arrow"}
  ],
  "strengths": [
    "Bold contrasting typography readable in under 0.5s",
    "Subject facial emotion anchors instant viewer empathy",
    "Clean background separation avoids visual clutter"
  ],
  "warnings": [
    "Check bottom-right corner to ensure no vital text clashes with YouTube timestamp",
    "Slightly boost outline stroke thickness for extreme small-device browse displays"
  ],
  "actionableBoosts": [
    "Tilt the primary headline 3-5 degrees for heightened psychological urgency",
    "Add a high-energy yellow or cyan stroke to the subject cutout",
    "Slightly darken the background vignette to maximize subject contrast"
  ]
}`;

    const textPrompt = `Analyze this YouTube thumbnail design:
Video Title: "${title || "Sample Video"}"
Design Attributes: ${JSON.stringify(designConfig || {})}`;

    let contents: any = textPrompt;
    if (thumbnailImageBase64 && thumbnailImageBase64.includes("base64,")) {
      const parts = thumbnailImageBase64.split("base64,");
      const mime = thumbnailImageBase64.substring(thumbnailImageBase64.indexOf(":") + 1, thumbnailImageBase64.indexOf(";"));
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mime || "image/jpeg",
              data: parts[1],
            },
          },
          {
            text: textPrompt + "\nAnalyze the visual rendering directly for contrast, eye flow, and CTR score.",
          },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error predicting CTR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to predict CTR analytics",
    });
  }
});

// Reverse-Engineer & Follow Thumbnail Reference Endpoint
app.post("/api/analyze-reference", async (req, res) => {
  try {
    const { referenceImageBase64, videoTitle, videoDescription, category } = req.body;

    if (!referenceImageBase64 || !referenceImageBase64.includes("base64,")) {
      return res.status(400).json({
        success: false,
        error: "A valid base64 reference thumbnail image is required.",
      });
    }

    const parts = referenceImageBase64.split("base64,");
    const mime = referenceImageBase64.substring(
      referenceImageBase64.indexOf(":") + 1,
      referenceImageBase64.indexOf(";")
    ) || "image/jpeg";

    const systemPrompt = `You are a world-class YouTube Thumbnail Director & Reverse-Engineering Specialist.
Deconstruct this high-performing reference YouTube thumbnail image.
Analyze its precise layout formula, color palette, typography styling, subject placement, and graphic accents so the user can recreate their own version based on their video topic.

Return STRICTLY valid JSON conforming to this schema:
{
  "styleTitle": "Short descriptive name for the reference style (e.g. MrBeast High-Contrast Hyper-Pop)",
  "whyItWorks": "1-2 sentences explaining why this thumbnail layout achieved high CTR",
  "adaptedHeadline": "High-impact punchline (2-3 words) adapted for the user's video following the exact phrasing formula",
  "adaptedSubline": "Punchline sub-hook",
  "palette": {
    "backgroundGradientStart": "#dc2626",
    "backgroundGradientEnd": "#05070e",
    "textColor": "#FFE600",
    "textStroke": "#000000",
    "accentColor": "#EF4444",
    "highlightBg": "#dc2626"
  },
  "layoutBlueprint": {
    "subjectX": 72,
    "subjectY": 60,
    "subjectScale": 1.25,
    "subjectGlowType": "neon",
    "subjectGlowColor": "#FACC15",
    "textX": 30,
    "textY": 30,
    "textRotation": -4,
    "fontFamily": "Anton",
    "fontSize": 88,
    "strokeWidth": 16,
    "hasArrow": true,
    "arrowX": 50,
    "arrowY": 45,
    "arrowRotation": -15,
    "badgeText": "100% REAL",
    "bgType": "radial-burst"
  },
  "keyTechniques": [
    "Subject facial expression dominates right 35% of the frame",
    "Left-aligned bold text contrasts with vibrant background",
    "Curved red arrow bridges the eye gaze from subject to hook"
  ]
}`;

    const textPrompt = `Reference Image Deconstruction Request:
Target Video Title: "${videoTitle || "Crazy Experiment"}"
Target Video Premise: "${videoDescription || "Testing if this crazy premise is possible"}"
Category: "${category || "Entertainment"}"

Carefully inspect the provided thumbnail image. Extract its exact color codes, text positioning, font style, subject position, and visual accents, and generate adapted punchlines that fit the user's video title while replicating the reference style faithfully.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: mime,
            data: parts[1],
          },
        },
        {
          text: textPrompt,
        },
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error analyzing thumbnail reference:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze reference thumbnail",
    });
  }
});


// AI Visual Prompt & Asset Ideas Generation
app.post("/api/generate-asset-prompts", async (req, res) => {
  try {
    const { theme, niche, headline } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Generate 4 creative high-CTR graphic element ideas, dynamic background visual prompts, and badge styles for a YouTube thumbnail with:
Niche: ${niche || "Tech / Gaming / Entertainment"}
Headline: "${headline || "UNBELIEVABLE"}"
Theme: ${theme || "High Impact Viral"}

Return JSON format:
{
  "backgroundStyles": [
    {
      "name": "Cyber Neon Darkroom",
      "cssGradient": "radial-gradient(circle at 70% 40%, rgba(255, 0, 128, 0.45) 0%, rgba(10, 15, 30, 0.95) 75%), linear-gradient(135deg, #090a0f 0%, #151a30 100%)",
      "accentColor": "#00FFCC",
      "vibe": "Futuristic gaming and tech"
    },
    {
      "name": "Electric Volcanic Burst",
      "cssGradient": "radial-gradient(ellipse at 50% 50%, rgba(255, 60, 0, 0.4) 0%, rgba(20, 5, 10, 0.98) 80%), linear-gradient(45deg, #180505 0%, #300c0c 100%)",
      "accentColor": "#FFE600",
      "vibe": "Urgent, warning, extreme challenge"
    },
    {
      "name": "Deep Royal Studio Glow",
      "cssGradient": "radial-gradient(circle at 30% 30%, rgba(80, 50, 255, 0.5) 0%, rgba(8, 10, 20, 0.95) 80%), linear-gradient(180deg, #070913 0%, #0d1326 100%)",
      "accentColor": "#60A5FA",
      "vibe": "Authoritative, educational, documentary"
    },
    {
      "name": "Golden Wealth Flash",
      "cssGradient": "radial-gradient(circle at 60% 50%, rgba(255, 200, 0, 0.35) 0%, rgba(12, 10, 5, 0.96) 80%), linear-gradient(135deg, #0d0c07 0%, #1c1808 100%)",
      "accentColor": "#FFD700",
      "vibe": "Finance, luxury, crypto, business"
    }
  ],
  "stickerHooks": [
    {"text": "100% PROVEN", "color": "#00E5FF", "shape": "badge"},
    {"text": "DON'T MISS", "color": "#FF0055", "shape": "pill"},
    {"text": "SHOCKING", "color": "#FFE600", "shape": "tag"}
  ]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generating asset prompts:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Vite or Serve Static Files
if (process.env.NODE_ENV !== "production") {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ClickCraft AI server running on port ${PORT}`);
});

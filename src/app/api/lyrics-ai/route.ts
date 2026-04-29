import { NextRequest, NextResponse } from "next/server";

// ─── Panda AI Lyrics Intelligence Engine ──────────────────────────────────────
// Performs deep structural, emotional, and cultural analysis of song lyrics.
// Designed to work without an external API key by using a rich rule-based NLP engine.

interface LyricToken {
  word: string;
  lower: string;
}

function tokenize(text: string): LyricToken[] {
  return text.split(/\s+/).map((w) => ({
    word: w,
    lower: w.toLowerCase().replace(/[^a-z]/g, ""),
  }));
}

function countMatches(tokens: LyricToken[], keywords: string[]): number {
  return tokens.filter((t) => keywords.includes(t.lower)).length;
}

// ─── Emotion Classifier ───────────────────────────────────────────────────────
const EMOTION_BANKS = {
  love: ["love", "prema", "priya", "heart", "soul", "kiss", "embrace", "darling", "sweetheart", "beloved", "romance", "adore", "cherish", "devotion"],
  longing: ["miss", "longing", "away", "distance", "apart", "yearn", "wait", "return", "gone", "memory", "remember", "nostalgia"],
  joy: ["happy", "joy", "celebrate", "dance", "smile", "laugh", "free", "alive", "light", "sunshine", "bright", "cheers", "party"],
  pain: ["pain", "hurt", "cry", "tears", "broken", "alone", "empty", "lost", "dark", "sorrow", "grief", "wound", "bleed", "suffer"],
  power: ["rise", "strong", "fight", "victory", "power", "fierce", "warrior", "overcome", "brave", "fearless", "stand", "unstoppable"],
  spiritual: ["god", "divine", "bless", "heaven", "soul", "pray", "faith", "light", "eternal", "grace", "worship", "devotion"],
};

type EmotionKey = keyof typeof EMOTION_BANKS;

function classifyEmotion(tokens: LyricToken[]): { primary: EmotionKey; secondary: EmotionKey; scores: Record<EmotionKey, number> } {
  const scores = {} as Record<EmotionKey, number>;
  for (const [emotion, keywords] of Object.entries(EMOTION_BANKS)) {
    scores[emotion as EmotionKey] = countMatches(tokens, keywords);
  }
  const sorted = (Object.entries(scores) as [EmotionKey, number][]).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores,
  };
}

// ─── Literary Device Detector ─────────────────────────────────────────────────
function detectLiteraryDevices(lyrics: string): string[] {
  const devices: string[] = [];
  const lines = lyrics.split("\n").filter((l) => l.trim());

  // Repetition: same line appears more than once
  const lineCounts = new Map<string, number>();
  lines.forEach((l) => {
    const key = l.trim().toLowerCase();
    lineCounts.set(key, (lineCounts.get(key) || 0) + 1);
  });
  if ([...lineCounts.values()].some((v) => v >= 2)) devices.push("Anaphora / Refrain");

  // Alliteration: many words starting with same letter in a line
  const alliterationLine = lines.find((line) => {
    const words = line.split(" ").map((w) => w[0]?.toLowerCase());
    const freq = new Map<string, number>();
    words.forEach((c) => c && freq.set(c, (freq.get(c) || 0) + 1));
    return [...freq.values()].some((v) => v >= 3);
  });
  if (alliterationLine) devices.push("Alliteration");

  // Metaphor keywords
  if (/\b(like|as|become|is a|are)\b/i.test(lyrics)) devices.push("Simile & Metaphor");

  // Questions – rhetorical device
  if ((lyrics.match(/\?/g) || []).length >= 2) devices.push("Rhetorical Questions");

  // Imagery – sensory words
  const sensory = ["eyes", "lips", "sky", "rain", "fire", "ocean", "breath", "hands", "moon", "star"];
  if (sensory.some((w) => lyrics.toLowerCase().includes(w))) devices.push("Vivid Imagery");

  return devices.length ? devices : ["Free Verse", "Direct Expression"];
}

// ─── Cultural Context Detector ────────────────────────────────────────────────
function detectCulturalContext(lyrics: string, artist: string): string {
  const lower = lyrics.toLowerCase() + " " + artist.toLowerCase();
  if (/prema|nenu|nee|meeru|okka|manchi|swaram|kallu|gunde|cheliya|vennela/.test(lower)) {
    return "Telugu Cinema & Folk — This song is rooted in classical Telugu poetic traditions (Prabandham style), blending folk rhythms with contemporary film-score sensibilities.";
  }
  if (/tere|mera|pyaar|dil|zindagi|ishq|mohabbat|yaar/.test(lower)) {
    return "Hindustani Classical & Bollywood — Draws from the Urdu ghazal tradition with modern Bollywood production aesthetics.";
  }
  if (/mama|amma|thozha|kadhal|vaanam|ilamai/.test(lower)) {
    return "Tamil Carnatic & Modern Kollywood — Blends Carnatic melodic structures with contemporary Tamil cinema production.";
  }
  return "Contemporary South Asian Pop — A fusion of regional classical influences with modern global production techniques.";
}

// ─── Emotional Arc Builder ────────────────────────────────────────────────────
function buildEmotionalArc(lyrics: string): string {
  const stanzas = lyrics.split(/\n\n+/).filter((s) => s.trim());
  if (stanzas.length < 2) return "Single-wave emotional journey — a direct, focused emotional statement.";
  if (stanzas.length === 2) return "Binary arc: Tension → Release — the song builds conflict and resolves it.";
  if (stanzas.length === 3) return "Classic Exposition → Climax → Resolution structure.";
  return `Multi-layered arc across ${stanzas.length} movements — complex emotional journey that mirrors the listener's own experience.`;
}

// ─── Mood Tags ────────────────────────────────────────────────────────────────
const MOOD_TAG_MAP: Record<EmotionKey, string[]> = {
  love:     ["Romantic", "Tender", "Intimate", "Warm"],
  longing:  ["Nostalgic", "Bittersweet", "Wistful", "Melancholic"],
  joy:      ["Uplifting", "Euphoric", "Celebratory", "Energetic"],
  pain:     ["Raw", "Vulnerable", "Cathartic", "Intense"],
  power:    ["Anthemic", "Empowering", "Triumphant", "Bold"],
  spiritual:["Meditative", "Transcendent", "Devotional", "Serene"],
};

// ─── Signature Line Picker ────────────────────────────────────────────────────
function pickSignatureLine(lyrics: string): string {
  const lines = lyrics.split("\n").filter((l) => l.trim().length > 15 && l.trim().length < 80);
  if (!lines.length) return "";
  // Prefer a line from the middle (chorus-like)
  return lines[Math.floor(lines.length / 2)].trim();
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { lyrics, title, artist } = await req.json();

    if (!lyrics) {
      return NextResponse.json({ success: false, error: "Lyrics required" }, { status: 400 });
    }

    // Simulate thoughtful AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const tokens = tokenize(lyrics);
    const emotion = classifyEmotion(tokens);
    const devices = detectLiteraryDevices(lyrics);
    const cultural = detectCulturalContext(lyrics, artist || "");
    const arc = buildEmotionalArc(lyrics);
    const moodTags = MOOD_TAG_MAP[emotion.primary] || ["Emotional", "Expressive"];
    const signatureLine = pickSignatureLine(lyrics);
    const wordCount = tokens.length;
    const lineCount = lyrics.split("\n").filter((l: string) => l.trim()).length;

    const uniqueWords = new Set(tokens.map((t) => t.lower).filter(Boolean)).size;
    const lexicalDiversity = Math.round((uniqueWords / wordCount) * 100);

    const primaryEmotionLabel = emotion.primary.charAt(0).toUpperCase() + emotion.primary.slice(1);
    const secondaryEmotionLabel = emotion.secondary.charAt(0).toUpperCase() + emotion.secondary.slice(1);

    const analysis = `"${title}" by ${artist} is a ${primaryEmotionLabel.toLowerCase()}-driven composition with undertones of ${secondaryEmotionLabel.toLowerCase()}. ${arc} The lyrical vocabulary (${lexicalDiversity}% lexical diversity) suggests a ${lexicalDiversity > 60 ? "rich, poetically sophisticated" : "direct, emotionally immediate"} approach to storytelling.`;

    const sections = [
      {
        icon: "heart",
        title: "Primary Emotion",
        value: primaryEmotionLabel,
        detail: `Undercurrent of ${secondaryEmotionLabel}`,
      },
      {
        icon: "tag",
        title: "Mood Tags",
        value: moodTags.slice(0, 2).join(" · "),
        detail: moodTags.slice(2).join(" · "),
      },
      {
        icon: "pen",
        title: "Literary Devices",
        value: devices[0],
        detail: devices.slice(1).join(", ") || "—",
      },
      {
        icon: "music",
        title: "Emotional Arc",
        value: arc.split("—")[0].trim(),
        detail: arc.split("—")[1]?.trim() || "",
      },
      {
        icon: "globe",
        title: "Cultural Context",
        value: cultural.split("—")[0].trim(),
        detail: cultural.split("—")[1]?.trim() || "",
      },
      {
        icon: "bar-chart",
        title: "Lexical Depth",
        value: `${lexicalDiversity}% Diversity`,
        detail: `${wordCount} words · ${lineCount} lines · ${uniqueWords} unique`,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        sections,
        signatureLine,
        moodTags,
        primaryEmotion: primaryEmotionLabel,
        lexicalDiversity,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "AI Analysis failed" }, { status: 500 });
  }
}

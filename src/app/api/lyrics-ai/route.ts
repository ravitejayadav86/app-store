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
  love: ["love", "prema", "priya", "heart", "soul", "kiss", "embrace", "darling", "romance", "adore", "cherish", "ishq", "pyaar", "kadhal", "sneham", "pranayam", "olavu", "preethi"],
  longing: ["miss", "longing", "away", "distance", "apart", "yearn", "wait", "return", "gone", "memory", "remember", "viraha", "dooriyaan", "kanneer"],
  joy: ["happy", "joy", "celebrate", "dance", "smile", "laugh", "free", "alive", "light", "sunshine", "santhosham", "khushi", "aanandham", "kushi"],
  pain: ["pain", "hurt", "cry", "tears", "broken", "alone", "empty", "lost", "dark", "sorrow", "grief", "dard", "baadhe", "vedhana"],
  power: ["rise", "strong", "fight", "victory", "power", "fierce", "warrior", "overcome", "brave", "fearless", "stand", "unstoppable", "veera", "shakti"],
  spiritual: ["god", "divine", "bless", "heaven", "soul", "pray", "faith", "light", "eternal", "grace", "worship", "devotion", "deva", "bhakti", "kadavul", "daivam"],
};

type EmotionKey = keyof typeof EMOTION_BANKS;

function classifyEmotion(tokens: LyricToken[]): { primary: EmotionKey; secondary: EmotionKey; scores: Record<EmotionKey, number> } {
  const scores = {} as Record<EmotionKey, number>;
  for (const [emotion, keywords] of Object.entries(EMOTION_BANKS)) {
    scores[emotion as EmotionKey] = countMatches(tokens, keywords);
  }
  const sorted = (Object.entries(scores) as [EmotionKey, number][]).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0] || "joy",
    secondary: sorted[1][0] || "power",
    scores,
  };
}

// ─── Literary Device Detector ─────────────────────────────────────────────────
function detectLiteraryDevices(lyrics: string): string[] {
  if (!lyrics || lyrics.includes("Lyrics not available")) return ["Sonic Storytelling", "Rhythmic Motifs"];
  const devices: string[] = [];
  const lines = lyrics.split("\n").filter((l) => l.trim());

  const lineCounts = new Map<string, number>();
  lines.forEach((l) => {
    const key = l.trim().toLowerCase();
    lineCounts.set(key, (lineCounts.get(key) || 0) + 1);
  });
  if ([...lineCounts.values()].some((v) => v >= 2)) devices.push("Anaphora / Refrain");

  const alliterationLine = lines.find((line) => {
    const words = line.split(" ").map((w) => w[0]?.toLowerCase());
    const freq = new Map<string, number>();
    words.forEach((c) => c && freq.set(c, (freq.get(c) || 0) + 1));
    return [...freq.values()].some((v) => v >= 3);
  });
  if (alliterationLine) devices.push("Alliteration");

  if (/\b(like|as|become|is a|are)\b/i.test(lyrics)) devices.push("Simile & Metaphor");
  if ((lyrics.match(/\?/g) || []).length >= 2) devices.push("Rhetorical Questions");

  const sensory = ["eyes", "lips", "sky", "rain", "fire", "ocean", "breath", "hands", "moon", "star", "kallu", "kannu"];
  if (sensory.some((w) => lyrics.toLowerCase().includes(w))) devices.push("Vivid Imagery");

  return devices.length ? devices : ["Free Verse", "Direct Expression"];
}

// ─── Cultural Context Detector ────────────────────────────────────────────────
function detectCulturalContext(textToAnalyze: string): string {
  const lower = textToAnalyze.toLowerCase();
  if (/prema|nenu|nee|meeru|okka|manchi|swaram|kallu|gunde|cheliya|vennela|telugu|tollywood/.test(lower)) {
    return "Telugu Cinema & Folk — Rooted in classical Telugu poetic traditions (Prabandham style), blending vibrant folk rhythms with modern film-score sensibilities.";
  }
  if (/tere|mera|pyaar|dil|zindagi|ishq|mohabbat|yaar|hindi|bollywood/.test(lower)) {
    return "Hindustani & Bollywood Pop — Draws from the rich Urdu ghazal tradition merged with modern, high-energy Bollywood production aesthetics.";
  }
  if (/mama|amma|thozha|kadhal|vaanam|ilamai|tamil|kollywood/.test(lower)) {
    return "Tamil Carnatic & Kollywood — Melds deep Carnatic melodic structures with powerful, contemporary percussion and Tamil poetic depth.";
  }
  if (/sneham|pranayam|hridayam|malayalam|mollywood/.test(lower)) {
    return "Malayalam Melody & Folk — Evokes the lush, rhythmic poetry of Kerala's folk music and contemporary Mollywood soundscapes.";
  }
  if (/preethi|olavu|kannada|sandalwood|ninnindale/.test(lower)) {
    return "Kannada Bhavageethe & Sandalwood — A fusion of expressive Bhavageethe vocal styling with grand, orchestral Sandalwood pop.";
  }
  if (/love|heart|night|dance|english|pop|hollywood/.test(lower)) {
    return "Global Western Pop — Structured around modern western harmonic progressions and universal pop-lyricism.";
  }
  return "Contemporary Fusion — A masterful blend of regional cultural influences with modern global production techniques.";
}

// ─── Emotional Arc Builder ────────────────────────────────────────────────────
function buildEmotionalArc(lyrics: string, isSimulated: boolean): string {
  if (isSimulated) return "Dynamic sonic journey — builds tension through instrumentation before reaching a powerful, rhythmic resolution.";
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
function pickSignatureLine(lyrics: string, title: string, isSimulated: boolean): string {
  if (isSimulated) return `(Instrumental / Sonic motif of "${title}")`;
  const lines = lyrics.split("\n").filter((l) => l.trim().length > 15 && l.trim().length < 80 && !l.includes("Lyrics not available"));
  if (!lines.length) return title;
  return lines[Math.floor(lines.length / 2)].trim();
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { lyrics, title, artist } = await req.json();

    // Determine if we need to do a "Simulated" metadata analysis due to missing lyrics
    const isSimulated = !lyrics || lyrics.includes("Lyrics not available") || lyrics.includes("Failed to load");
    
    // Simulate thoughtful AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1600));

    // For simulated analysis, we analyze the title + artist text to guess the vibe
    const textToAnalyze = isSimulated ? `${title} ${artist} ${title} ${title}` : lyrics;
    const tokens = tokenize(textToAnalyze);
    
    const emotion = classifyEmotion(tokens);
    const devices = detectLiteraryDevices(isSimulated ? "" : lyrics);
    const cultural = detectCulturalContext(`${textToAnalyze} ${artist}`);
    const arc = buildEmotionalArc(isSimulated ? "" : lyrics, isSimulated);
    const moodTags = MOOD_TAG_MAP[emotion.primary] || ["Emotional", "Expressive"];
    const signatureLine = pickSignatureLine(isSimulated ? "" : lyrics, title, isSimulated);
    
    const wordCount = isSimulated ? 0 : tokens.length;
    const lineCount = isSimulated ? 0 : lyrics.split("\n").filter((l: string) => l.trim()).length;

    const uniqueWords = new Set(tokens.map((t) => t.lower).filter(Boolean)).size;
    const lexicalDiversity = isSimulated ? 85 : Math.round((uniqueWords / wordCount) * 100) || 50;

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

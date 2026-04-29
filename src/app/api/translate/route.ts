import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang = "en" } = await req.json();

    if (!text) {
      return NextResponse.json({ success: false, error: "Text required" }, { status: 400 });
    }

    // Google Translate Free API (gtx)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Translation API failed");
    }

    const data = await response.json();
    
    // data[0] is an array of sentences.
    // Each sentence is an array where:
    // index 0 = translated text
    // index 1 = original text
    // index 2 = null
    // index 3 = romanized/transliterated text
    
    let translated = "";
    let transliterated = "";

    if (data && data[0]) {
      for (const sentence of data[0]) {
        if (sentence[0]) translated += sentence[0] + " ";
        // If the original text is already english, transliteration might be null
        if (sentence[3]) transliterated += sentence[3] + " ";
        else if (sentence[1]) transliterated += sentence[1] + " ";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        translated: translated.trim() || text,
        transliterated: transliterated.trim() || text,
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

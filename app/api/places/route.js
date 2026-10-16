// Google Places Autocomplete (New) proxy – a kulcs a szerveren marad, a böngésző nem lát Google-sütit.
// Kulcs nélkül 204-et ad, ilyenkor a mezők sima szövegmezőként működnek.

const ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";

export async function GET(req) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return new Response(null, { status: 204 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 80);
  const kind = searchParams.get("kind") === "city" ? "city" : "venue";
  const session = (searchParams.get("s") || "").slice(0, 64);
  if (q.length < 3) return Response.json({ items: [] });

  const body = {
    input: q,
    languageCode: "hu",
    regionCode: "hu",
    includedRegionCodes: ["hu"],
    ...(kind === "city" ? { includedPrimaryTypes: ["locality"] } : {}),
    ...(session ? { sessionToken: session } : {}),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      console.error("[places]", res.status, await res.text().catch(() => ""));
      return Response.json({ items: [] });
    }
    const data = await res.json();
    const items = (data.suggestions || [])
      .map((s) => s.placePrediction)
      .filter(Boolean)
      .slice(0, 6)
      .map((p) => {
        const main = p.structuredFormat?.mainText?.text || p.text?.text || "";
        const secondary = (p.structuredFormat?.secondaryText?.text || "").replace(/,?\s*Magyarország$/, "");
        return {
          id: p.placeId,
          main,
          secondary,
          value: kind === "city" ? main : [main, secondary].filter(Boolean).join(", "),
        };
      });
    return Response.json({ items }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[places]", err);
    return Response.json({ items: [] });
  }
}

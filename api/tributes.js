const PROBE_NAMES = {
 opportunity: "Opportunity (MER-B)",
 voyager1: "Voyager 1",
 spirit: "Spirit (MER-A)",
 cassini: "Cassini-Huygens",
 apollo15: "Apollo 15 Lunar Rover",
};

const TRIBUTE_COLUMNS = "id,author,callsign,probe,message,created_at,hearts";

function getQuery(req, name) {
  return req.query?.[name] || new URL(req.url, "http://localhost").searchParams.get(name);
}

function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_") ||
    supabaseAnonKey.includes("YOUR_")
  ) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required.");
  }

  const parsedUrl = new URL(supabaseUrl);
  if (
    parsedUrl.protocol !== "https:" &&
    !(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost")
  ) {
    throw new Error("SUPABASE_URL must use HTTPS.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function toTribute(row) {
  return {
    id: row.id,
    author: row.author,
    callsign: row.callsign,
    probe: row.probe,
    probeName: PROBE_NAMES[row.probe],
    message: row.message,
    date: row.created_at.slice(0, 10),
    hearts: row.hearts,
  };
}

async function requestSupabase(req, path, body) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: req.method,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(body && {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase returned HTTP ${response.status}: ${details}`);
  }
  return response.json();
}

function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const probe = getQuery(req, "probe");
    if (probe && probe !== "all" && !PROBE_NAMES[probe]) {
      return res.status(400).json({ error: "Unknown spacecraft filter." });
    }
    const query = new URLSearchParams({
      select: TRIBUTE_COLUMNS,
      order: "created_at.desc",
    });
    if (probe && probe !== "all") query.set("probe", `eq.${probe}`);
    return requestSupabase(req, `tributes?${query}`, undefined)
      .then((rows) => res.status(200).json(rows.map(toTribute)))
      .catch((error) => {
        console.error("Could not load tributes:", error);
        return res.status(502).json({ error: "Tributes are temporarily unavailable." });
      });
  }

  if (req.method === "POST") {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
    const probe = typeof body.probe === "string" ? body.probe.toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 500) {
      return res.status(400).json({ error: "Tribute message must be between 1 and 500 characters." });
    }
    if (!PROBE_NAMES[probe]) {
      return res.status(400).json({ error: "Choose a supported spacecraft." });
    }

    const textValue = (value, fallback, maxLength) =>
      typeof value === "string" ? value.trim().slice(0, maxLength) || fallback : fallback;
    const tribute = {
      author: textValue(body.author, "Anonymous Explorer", 50),
      callsign: textValue(body.callsign, "Observer", 30),
      probe,
      message,
    };

    return requestSupabase(req, "tributes", tribute)
      .then((rows) => {
        if (!Array.isArray(rows) || !rows[0]) {
          throw new Error("Supabase did not return the saved tribute.");
        }
        return res.status(201).json(toTribute(rows[0]));
      })
      .catch((error) => {
        console.error("Could not save tribute:", error);
        return res.status(502).json({ error: "Could not save tribute. Please try again." });
      });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
}

module.exports = handler;

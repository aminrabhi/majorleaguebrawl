import fetch from "node-fetch";

// Replace with your Brawl Stars API key
const API_KEY = process.env.BRAWLSTARS_KEY;  

export default async function handler(req, res) {
  // Expect POST with JSON: { tag: "#PLAYER_TAG", brawler: "Shelly" }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tag, brawler } = req.body;
  if (!tag || !brawler) {
    return res.status(400).json({ error: "Missing tag or brawler" });
  }

  try {
    // Call the proxy API
    const response = await fetch(`https://bsproxy.royaleapi.dev/v1/players/${encodeURIComponent(tag)}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch player" });
    }

    const playerData = await response.json();

    // Find selected brawler
    const selected = playerData.brawlers.find(b => b.name.toLowerCase() === brawler.toLowerCase());
    if (!selected) return res.status(404).json({ error: "Brawler not found" });

    const trophies = selected.trophies;

    // Save to "leaderboard" (simple in-memory for now)
    // Later, use a database like Firebase or Supabase
    if (!global.leaderboard) global.leaderboard = [];
    const existing = global.leaderboard.find(p => p.tag === tag);
    if (existing) {
      existing.trophies = trophies;
      existing.brawler = brawler;
    } else {
      global.leaderboard.push({ tag, brawler, trophies, name: playerData.name });
    }

    return res.status(200).json({ tag, brawler, trophies, name: playerData.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

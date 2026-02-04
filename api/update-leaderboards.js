import fs from 'fs';
import path from 'path';

const API_KEY = process.env.BRAWLSTARS_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Resolve path to your JSON file
  const filePath = path.join(process.cwd(), 'verifiedUsers.json');

  let users;
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    users = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to read or parse verifiedUsers.json:', err);
    return res.status(500).json({ error: 'Server error reading verifiedUsers.json' });
  }

  const majorLeaderboard = [];
  const minorLeaderboard = [];

  for (let user of users) {
    try {
      const response = await fetch(
        `https://bsproxy.royaleapi.dev/v1/players/${encodeURIComponent(user.tag)}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );

      if (!response.ok) {
        console.error(`Failed to fetch ${user.tag}: Status ${response.status}`);
        continue;
      }

      const playerData = await response.json();

      // Find the user's selected brawler
      const selectedBrawler = playerData.brawlers.find(
        b => b.name.toLowerCase() === user.brawler.toLowerCase()
      );

      if (!selectedBrawler) {
        console.error(`Brawler ${user.brawler} not found for ${user.tag}`);
        continue;
      }

      const entry = {
        tag: user.tag,
        name: playerData.name,
        brawler: user.brawler,
        trophies: selectedBrawler.trophies
      };

      if (user.league === 'major') majorLeaderboard.push(entry);
      else if (user.league === 'minor') minorLeaderboard.push(entry);

    } catch (err) {
      console.error(`Error fetching data for ${user.tag}:`, err);
    }
  }

  // Sort each leaderboard by trophies descending
  majorLeaderboard.sort((a, b) => b.trophies - a.trophies);
  minorLeaderboard.sort((a, b) => b.trophies - a.trophies);

  // Return JSON safely
  res.status(200).json({ majorLeaderboard, minorLeaderboard });
}

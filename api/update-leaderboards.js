import fs from 'fs';
import path from 'path';

const API_KEY = process.env.BRAWLSTARS_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const filePath = path.join(process.cwd(), 'verifiedUsers.json');

  let users;
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    users = JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading verifiedUsers.json:', err);
    return res.status(500).json({ error: 'Failed to read verifiedUsers.json' });
  }

  const majorLeaderboard = [];
  const minorLeaderboard = [];

  for (const user of users) {
    try {
      if (!API_KEY) {
        console.error('Brawl Stars API key is missing');
        continue;
      }

      const response = await fetch(
        `https://bsproxy.royaleapi.dev/v1/players/${encodeURIComponent(user.tag)}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );

      if (!response.ok) {
        console.error(`Failed to fetch ${user.tag}: ${response.status}`);
        continue;
      }

      const playerData = await response.json();

      const selectedBrawler = playerData.brawlers?.find(
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
        trophies: selectedBrawler.trophies || 0
      };

      if (user.league === 'major') majorLeaderboard.push(entry);
      else if (user.league === 'minor') minorLeaderboard.push(entry);

    } catch (err) {
      console.error(`Error fetching ${user.tag}:`, err);
    }
  }

  // Always return valid JSON
  res.status(200).json({
    majorLeaderboard,
    minorLeaderboard
  });
}

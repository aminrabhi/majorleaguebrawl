import fs from 'fs';
import path from 'path';

const API_KEY = process.env.BRAWLSTARS_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const filePath = path.join(process.cwd(), 'verifiedUsers.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const users = JSON.parse(rawData);

  const majorLeaderboard = [];
  const minorLeaderboard = [];

  for (let user of users) {
    try {
      const response = await fetch(
        `https://bsproxy.royaleapi.dev/v1/players/${encodeURIComponent(user.tag)}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
      if (!response.ok) continue;

      const playerData = await response.json();
      const selectedBrawler = playerData.brawlers.find(
        b => b.name.toLowerCase() === user.brawler.toLowerCase()
      );
      if (!selectedBrawler) continue;

      const entry = {
        tag: user.tag,
        name: playerData.name,
        brawler: user.brawler,
        trophies: selectedBrawler.trophies
      };

      if (user.league === 'major') majorLeaderboard.push(entry);
      else if (user.league === 'minor') minorLeaderboard.push(entry);

    } catch (err) {
      console.error(`Failed to fetch ${user.tag}:`, err);
    }
  }

  // Sort each league by trophies descending
  majorLeaderboard.sort((a, b) => b.trophies - a.trophies);
  minorLeaderboard.sort((a, b) => b.trophies - a.trophies);

  res.status(200).json({ majorLeaderboard, minorLeaderboard });
}

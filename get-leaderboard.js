export default function handler(req, res) {
  if (!global.leaderboard) global.leaderboard = [];
  res.status(200).json(global.leaderboard);
}

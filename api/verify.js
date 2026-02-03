// For demo: in-memory verification storage
let verificationIcons = {}; // must match start-verification.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tag, requiredIcon } = req.body;
  if (!tag || requiredIcon == null) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const cleanTag = tag.replace('#','').trim();

    // Fetch player info
    const apiRes = await fetch(`https://bsproxy.royaleapi.dev/v1/players/%23${cleanTag}`, {
      headers: { Authorization: `Bearer ${process.env.BRAWL_API_KEY}` }
    });
    if (!apiRes.ok) return res.status(400).json({ error: 'Failed to fetch player' });

    const player = await apiRes.json();

    if (player.icon.id !== requiredIcon) {
      return res.status(400).json({ error: 'Profile icon does not match the required one.' });
    }

    // Verified successfully
    res.status(200).json({ success: true, message: 'Player verified!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

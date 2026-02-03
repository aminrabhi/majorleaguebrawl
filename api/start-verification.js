// In-memory storage for demonstration (reset on server restart)
let verificationIcons = {}; 

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Generate a random icon ID (example: 0–27)
  const requiredIcon = Math.floor(Math.random() * 28); 
  const sessionId = Math.random().toString(36).substring(2,10); // temporary ID

  // Save for verification
  verificationIcons[sessionId] = requiredIcon;

  res.status(200).json({ requiredIcon, sessionId });
}

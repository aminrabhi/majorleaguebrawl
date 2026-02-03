let requiredIcon = null;

async function addPlayer() {
  const tag = document.getElementById('tag').value.replace('#','');
  const brawler = document.getElementById('brawler').value.trim().toUpperCase();
  const status = document.getElementById('status');

  status.textContent = 'Fetching player...';

  const res = await fetch('/api/fetch-trophies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag, brawler })
  });

  const data = await res.json();

  if (data.error) {
    status.textContent = data.error;
    return;
  }

  status.innerHTML = `
    <strong>${data.name}</strong><br>
    ${brawler}: ${data.trophies} trophies<br><br>
    <img src="https://cdn.brawlstats.com/player-icons/${data.iconId}.png" width="48"><br><br>
    <button onclick="startVerification()">Verify Account</button>
  `;
}

async function startVerification() {
  const res = await fetch('/api/start-verification');
  const data = await res.json();

  requiredIcon = data.requiredIcon;

  document.getElementById('status').innerHTML = `
    Change your Brawl Stars icon to this:<br><br>
    <img src="https://cdn.brawlstats.com/player-icons/${requiredIcon}.png" width="64"><br><br>
    <button onclick="verify()">I changed it</button>
  `;
}

async function verify() {
  const tag = document.getElementById('tag').value.replace('#','');

  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag, requiredIcon })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    alert('✅ Account verified!');
    // later → redirect to leaderboard
    window.location.href = '/leaderboards.html';
  }
}

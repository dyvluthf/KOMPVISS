let autoInterval = null;

function getApiKey() {
  return localStorage.getItem('claude_api_key');
}

function captureFrame() {
  const video = document.getElementById('video');
  const offscreen = document.createElement('canvas');
  offscreen.width = video.videoWidth;
  offscreen.height = video.videoHeight;
  const ctx = offscreen.getContext('2d');
  ctx.drawImage(video, 0, 0);
  return offscreen.toDataURL('image/jpeg', 0.8).split(',')[1];
}

async function analyzeWithClaude() {
  const apiKey = getApiKey();
  const resultEl = document.getElementById('ai-result');

  if (!isRunning) {
    resultEl.innerHTML = '<span style="color: #eab308;">⚠️ Kamera belum aktif. Klik Mulai terlebih dahulu.</span>';
    return;
  }

  if (!apiKey) {
    resultEl.innerHTML = '<span style="color: #eab308;">⚠️ Masukkan API Key terlebih dahulu (klik ⚙ di pojok kanan atas).</span>';
    return;
  }

  resultEl.innerHTML = '⏳ Menganalisis...';

  try {
    const base64 = captureFrame();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64
                }
              },
              {
                type: 'text',
                text: 'Kamu adalah asisten analisis wajah. Lihat gambar ini dan jelaskan: (1) berapa wajah yang terdeteksi, (2) ekspresi atau emosi yang terlihat, (3) deskripsi singkat kondisi pencahayaan atau posisi wajah. Jawab dalam Bahasa Indonesia, singkat dan informatif, maksimal 4 kalimat.'
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const resultText = data.content[0].text;
    resultEl.innerHTML = resultText.replace(/\n/g, '<br>');
    addToHistory(resultText);

  } catch (err) {
    resultEl.innerHTML = `<span style="color: #ef4444;">⚠️ Gagal menganalisis: ${err.message}</span>`;
    console.error('Claude API error:', err);
  }
}

function addToHistory(text) {
  const log = document.getElementById('history-log');
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const preview = text.replace(/\n/g, ' ').substring(0, 40) + '...';

  const entry = document.createElement('div');
  entry.className = 'history-entry';
  entry.innerHTML = `<span class="history-entry__time">${time}</span> — ${preview}`;

  log.prepend(entry);

  while (log.children.length > 10) {
    log.removeChild(log.lastChild);
  }
}

function startAutoAnalyze(seconds) {
  stopAutoAnalyze();
  if (seconds > 0) {
    autoInterval = setInterval(analyzeWithClaude, seconds * 1000);
  }
}

function stopAutoAnalyze() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-analyze').addEventListener('click', analyzeWithClaude);

  document.querySelectorAll('input[name="interval"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        const val = parseInt(radio.value, 10);
        startAutoAnalyze(val);
      }
    });
  });

  const modal = document.getElementById('modal-apikey');
  const inputApiKey = document.getElementById('input-apikey');
  const savedKey = getApiKey();
  if (savedKey) {
    inputApiKey.value = savedKey;
  }

  document.getElementById('btn-api-key').addEventListener('click', () => {
    modal.classList.add('modal--open');
  });

  document.getElementById('btn-save-apikey').addEventListener('click', () => {
    const key = inputApiKey.value.trim();
    if (key) {
      localStorage.setItem('claude_api_key', key);
      modal.classList.remove('modal--open');
      document.getElementById('ai-result').innerHTML = '<span style="color: #22c55e;">✅ API Key tersimpan.</span>';
    } else {
      alert('Masukkan API Key yang valid.');
    }
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.remove('modal--open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('modal--open');
    }
  });
});
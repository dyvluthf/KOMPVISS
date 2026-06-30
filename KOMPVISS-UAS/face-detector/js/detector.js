let detectionInterval = null;
let faceCount = 0;

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

async function loadModels() {
  const statusEl = document.getElementById('loading-status');
  statusEl.textContent = '⏳ Memuat model deteksi wajah...';

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    statusEl.textContent = 'Model siap. Klik Mulai untuk membuka kamera.';
  } catch (err) {
    statusEl.textContent = '⚠️ Gagal memuat model. Periksa koneksi internet.';
    console.error('Model load error:', err);

    const resultEl = document.getElementById('ai-result');
    resultEl.innerHTML = '<span style="color: #ef4444;">⚠️ Gagal memuat model face-api.js. Coba refresh halaman atau periksa koneksi internet Anda.</span>';
  }
}

function startDetection() {
  if (detectionInterval) return;

  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const faceCountEl = document.getElementById('face-count');

  detectionInterval = setInterval(async () => {
    if (video.paused || video.ended || !video.videoWidth) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      faceCount = detections.length;
      faceCountEl.textContent = `Wajah: ${faceCount}`;

      const container = document.getElementById('video-container');
      if (faceCount > 0) {
        container.style.borderColor = '';
        container.classList.add('video-container--active');
      } else {
        container.style.borderColor = '#ef4444';
        container.classList.remove('video-container--active');
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, 200);
}

function stopDetection() {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  document.getElementById('face-count').textContent = 'Wajah: 0';
}

function onCameraReady() {
  startDetection();
}

document.addEventListener('DOMContentLoaded', loadModels);
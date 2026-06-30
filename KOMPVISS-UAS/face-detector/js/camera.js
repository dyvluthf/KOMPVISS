let stream = null;
let isRunning = false;

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnAnalyze = document.getElementById('btn-analyze');
const videoContainer = document.getElementById('video-container');
const loadingStatus = document.getElementById('loading-status');

async function startCamera() {
  if (isRunning) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('⚠️ Browser tidak mendukung akses kamera. Gunakan HTTPS atau localhost.');
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: { ideal: 'user' } }
    });

    video.srcObject = stream;
    isRunning = true;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    overlay.width = video.videoWidth || 640;
    overlay.height = video.videoHeight || 480;

    if (typeof onCameraReady === 'function') {
      onCameraReady();
    }

    btnStart.disabled = true;
    btnStop.disabled = false;
    btnAnalyze.disabled = false;
    videoContainer.classList.add('video-container--active');
    loadingStatus.style.display = 'none';

  } catch (err) {
    let message = 'Tidak dapat mengakses kamera.';
    if (err.name === 'NotAllowedError') {
      message = 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.';
    } else if (err.name === 'NotFoundError') {
      message = 'Tidak ada kamera yang terdeteksi di perangkat ini.';
    } else if (err.name === 'NotReadableError') {
      message = 'Kamera sedang digunakan oleh aplikasi lain.';
    } else if (err.name === 'SecurityError') {
      message = 'Akses kamera diblokir. Jalankan melalui HTTPS atau localhost (bukan file://).';
    }
    alert('⚠️ ' + message);
    console.error('Camera error:', err);
  }
}

function stopCamera() {
  if (!isRunning) return;

  if (typeof stopDetection === 'function') {
    stopDetection();
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  video.srcObject = null;
  isRunning = false;

  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  btnStart.disabled = false;
  btnStop.disabled = true;
  btnAnalyze.disabled = true;
  videoContainer.classList.remove('video-container--active');
  videoContainer.style.borderColor = '';
}

document.addEventListener('DOMContentLoaded', () => {
  btnStart.addEventListener('click', startCamera);
  btnStop.addEventListener('click', stopCamera);
});
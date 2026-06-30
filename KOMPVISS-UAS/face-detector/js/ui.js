
document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('video');
  const overlay = document.getElementById('overlay');

  function syncCanvasSize() {
    if (video.videoWidth && video.videoHeight) {
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
    }
  }

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(video);
  }

  window.addEventListener('resize', syncCanvasSize);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const status = document.getElementById('loading-status');
    status.textContent = '⚠️ Browser tidak mendukung akses kamera. Gunakan HTTPS atau localhost.';
    status.style.color = '#ef4444';
  }
});
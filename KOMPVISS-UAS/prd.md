# PRD — Aplikasi Deteksi Wajah Realtime (Web)

**Versi:** 1.0  
**Tanggal:** 16 Juni 2026  
**Stack:** Vanilla HTML/CSS/JS + Face-api.js + Claude API (Anthropic)

---

## 1. Overview

Aplikasi web sederhana yang mendeteksi wajah secara realtime melalui kamera perangkat menggunakan **face-api.js** (model TensorFlow.js), lalu mengirimkan frame ke **Claude API** untuk menghasilkan deskripsi/analisis wajah berbasis AI.

---

## 2. Tujuan

- Deteksi wajah realtime langsung di browser (tanpa backend server khusus)
- Analisis AI per-wajah menggunakan Claude API (model `claude-sonnet-4-6`)
- Antarmuka bersih, responsif, dan dapat dijalankan dengan `npx serve` atau XAMPP

---

## 3. Fitur Utama

| ID | Fitur | Prioritas |
|----|-------|-----------|
| F01 | Akses kamera perangkat (webcam) | Wajib |
| F02 | Deteksi wajah realtime (bounding box + landmark) | Wajib |
| F03 | Capture frame wajah & kirim ke Claude API | Wajib |
| F04 | Tampilkan hasil analisis AI di panel samping | Wajib |
| F05 | Toggle aktif/nonaktif kamera | Wajib |
| F06 | Pengaturan interval auto-analyze (3s / 5s / manual) | Opsional |
| F07 | Riwayat analisis (log sederhana di halaman) | Opsional |

---

## 4. Arsitektur

```
browser
  └── index.html
        ├── camera.js       → akses MediaDevices, stream video
        ├── detector.js     → face-api.js: deteksi wajah, gambar canvas overlay
        ├── analyzer.js     → capture canvas → base64 → POST ke Claude API
        └── ui.js           → update DOM: hasil analisis, log, toggle
```

### Alur Data

```
[Webcam] → [<video>] → [face-api.js] → [Canvas Overlay: bounding box]
                                               ↓
                              [Capture frame → base64 image]
                                               ↓
                              [POST /v1/messages → Claude API]
                                               ↓
                              [Tampilkan deskripsi di #result-panel]
```

---

## 5. Struktur File

```
face-detector/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── camera.js
│   ├── detector.js
│   ├── analyzer.js
│   └── ui.js
├── models/
│   └── (face-api.js model weights — diunduh dari CDN atau lokal)
└── prd.md
```

---

## 6. Spesifikasi Teknis

### 6.1 Face Detection
- Library: `face-api.js` via CDN
- Model: `SsdMobilenetv1` (akurasi baik, ringan)
- Deteksi: `detectAllFaces().withFaceLandmarks()`
- Canvas overlay di atas `<video>` untuk menggambar bounding box

### 6.2 Claude API Integration

```
Endpoint : POST https://api.anthropic.com/v1/messages
Model    : claude-sonnet-4-6
Header   : x-api-key, anthropic-version: 2023-06-01, content-type: application/json
Payload  :
  {
    "model": "claude-sonnet-4-6",
    "max_tokens": 300,
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "image",
            "source": {
              "type": "base64",
              "media_type": "image/jpeg",
              "data": "<base64_frame>"
            }
          },
          {
            "type": "text",
            "text": "Analisis wajah dalam gambar ini. Sebutkan: jumlah wajah terdeteksi, estimasi ekspresi/emosi, dan deskripsi singkat. Jawab dalam Bahasa Indonesia, maksimal 3 kalimat."
          }
        ]
      }
    ]
  }
```

### 6.3 API Key
- Disimpan di `localStorage` lewat input field di UI (tidak di-hardcode)
- Tampilkan peringatan jika API key belum diisi

---

## 7. UI Layout

```
┌──────────────────────────────────────────────────────────┐
│  🎯 FaceDetect AI                          [⚙ API Key]   │
├───────────────────────────┬──────────────────────────────┤
│                           │  📋 Hasil Analisis AI        │
│   [VIDEO + CANVAS]        │  ──────────────────────────  │
│   (kamera realtime)       │  Terdeteksi: 2 wajah         │
│                           │  Ekspresi: Netral, Senyum    │
│                           │  ...                         │
│                           │  ──────────────────────────  │
│  [▶ Mulai] [⏹ Stop]       │  ⏱ Auto: [3s][5s][Manual]   │
│  [📸 Analisis Sekarang]   │                              │
│                           │  📜 Riwayat                  │
│                           │  - 14:32 — 1 wajah, senang  │
│                           │  - 14:31 — 2 wajah, netral  │
└───────────────────────────┴──────────────────────────────┘
```

---

## 8. Desain Visual

- **Tema:** Dark UI — background `#0f0f14`, panel `#1a1a24`
- **Aksen:** Cyan `#00e5ff` untuk elemen aktif & highlight bounding box
- **Font:** `JetBrains Mono` (monospace, sesuai nuansa teknologi/surveillance)
- **Bounding Box Warna:** Cyan saat wajah terdeteksi, merah saat tidak ada wajah
- **Signature Element:** Bounding box animasi pulse di atas overlay video

---

## 9. OpenCode Prompts

Jalankan prompt berikut **satu per satu** di OpenCode secara berurutan.

---

### PROMPT 1 — Inisialisasi Proyek

```
Buat struktur folder proyek web sederhana bernama "face-detector" dengan file-file berikut (isi file boleh kosong dulu):

face-detector/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── camera.js
    ├── detector.js
    ├── analyzer.js
    └── ui.js

Buat file index.html dengan struktur HTML5 dasar yang:
1. Load face-api.js dari CDN: https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js
2. Load css/style.css
3. Load keempat file JS di atas (di akhir body, urutan: ui.js, camera.js, detector.js, analyzer.js)
4. Struktur body:
   - Header: judul "🎯 FaceDetect AI" + tombol ikon gear (#btn-api-key)
   - Main dua kolom: kolom kiri (#video-container berisi <video id="video"> dan <canvas id="overlay">), kolom kanan (#result-panel)
   - Di bawah video: tombol #btn-start, #btn-stop, #btn-analyze
   - Di result-panel: div #ai-result, radio/tombol interval (3s/5s/manual), div #history-log
   - Modal #modal-apikey dengan input #input-apikey dan tombol simpan
```

---

### PROMPT 2 — CSS Dark UI

```
Isi file css/style.css dengan styling lengkap untuk aplikasi deteksi wajah berikut ketentuan desain:

Palet warna:
- Background utama: #0f0f14
- Panel/card: #1a1a24
- Border: #2a2a3a
- Aksen utama: #00e5ff (cyan)
- Aksen sekunder: #7c3aed (ungu)
- Teks utama: #e2e8f0
- Teks muted: #64748b

Typography: Google Font "JetBrains Mono" (import dari Google Fonts)

Layout:
- Full viewport, flex column
- Main: dua kolom flex (video 60%, panel 40%) dengan gap
- Di mobile (<768px): satu kolom

Komponen yang harus distyle:
- Header dengan border bawah cyan tipis
- #video-container: posisi relative, border cyan, rounded; <video> dan <canvas> saling overlap (canvas: position absolute, top 0, left 0)
- Tombol: style pill dengan border cyan, background transparan, hover glow effect
- #result-panel: background panel, rounded, padding, overflow-y auto
- #ai-result: area teks dengan border kiri cyan, background sedikit lebih terang
- #history-log: daftar entry kecil dengan timestamp
- Modal overlay dengan backdrop blur
- Animasi: @keyframes pulse-border untuk bounding box aktif (opsional di CSS, akan dipakai JS)
- Scrollbar custom (tipis, warna aksen)
```

---

### PROMPT 3 — Camera.js

```
Isi file js/camera.js dengan kode JavaScript (vanilla, no import/export) untuk mengelola kamera:

1. Variabel global: let stream = null, let isRunning = false
2. Fungsi startCamera():
   - Minta akses kamera: navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
   - Set video.srcObject = stream
   - Tunggu event 'loadedmetadata', lalu video.play()
   - Set isRunning = true
   - Sesuaikan ukuran canvas overlay dengan video (canvas.width = video.videoWidth, canvas.height = video.videoHeight)
   - Panggil onCameraReady() jika fungsi tersebut ada
   - Handle error: tampilkan alert dengan pesan ramah
3. Fungsi stopCamera():
   - Hentikan semua track stream
   - Clear video.srcObject
   - Set isRunning = false
   - Bersihkan canvas overlay
4. Event listener untuk btn-start dan btn-stop yang memanggil fungsi di atas
5. Semua elemen diambil dengan getElementById setelah DOMContentLoaded
```

---

### PROMPT 4 — Detector.js (face-api.js)

```
Isi file js/detector.js dengan kode JavaScript untuk deteksi wajah realtime menggunakan face-api.js:

1. Fungsi async loadModels():
   - Load model dari CDN: faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
   - Load juga: faceapi.nets.faceLandmark68Net.loadFromUri(...url sama...)
   - Tampilkan status loading di #ai-result
   - Setelah selesai: tampilkan "Model siap. Klik Mulai untuk membuka kamera."

2. Variable: let detectionInterval = null, let faceCount = 0

3. Fungsi startDetection():
   - Jalankan setInterval setiap 200ms
   - Dalam interval: deteksi dengan faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks()
   - Gambar hasil di canvas overlay: faceapi.draw.drawDetections(canvas, detections) dan faceapi.draw.drawFaceLandmarks(canvas, detections)
   - Update faceCount = detections.length
   - Update elemen #face-count dengan jumlah wajah
   - Ubah warna border #video-container: cyan jika ada wajah, merah jika tidak ada

4. Fungsi stopDetection(): clearInterval, bersihkan canvas

5. Fungsi onCameraReady() (dipanggil dari camera.js setelah kamera siap):
   - Panggil startDetection()

6. Panggil loadModels() saat DOMContentLoaded
```

---

### PROMPT 5 — Analyzer.js (Claude API)

```
Isi file js/analyzer.js dengan kode JavaScript untuk integrasi Claude API:

1. Fungsi getApiKey(): ambil dari localStorage key 'claude_api_key'

2. Fungsi captureFrame():
   - Buat offscreen canvas berukuran video.videoWidth x video.videoHeight
   - drawImage(video) ke canvas tersebut
   - Return canvas.toDataURL('image/jpeg', 0.8), lalu ambil bagian base64 saja (split(',')[1])

3. Fungsi async analyzeWithClaude():
   - Cek: jika !isRunning, return (kamera belum aktif)
   - Cek: jika !getApiKey(), tampilkan pesan di #ai-result "⚠️ Masukkan API Key terlebih dahulu"
   - Tampilkan loading: #ai-result innerHTML = "⏳ Menganalisis..."
   - Capture frame, panggil Claude API:
     POST https://api.anthropic.com/v1/messages
     Header: { 'Content-Type': 'application/json', 'x-api-key': getApiKey(), 'anthropic-version': '2023-06-01' }
     Body: model "claude-sonnet-4-6", max_tokens 300
     Message: content berupa array dua item — image (base64 jpeg) dan text:
     "Kamu adalah asisten analisis wajah. Lihat gambar ini dan jelaskan: (1) berapa wajah yang terdeteksi, (2) ekspresi atau emosi yang terlihat, (3) deskripsi singkat kondisi pencahayaan atau posisi wajah. Jawab dalam Bahasa Indonesia, singkat dan informatif, maksimal 4 kalimat."
   - Ambil response: data.content[0].text
   - Tampilkan di #ai-result
   - Tambahkan ke riwayat: addToHistory(resultText)
   - Handle error dengan pesan di #ai-result

4. Fungsi addToHistory(text):
   - Buat entry: timestamp + 40 karakter pertama teks + "..."
   - Prepend ke #history-log (maksimal 10 entry)

5. Auto-analyze: variable let autoInterval = null
   - Fungsi startAutoAnalyze(seconds): setInterval memanggil analyzeWithClaude()
   - Fungsi stopAutoAnalyze(): clearInterval
   - Event listener untuk radio/tombol interval: 3s, 5s, Manual

6. Event listener #btn-analyze: panggil analyzeWithClaude()

7. Event listener untuk modal API key:
   - #btn-api-key membuka #modal-apikey
   - Tombol simpan di modal: localStorage.setItem('claude_api_key', input value), tutup modal
   - Pre-fill input dengan nilai yang sudah tersimpan jika ada
```

---

### PROMPT 6 — Polish & Testing

```
Review semua file yang sudah dibuat (index.html, style.css, camera.js, detector.js, analyzer.js) dan lakukan perbaikan berikut:

1. Pastikan canvas overlay benar-benar overlay di atas video (absolute positioning, pointer-events: none)
2. Pastikan ukuran canvas selalu sinkron dengan video saat kamera aktif — tambahkan resize observer jika perlu
3. Tambahkan elemen <div id="face-count">Wajah: 0</div> di atas atau bawah video jika belum ada
4. Pastikan tombol Start/Stop/Analyze berubah disabled/enabled sesuai state (isRunning)
5. Pastikan modal bisa ditutup dengan klik di luar area modal
6. Tambahkan pesan error yang jelas jika:
   - Browser tidak mendukung getUserMedia
   - Model face-api.js gagal diload (coba fallback URL atau tampilkan instruksi manual)
7. Test mental flow: buka halaman → model load → klik Mulai → kamera aktif → wajah terdeteksi → klik Analisis → hasil muncul
8. Pastikan tidak ada console error saat halaman pertama dibuka
9. Tulis file README.md singkat berisi: cara menjalankan (npx serve . atau buka via XAMPP), cara memasukkan API key
```

---

## 10. Cara Menjalankan

```bash
# Opsi 1 — via npx serve
cd face-detector
npx serve .

# Opsi 2 — via XAMPP
# Letakkan folder face-detector/ di C:/xampp/htdocs/
# Akses: http://localhost/face-detector/
```

> ⚠️ Kamera hanya bisa diakses di **HTTPS** atau **localhost**. Gunakan salah satu opsi di atas.

---

## 11. Dependensi Eksternal

| Library | Versi | Sumber |
|---------|-------|--------|
| face-api.js | 0.22.2 | CDN jsDelivr |
| Model Weights | — | raw.githubusercontent.com/justadudewhohacks/face-api.js |
| JetBrains Mono | — | Google Fonts |
| Claude API | claude-sonnet-4-6 | api.anthropic.com |

---

## 12. Batasan

- API Key disimpan di `localStorage` — **jangan dipakai di production publik**
- Analisis Claude API membutuhkan koneksi internet & biaya token
- Performa deteksi bergantung pada spesifikasi perangkat
- Model face-api.js diload dari GitHub CDN — butuh koneksi internet pertama kali

---

*PRD ini sekaligus berisi semua prompt OpenCode siap pakai. Jalankan Prompt 1–6 secara berurutan.*

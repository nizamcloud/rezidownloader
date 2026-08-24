# 🔧 FIX LENGKAP - rezidownloader Repository

**Sudah pusing?** Ikuti guide ini step-by-step. Tidak akan pusing lagi! 💪

---

## 📋 STRUKTUR FOLDER FINAL - COPY PERSIS

```
rezidownloader/
│
├── api/                                    ← FOLDER API (buat ini!)
│   ├── media-info.js                      ← FILE 1
│   ├── download.js                        ← FILE 2
│   └── download-status/
│       └── [id].js                        ← FILE 3 (folder dengan [] bracket!)
│
├── public/                                 ← FOLDER PUBLIC
│   ├── index.html                         ← HTML Anda (udah ada?)
│   ├── style.css                          ← CSS Anda (udah ada?)
│   └── fastsaver_vercel.js                ← FILE FRONTEND (ganti nama!)
│
├── .gitignore                              ← File git ignore
├── package.json                            ← File dependencies
├── vercel.json                             ← File vercel config
├── README.md                               ← Dokumentasi
└── .env.local                              ← Local only (jangan commit!)
```

---

## 🎯 STEP 1: CLONE & SETUP LOKAL

```bash
# Clone repo Anda
git clone https://github.com/nizamcloud/rezidownloader.git
cd rezidownloader

# Pastikan ada folder public & buat folder api
mkdir -p api/download-status
mkdir -p public
```

---

## 📝 STEP 2: BUAT FILE `api/media-info.js`

**Lokasi:** `api/media-info.js`

```javascript
/**
 * Vercel Serverless Function: GET /api/media-info
 * File: api/media-info.js
 */
const axios = require('axios');

const API_KEY = process.env.FASTSAVER_API_KEY;
const FASTSAVER_BASE = 'https://api.fastsaver.io';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter diperlukan'
            });
        }

        if (!API_KEY) {
            console.error('❌ FASTSAVER_API_KEY tidak dikonfigurasi');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
        }

        console.log('📥 [media-info] Fetching:', url.substring(0, 50) + '...');

        const response = await axios.get(`${FASTSAVER_BASE}/v2/media/info`, {
            params: { url },
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ [media-info] Success');
        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('❌ [media-info] Error:', error.message);
        
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Server Error';
        
        return res.status(status).json({
            success: false,
            error: message
        });
    }
};
```

---

## 📝 STEP 3: BUAT FILE `api/download.js`

**Lokasi:** `api/download.js`

```javascript
/**
 * Vercel Serverless Function: POST /api/download
 * File: api/download.js
 */
const axios = require('axios');

const API_KEY = process.env.FASTSAVER_API_KEY;
const FASTSAVER_BASE = 'https://api.fastsaver.io';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url, format, quality } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL diperlukan'
            });
        }

        if (!format || !['mp4', 'mp3'].includes(format)) {
            return res.status(400).json({
                success: false,
                error: 'Format harus mp4 atau mp3'
            });
        }

        if (!quality) {
            return res.status(400).json({
                success: false,
                error: 'Quality diperlukan'
            });
        }

        if (!API_KEY) {
            console.error('❌ FASTSAVER_API_KEY tidak dikonfigurasi');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
        }

        console.log('📥 [download] Request:', { 
            url: url.substring(0, 40) + '...', 
            format, 
            quality 
        });

        const response = await axios.post(
            `${FASTSAVER_BASE}/v2/downloads`,
            { url, format, quality },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('✅ [download] Success, Job ID:', response.data.id);
        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('❌ [download] Error:', error.message);
        
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Server Error';
        
        return res.status(status).json({
            success: false,
            error: message
        });
    }
};
```

---

## 📝 STEP 4: BUAT FILE `api/download-status/[id].js`

**Lokasi:** `api/download-status/[id].js`

⚠️ **PENTING:** Nama folder `[id]` dengan bracket kotak!

```javascript
/**
 * Vercel Serverless Function: GET /api/download-status/[id]
 * File: api/download-status/[id].js
 */
const axios = require('axios');

const API_KEY = process.env.FASTSAVER_API_KEY;
const FASTSAVER_BASE = 'https://api.fastsaver.io';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Download ID diperlukan'
            });
        }

        if (!API_KEY) {
            console.error('❌ FASTSAVER_API_KEY tidak dikonfigurasi');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
        }

        console.log('📥 [status] Checking ID:', id);

        const response = await axios.get(
            `${FASTSAVER_BASE}/v2/downloads/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ [status] Status:', response.data.status);
        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('❌ [status] Error:', error.message);
        
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Server Error';
        
        return res.status(status).json({
            success: false,
            error: message
        });
    }
};
```

---

## 📝 STEP 5: BUAT FILE `package.json`

**Lokasi:** `package.json` (di root folder)

```json
{
  "name": "rezi-downloader",
  "version": "1.0.0",
  "description": "FastSaver Video/Audio Downloader with Vercel Serverless",
  "scripts": {
    "build": "echo 'Build complete'",
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vercel": "^28.0.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 📝 STEP 6: BUAT FILE `vercel.json`

**Lokasi:** `vercel.json` (di root folder)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

---

## 📝 STEP 7: UPDATE FRONTEND - GANTI `public/script.js`

**Lokasi:** `public/fastsaver_vercel.js` (atau ganti nama dari script.js Anda)

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 🎯 KONFIGURASI UNTUK VERCEL
    // ==========================================
    const VERCEL_DOMAIN = 'https://rezidownloader.vercel.app'; // ← GANTI DOMAIN!
    const BASE_URL = VERCEL_DOMAIN + '/api';
    
    const urlInput = document.getElementById('urlInput');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const form = document.getElementById('downloadForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
   
    const previewCard = document.getElementById('previewCard');
    const previewThumb = document.getElementById('previewThumb');
    const previewTitle = document.getElementById('previewTitle');
    const previewAuthor = document.getElementById('previewAuthor');
    const previewDuration = document.getElementById('previewDuration');
    const formatCards = document.querySelectorAll('.format-card');
    const qualityGrid = document.getElementById('qualityGrid');
    const qualityLabel = document.getElementById('qualityLabel');
    const statusBox = document.getElementById('statusBox');
    const statusText = document.getElementById('statusText');
    const tagYT = document.getElementById('tagYT');
    const tagTT = document.getElementById('tagTT');
    const tagIG = document.getElementById('tagIG');
    
    const videoQualities = [
        { name: '8K', badge: '4320p Ultra', value: '4320' },
        { name: '4K', badge: '2160p UHD', value: '2160' },
        { name: '2K', badge: '1440p QHD', value: '1440' },
        { name: '1080p', badge: 'Full HD', value: '1080' },
        { name: '720p', badge: 'HD Quality', value: '720' },
        { name: '480p', badge: 'SD Quality', value: '480' }
    ];
    
    const audioQualities = [
        { name: '320 kbps', badge: 'Studio HD', value: '320' },
        { name: '256 kbps', badge: 'Standar HQ', value: '256' },
        { name: '192 kbps', badge: 'Medium', value: '192' },
        { name: '128 kbps', badge: 'Standar', value: '128' }
    ];
    
    let currentFormat = 'mp4';
    let currentQuality = '1080';
    let fetchTimeout = null;
    
    function parseErrorMessage(data, status) {
        if (!data) return `Error ${status}: Gagal memproses perintah.`;
        if (typeof data === 'string') return data;
        let errStr = data.message || data.error || data.detail || data.msg;
        if (typeof errStr === 'object' && errStr !== null) {
            errStr = errStr.message || errStr.error || JSON.stringify(errStr);
        }
        if (!errStr) {
            errStr = `Error ${status}: Respon server tidak valid.`;
        }
        return String(errStr);
    }
    
    async function safeFetchJson(url, options = {}) {
        let res;
        try {
            res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });
        } catch (netErr) {
            throw new Error(`Gagal terhubung ke server. Periksa koneksi internet Anda.`);
        }
        
        const text = await res.text();
        let data = null;
        
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error(`Server error (Status ${res.status}): ${text.substring(0, 100)}`);
        }
        
        if (!res.ok) {
            throw new Error(parseErrorMessage(data, res.status));
        }
        
        return data;
    }
    
    function renderQualityGrid() {
        qualityGrid.innerHTML = '';
        const isVideo = currentFormat === 'mp4';
        const items = isVideo ? videoQualities : audioQualities;
        qualityLabel.textContent = isVideo ? 'PILIH RESOLUSI VIDEO' : 'PILIH BITRATE AUDIO';
        
        if (!isVideo && currentQuality === '1080') currentQuality = '256';
        
        items.forEach(item => {
            const pill = document.createElement('div');
            pill.className = `quality-pill ${item.value === currentQuality ? 'active' : ''}`;
            pill.innerHTML = `
                <span class="res-name">${item.name}</span>
                <span class="res-badge">${item.badge}</span>
            `;
            pill.addEventListener('click', () => {
                document.querySelectorAll('.quality-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentQuality = item.value;
            });
            qualityGrid.appendChild(pill);
        });
    }
    
    formatCards.forEach(card => {
        card.addEventListener('click', () => {
            formatCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFormat = card.dataset.format;
            currentQuality = currentFormat === 'mp4' ? '1080' : '256';
            renderQualityGrid();
        });
    });
    
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        clearBtn.classList.toggle('hidden', !url);
        tagYT.classList.toggle('active', url.includes('youtube.com') || url.includes('youtu.be'));
        tagTT.classList.toggle('active', url.includes('tiktok.com'));
        tagIG.classList.toggle('active', url.includes('instagram.com'));
        clearTimeout(fetchTimeout);
        if (url.startsWith('http')) {
            fetchTimeout = setTimeout(() => fetchMediaInfo(url), 600);
        } else {
            previewCard.classList.add('hidden');
        }
    });
    
    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        clearBtn.classList.add('hidden');
        previewCard.classList.add('hidden');
        urlInput.dispatchEvent(new Event('input'));
    });
    
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text;
                urlInput.dispatchEvent(new Event('input'));
            }
        } catch (e) {
            alert('Izinkan akses clipboard pada browser Anda.');
        }
    });
    
    async function fetchMediaInfo(url) {
        try {
            previewCard.classList.remove('hidden');
            previewTitle.textContent = 'Menganalisis link...';
            previewAuthor.textContent = 'Menghubungkan ke server...';
            previewThumb.src = '';
            
            const data = await safeFetchJson(`${BASE_URL}/media-info?url=${encodeURIComponent(url)}`);
            
            if (data.success && data.data) {
                previewTitle.textContent = data.data.title || 'Media Siap Diunduh';
                previewAuthor.textContent = data.data.author || data.data.uploader || 'FastSaver';
                previewThumb.src = data.data.thumbnail || 'https://via.placeholder.com/150';
                previewDuration.textContent = data.data.duration || 'MEDIA';
            } else {
                throw new Error('Data media tidak lengkap');
            }
        } catch (e) {
            console.warn('Preview fetch failed:', e.message);
            previewTitle.textContent = 'Link Tervalidasi';
            previewAuthor.textContent = 'Klik tombol di bawah untuk memproses';
            previewThumb.src = 'https://via.placeholder.com/150?text=READY';
            previewDuration.textContent = 'MEDIA';
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!urlInput.value.trim()) {
            alert('Masukkan URL terlebih dahulu!');
            return;
        }
        
        submitBtn.disabled = true;
        btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        statusBox.classList.remove('hidden');
        statusText.innerHTML = '<i class="fa-solid fa-gear fa-spin"></i> Mengirim perintah ke server...';
        
        try {
            const data = await safeFetchJson(`${BASE_URL}/download`, {
                method: 'POST',
                body: JSON.stringify({
                    url: urlInput.value.trim(),
                    format: currentFormat,
                    quality: currentQuality
                })
            });
            
            if (!data.success) {
                throw new Error(data.error || 'Respon server tidak valid');
            }
            
            const downloadUrl = data.data?.downloadUrl || data.data?.url || data.data?.file_url;
            
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--vibrant-green)"></i> Unduhan berhasil dimulai!';
            } else if (data.data?.id || data.data?.job_id) {
                statusText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses file di server...';
                checkJobStatus(data.data?.id || data.data?.job_id);
            } else {
                throw new Error('Server tidak mengembalikan link unduhan');
            }
        } catch (err) {
            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vibrant-pink)"></i> ${err.message}`;
        } finally {
            submitBtn.disabled = false;
            btnText.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Unduh Sekarang';
        }
    });
    
    async function checkJobStatus(jobId) {
        try {
            const data = await safeFetchJson(`${BASE_URL}/download-status?id=${jobId}`);
            
            if (!data.success) {
                throw new Error(data.error || 'Gagal cek status');
            }
            
            const status = data.data?.status;
            
            if (status === 'completed' || status === 'finished' || status === 'success') {
                const link = data.data?.downloadUrl || data.data?.url || data.data?.file_url;
                if (link) window.open(link, '_blank');
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--vibrant-green)"></i> Unduhan Selesai!';
            } else if (status === 'failed' || status === 'error') {
                throw new Error(data.data?.error || data.data?.message || 'Server gagal memproses file');
            } else {
                statusText.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses (${status || 'processing'})...`;
                setTimeout(() => checkJobStatus(jobId), 2000);
            }
        } catch (err) {
            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vibrant-pink)"></i> ${err.message}`;
        }
    }
    
    renderQualityGrid();
});
```

---

## 📝 STEP 8: BUAT `.gitignore`

**Lokasi:** `.gitignore`

```
node_modules/
.env
.env.local
.DS_Store
.vercel
dist/
build/
```

---

## 🚀 STEP 9: COMMIT & PUSH KE GITHUB

```bash
# Di terminal, di folder rezidownloader

# 1. Add semua file
git add .

# 2. Commit dengan pesan yang jelas
git commit -m "Setup Vercel serverless functions for FastSaver API"

# 3. Push ke GitHub
git push origin main
```

---

## 🔐 STEP 10: SET ENVIRONMENT VARIABLE DI VERCEL

1. **Buka:** https://vercel.com/dashboard
2. **Pilih project:** rezidownloader
3. **Settings** → **Environment Variables**
4. **Add New:**
   - **Name:** `FASTSAVER_API_KEY`
   - **Value:** `fs_sk_4g5f1c9v5l1d2t0v2m7y8a5x4f5f` (Ganti dengan key Anda!)
   - **Environments:** Pilih "Production"
5. **Save**

---

## ✅ STEP 11: UPDATE DOMAIN DI HTML

Di `public/index.html`, pastikan ada line:

```html
<script src="fastsaver_vercel.js"></script>
```

Jika nama file berbeda, sesuaikan nama scriptnya!

---

## 🧪 STEP 12: TEST

### Test 1: Check API
```
https://rezidownloader.vercel.app/api/media-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Harus return JSON dengan `success: true`

### Test 2: Buka Website
```
https://rezidownloader.vercel.app
```

1. Paste URL YouTube/TikTok
2. Klik "Unduh Sekarang"
3. Harusnya jalan! ✅

---

## ✅ FINAL CHECKLIST

- [ ] 7 file sudah dibuat (3 api + frontend + 3 config)
- [ ] Struktur folder sama persis dengan di guide
- [ ] Git push sudah dilakukan
- [ ] `FASTSAVER_API_KEY` sudah di-set di Vercel
- [ ] Vercel redeploy selesai (tunggu 1-2 min)
- [ ] Domain di frontend sudah update
- [ ] Test API berhasil
- [ ] Website bisa diakses ✅

---

## 🎉 SELESAI!

Tidak perlu pusing lagi. Semua sudah fixed! 💪

Kalau ada error, check logs di Vercel Dashboard → Deployments → Logs


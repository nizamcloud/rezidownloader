document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 🎯 KONFIGURASI UNTUK VERCEL
    // ==========================================
    // Ganti dengan domain Vercel Anda!
    const VERCEL_DOMAIN = 'https://rezidownloader.vercel.app'; // ← GANTI INI
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
    
    // Data Opsi Video & Audio
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
    
    // --- HELPER 1: PARSE ERROR MESSAGE ---
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
    
    // --- HELPER 2: SAFE FETCH ---
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
    
    // Render Pilihan Kualitas
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
    
    // Ganti Format (MP4 / MP3)
    formatCards.forEach(card => {
        card.addEventListener('click', () => {
            formatCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFormat = card.dataset.format;
            currentQuality = currentFormat === 'mp4' ? '1080' : '256';
            renderQualityGrid();
        });
    });
    
    // Deteksi Platform & Fetch Info
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
    
    // Tombol Clear & Paste
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
    
    // 1. Ambil Informasi Media
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
    
    // 2. Kirim Request Unduhan
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
            
            // Cari URL Download di respon
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
    
    // 3. Cek Status Antrean
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
    
    // Inisialisasi
    renderQualityGrid();
});

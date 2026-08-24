document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 🔑 MASUKKAN API KEY FASTSAVER KAMU DI SINI
    // ==========================================
    const API_KEY = 'fs_sk_4g5f1c9v5l1d2t0v2m7y8a5x4f5f'; 
    const BASE_URL = 'https://api.fastsaver.io';

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

    // 1. Ambil Informasi Media dari FastSaver API (/v2/media/info)
    async function fetchMediaInfo(url) {
        try {
            previewCard.classList.remove('hidden');
            previewTitle.textContent = 'Menganalisis link...';
            previewAuthor.textContent = 'Menghubungkan ke FastSaver...';
            previewThumb.src = '';

            const res = await fetch(`${BASE_URL}/v2/media/info?url=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Accept': 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok && (data.title || data.filename)) {
                previewTitle.textContent = data.title || 'Media Siap Diunduh';
                previewAuthor.textContent = data.author || data.uploader || 'FastSaver Engine';
                previewThumb.src = data.thumbnail || 'https://via.placeholder.com/150';
                previewDuration.textContent = data.duration || 'MEDIA';
            } else {
                throw new Error();
            }
        } catch (e) {
            // Tampilan fallback jika info detail media gagal diambil
            previewTitle.textContent = 'Link Tervalidasi';
            previewAuthor.textContent = 'Klik tombol di bawah untuk memproses';
            previewThumb.src = 'https://via.placeholder.com/150?text=READY';
            previewDuration.textContent = 'MEDIA';
        }
    }

    // 2. Kirim Request Unduhan ke FastSaver API (/v2/downloads)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        statusBox.classList.remove('hidden');
        statusText.innerHTML = '<i class="fa-solid fa-gear fa-spin"></i> Mengirim perintah ke FastSaver API...';

        try {
            const res = await fetch(`${BASE_URL}/v2/downloads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    url: urlInput.value.trim(),
                    format: currentFormat,
                    quality: currentQuality
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.error || 'Gagal terhubung ke API FastSaver.');
            }

            // Jika API langsung memberikan URL file
            const downloadUrl = data.downloadUrl || data.url || (data.filename ? `${BASE_URL}/v2/files/${data.filename}` : null);

            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--vibrant-green)"></i> Unduhan berhasil dimulai!';
            } else if (data.id) {
                // Jika API membutuhkan waktu antrean (Job ID)
                statusText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses file di server...';
                checkJobStatus(data.id);
            } else {
                throw new Error('Respon server tidak memiliki tautan unduhan.');
            }
        } catch (err) {
            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vibrant-pink)"></i> ${err.message}`;
        } finally {
            submitBtn.disabled = false;
            btnText.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Unduh Sekarang';
        }
    });

    // 3. Fungsi Tambahan Cek Status Antrean (/v2/downloads/:id)
    async function checkJobStatus(jobId) {
        try {
            const res = await fetch(`${BASE_URL}/v2/downloads/${jobId}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            const data = await res.json();

            if (data.status === 'completed' || data.status === 'finished') {
                const link = data.downloadUrl || data.url || `${BASE_URL}/v2/files/${data.filename}`;
                window.open(link, '_blank');
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--vibrant-green)"></i> Unduhan Selesai!';
            } else if (data.status === 'failed') {
                throw new Error(data.error || 'Server gagal memproses file ini.');
            } else {
                // Cek ulang secara berulang setiap 2 detik sampai file selesai diproses
                setTimeout(() => checkJobStatus(jobId), 2000);
            }
        } catch (err) {
            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vibrant-pink)"></i> ${err.message}`;
        }
    }

    // Inisialisasi awal tampilan
    renderQualityGrid();
});

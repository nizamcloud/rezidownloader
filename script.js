document.addEventListener('DOMContentLoaded', () => {
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
    let currentQuality = '4320';
    let fetchTimeout = null;

    // Render Pilihan Kualitas
    function renderQualityGrid() {
        qualityGrid.innerHTML = '';
        const isVideo = currentFormat === 'mp4';
        const items = isVideo ? videoQualities : audioQualities;
        qualityLabel.textContent = isVideo ? 'PILIH RESOLUSI VIDEO' : 'PILIH BITRATE AUDIO';

        if (!isVideo && currentQuality === '4320') currentQuality = '256';

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
            currentQuality = currentFormat === 'mp4' ? '4320' : '256';
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

    // --- BAGIAN KODE BARU DIMULAI DI SINI ---

    // 1. Fungsi Fetch Media Info (Preview Sederhana)
    async function fetchMediaInfo(url) {
        previewCard.classList.remove('hidden');
        previewTitle.textContent = 'Link Siap Diunduh';
        previewAuthor.textContent = 'Klik tombol di bawah untuk memproses';
        previewThumb.src = 'https://via.placeholder.com/150?text=READY';
        previewDuration.textContent = 'MEDIA';
    }

    // 2. Handler Submit Form (Menggunakan Cobalt API Tanpa Server Backend)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        statusBox.classList.remove('hidden');
        statusText.innerHTML = '<i class="fa-solid fa-gear fa-spin"></i> Menghubungkan ke API...';

        try {
            const res = await fetch('https://api.cobalt.tools/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer PASTE_API_KEY_ANDA_DI_SINI'
                },
                body: JSON.stringify({
                    url: urlInput.value.trim(),
                    videoQuality: currentQuality,
                    downloadMode: currentFormat === 'mp3' ? 'audio' : 'auto'
                })
            });

            const data = await res.json();

            if (data.url) {
                window.open(data.url, '_blank');
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--vibrant-green)"></i> Unduhan dimulai!';
            } else {
                throw new Error(data.text || 'Gagal memproses file dari URL tersebut.');
            }
        } catch (err) {
            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--vibrant-pink)"></i> ${err.message}`;
        } finally {
            submitBtn.disabled = false;
            btnText.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Unduh Sekarang';
        }
    });

    // --- BAGIAN KODE BARU SELESAI ---

    // Inisialisasi awal
    renderQualityGrid();
});

/**
 * FastSaver Backend Proxy - Simple Node.js Server
 * 
 * Installation:
 * npm init -y
 * npm install express cors axios dotenv
 * 
 * Setup .env file:
 * FASTSAVER_API_KEY=fs_sk_4g5f1c9v5l1d2t0v2m7y8a5x4f5f
 * PORT=3000
 * 
 * Run:
 * node backend_example.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FASTSAVER_API_KEY;
const FASTSAVER_BASE = 'https://api.fastsaver.io';

// Middleware
app.use(cors());
app.use(express.json());

// Error handler utility
const handleError = (error, res) => {
    console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
    });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Internal Server Error';
    
    res.status(status).json({
        success: false,
        error: message,
        status: status
    });
};

// ============================================================
// 1️⃣ GET /api/media/info - Ambil informasi media dari URL
// ============================================================
app.get('/api/media/info', async (req, res) => {
    try {
        if (!req.query.url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter diperlukan'
            });
        }

        console.log('📥 Fetching media info untuk URL:', req.query.url);

        const response = await axios.get(`${FASTSAVER_BASE}/v2/media/info`, {
            params: { url: req.query.url },
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        console.log('✅ Media info retrieved:', response.data);
        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        handleError(error, res);
    }
});

// ============================================================
// 2️⃣ POST /api/download - Request unduhan media
// ============================================================
app.post('/api/download', async (req, res) => {
    try {
        const { url, format, quality } = req.body;

        // Validasi input
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

        console.log('📥 Download request:', { url: url.substring(0, 50) + '...', format, quality });

        const response = await axios.post(
            `${FASTSAVER_BASE}/v2/downloads`,
            { url, format, quality },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000 // 15 second timeout
            }
        );

        console.log('✅ Download request accepted:', response.data);
        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        handleError(error, res);
    }
});

// ============================================================
// 3️⃣ GET /api/download/status/:id - Cek status unduhan
// ============================================================
app.get('/api/download/status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Download ID diperlukan'
            });
        }

        console.log('📥 Checking status for job ID:', id);

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

        console.log('✅ Status retrieved:', response.data);
        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        handleError(error, res);
    }
});

// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        server: 'FastSaver Backend Proxy',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!API_KEY
    });
});

// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    if (!API_KEY) {
        console.error('❌ FASTSAVER_API_KEY tidak ditemukan di .env file');
        console.error('   Buat file .env dengan: FASTSAVER_API_KEY=your_key_here');
        process.exit(1);
    }

    console.log(`
╔═══════════════════════════════════════════╗
║   🚀 FastSaver Backend Proxy Running     ║
╠═══════════════════════════════════════════╣
║ Server: http://localhost:${PORT}           ║
║ Health: http://localhost:${PORT}/health    ║
╠═══════════════════════════════════════════╣
║ Endpoints:                                ║
║   GET  /api/media/info?url=...           ║
║   POST /api/download                     ║
║   GET  /api/download/status/:id          ║
╚═══════════════════════════════════════════╝
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

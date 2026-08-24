/**
 * Vercel Serverless Function: GET /api/media-info
 * File: api/media-info.js
 * 
 * Fungsi: Ambil informasi media dari URL
 */

const axios = require('axios');

const API_KEY = process.env.FASTSAVER_API_KEY;
const FASTSAVER_BASE = 'https://api.fastsaver.io';

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
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
            console.error('❌ FASTSAVER_API_KEY tidak dikonfigurasi di Vercel');
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

import express from 'express';
import db from "../src/config/db.js";

const router = express.Router();

// Generate new QR
router.post('/generate', (req, res) => {
  const { sessionType, location } = req.body;

  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 min expiry

  const generatedAt = now.toISOString().slice(0, 19).replace('T', ' ');
  const expiresAt = expires.toISOString().slice(0, 19).replace('T', ' ');

  const code = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(sessionType);

  const sql = `
    INSERT INTO qr_codes_admin
    (session_type, code, generated_at, expires_at, latitude, longitude, radius, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const latitude = location?.latitude || null;
  const longitude = location?.longitude || null;
  const radius = location?.radius || null;

  db.query(sql, [sessionType, code, generatedAt, expiresAt, latitude, longitude, radius], (err, result) => {
    if (err) {
      console.error("DB INSERT ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: result.insertId,
      code,
      sessionType,
      generatedAt,
      expiresAt,
      location: location || null,
    });
  });
});

// Get active QR
router.get('/active', (req, res) => {
  const sql = `
    SELECT * FROM qr_codes_admin
    WHERE is_active = 1
    ORDER BY generated_at DESC
    LIMIT 1
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB SELECT ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0] || null);
  });
});

export { router as qrRoutes };

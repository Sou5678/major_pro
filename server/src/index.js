import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import resumesRouter from './routes/resumes.js';

dotenv.config();

const app = express();

const port = Number(process.env.PORT || 5000);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

const localhostOriginRx = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProd) return callback(null, true);
    if (localhostOriginRx.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/status', (req, res) => {
  const groqEnabled = String(process.env.GROQ_ENABLED || '').toLowerCase() === 'true';
  const groqKeyPresent = Boolean(process.env.GROQ_API_KEY);
  const groqModel = process.env.GROQ_MODEL || null;
  res.json({
    ok: true,
    groq: {
      enabled: groqEnabled,
      keyPresent: groqKeyPresent,
      model: groqModel,
    },
  });
});

app.use('/api/resumes', resumesRouter);

app.use((err, req, res, next) => {
  const status = Number(err?.status || 500);
  const message = err?.message || 'Internal server error';
  res.status(status).json({ success: false, error: message });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Resume Analyzer API listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS origin: ${corsOrigin}`);
});

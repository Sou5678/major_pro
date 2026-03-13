import { Router } from 'express';
import multer from 'multer';

import { extractTextFromFile } from '../services/extractText.js';
import { analyzeText } from '../services/textAnalyzer.js';
import { enrichWithGroq } from '../services/groqClient.js';
import { computeAtsFallback, computeJobMatchFallback } from '../services/scoring.js';

const router = Router();

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
});

router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Missing file field: resume' });
    }

    const extractedText = await extractTextFromFile(req.file);

    const groqEnabled = String(process.env.GROQ_ENABLED || '').toLowerCase() === 'true';
    const groqKey = process.env.GROQ_API_KEY;

    if (groqEnabled && !groqKey) {
      return res
        .status(500)
        .json({ success: false, error: 'Groq is enabled but GROQ_API_KEY is missing in server/.env' });
    }

    const baseAnalysis = analyzeText(extractedText);

    let groq = null;
    if (groqEnabled && groqKey) {
      groq = await enrichWithGroq({
        extractedText,
        baseAnalysis,
        jobDescription: req.body?.jobDescription || null,
      });
    }

    const merged = {
      ...baseAnalysis,
      ...(groq?.ok ? groq.data : null),
    };

    const jobDescription = req.body?.jobDescription || null;

    const atsFallback = computeAtsFallback({ extractedText, analysis: merged });
    const jobMatchFallback = computeJobMatchFallback({ jobDescription, analysis: merged });

    const ats = {
      score: merged?.ats?.score ?? atsFallback.score,
      issues: (merged?.ats?.issues?.length ? merged.ats.issues : atsFallback.issues) || [],
      formatWarnings:
        (merged?.ats?.formatWarnings?.length ? merged.ats.formatWarnings : atsFallback.formatWarnings) || [],
    };

    const jobMatch = {
      score: merged?.jobMatch?.score ?? jobMatchFallback.score,
      matchedKeywords:
        (merged?.jobMatch?.matchedKeywords?.length
          ? merged.jobMatch.matchedKeywords
          : jobMatchFallback.matchedKeywords) || [],
      missingKeywords:
        (merged?.jobMatch?.missingKeywords?.length
          ? merged.jobMatch.missingKeywords
          : jobMatchFallback.missingKeywords) || [],
      recommendations:
        (merged?.jobMatch?.recommendations?.length
          ? merged.jobMatch.recommendations
          : jobMatchFallback.recommendations) || [],
    };

    return res.json({
      success: true,
      data: {
        ...merged,
        ats,
        jobMatch,
        groq,
      },
      extractedText,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

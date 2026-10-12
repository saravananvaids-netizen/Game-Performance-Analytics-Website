import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// AI Coach recommendation endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { playerProfile, gameTitle, statsSummary, recentMatches } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        isAiGenerated: false,
        reason: 'GEMINI_API_KEY is not configured on the server. Falling back to the built-in rules-based esports analytics engine.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an elite esports performance coach for competitive gaming in ${gameTitle || 'tactical esports'}.
Analyze the following player performance statistics and recent match telemetry:

Player: ${playerProfile?.name || 'Player'} (Current Rank: ${playerProfile?.rank || 'Unknown'})
Game: ${gameTitle}
Stats Overview:
- Total Matches: ${statsSummary?.totalMatches}
- Win Rate: ${statsSummary?.winRate}% (${statsSummary?.wins}W / ${statsSummary?.losses}L)
- K/D Ratio: ${statsSummary?.kdRatio} (Kills: ${statsSummary?.kills}, Deaths: ${statsSummary?.deaths})
- Average Score: ${statsSummary?.avgScore}
- Headshot/Accuracy: ${statsSummary?.avgAccuracy || 'N/A'}%

Recent Match Telemetry (Last ${recentMatches?.length || 0} matches):
${JSON.stringify(recentMatches?.slice(0, 8), null, 2)}

Provide an incisive, realistic esports coaching diagnosis in valid JSON format ONLY, without markdown code fences or conversational text. The JSON must match this structure:
{
  "overallVerdict": "1-2 sentence high-level executive verdict",
  "archetype": "e.g. Aggressive Entry Fragger, Passive Anchor, High-Impact Rotator, etc.",
  "strengths": [
    { "title": "Strength 1", "description": "evidence-backed reason" },
    { "title": "Strength 2", "description": "evidence-backed reason" }
  ],
  "criticalWeaknesses": [
    { "title": "Weakness 1", "description": "evidence-backed reason and match impact", "severity": "HIGH" | "MEDIUM" | "LOW" },
    { "title": "Weakness 2", "description": "evidence-backed reason and match impact", "severity": "HIGH" | "MEDIUM" | "LOW" }
  ],
  "actionableDrills": [
    { "drill": "Specific custom practice routine", "focusArea": "e.g. Crosshair Placement / Economy / Target Priority", "targetMetric": "e.g. +8% HS rate within 10 matches" }
  ],
  "tacticalAdjustment": "Immediate tactical advice for their next 5 matches to increase win rate."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    let parsedData = null;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // If parsing fails, extract JSON block or return text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    }

    if (!parsedData) {
      throw new Error('Failed to parse structured AI response');
    }

    return res.json({
      success: true,
      isAiGenerated: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error('Error generating AI coaching response:', error);
    return res.status(200).json({
      success: false,
      isAiGenerated: false,
      reason: `AI API encountered an error (${error.message || 'unknown'}). Utilizing rules-based esports analytics engine.`
    });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[GameVision AI] Server running at http://0.0.0.0:${port}`);
  });
}

startServer();

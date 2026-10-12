import { MatchRecord, PlayerProfile, AICoachingAdvice } from '../types';
import { generateHeuristicCoaching } from './analyticsService';

export async function fetchAICoachingAdvice(
  profile: PlayerProfile,
  gameTitle: string,
  statsSummary: {
    totalMatches: number;
    winRate: number;
    wins: number;
    losses: number;
    kdRatio: number;
    kills: number;
    deaths: number;
    avgScore: number;
    avgAccuracy: number;
  },
  recentMatches: MatchRecord[]
): Promise<AICoachingAdvice> {
  try {
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerProfile: profile,
        gameTitle,
        statsSummary,
        recentMatches
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.isAiGenerated && json.data) {
        return {
          isAiGenerated: true,
          modelUsed: 'Google Gemini 3.8 Flash (Server-Side)',
          overallVerdict: json.data.overallVerdict || 'AI analysis complete.',
          archetype: json.data.archetype || 'Tactical Competitor',
          strengths: json.data.strengths || [],
          criticalWeaknesses: json.data.criticalWeaknesses || [],
          actionableDrills: json.data.actionableDrills || [],
          tacticalAdjustment: json.data.tacticalAdjustment || '',
          sessionAdvice: json.data.sessionAdvice || 'Maintain regular breaks between intensive match sessions.'
        };
      }
    }
  } catch (err) {
    console.warn('Could not connect to /api/ai-coach, using heuristic esports engine:', err);
  }

  // Transparent fallback to deterministic rule-based esports engine
  return generateHeuristicCoaching(recentMatches, profile);
}

export type GameType = 'valorant' | 'bgmi' | 'freefire' | 'eafc' | 'custom';

export interface GameOption {
  id: GameType;
  name: string;
  tagline: string;
  modes: string[];
  metrics: {
    key: string;
    label: string;
    unit?: string;
    type: 'number' | 'text';
  }[];
}

export interface MatchRecord {
  id: string;
  playerId: string;
  gameId: GameType;
  gameTitle: string;
  gameMode: string;
  date: string; // ISO format: YYYY-MM-DDTHH:mm:ss
  result: 'WIN' | 'LOSS' | 'DRAW';
  score: number;
  durationMinutes: number;
  kills: number;
  deaths: number;
  assists: number;
  accuracy?: number; // e.g. headshot % or hit rate
  // Game-specific fields
  headshots?: number;
  damageDealt?: number;
  objectivesCompleted?: number; // e.g. spike defuses, capture points, goals
  mapName?: string;
  notes?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  primaryGame: GameType;
  rank: string;
  level: number;
  bio: string;
  joinedDate: string;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  game: GameType;
  rank: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  kdRatio: number;
  avgScore: number;
  avgAccuracy: number;
  tierScore: number;
  isCurrentUser?: boolean;
}

export interface GamingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  matchCount: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
  avgKd: number;
  matches: MatchRecord[];
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface StrengthWeaknessReport {
  dimensions: {
    subject: string;
    score: number; // 0 to 100
    fullMark: number;
    explanation: string;
  }[];
  strengths: {
    title: string;
    score: string;
    description: string;
    recommendation: string;
  }[];
  weaknesses: {
    title: string;
    score: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    fixGuide: string;
  }[];
  inconsistentPatterns: string[];
  practiceAreas: string[];
}

export interface AICoachingAdvice {
  isAiGenerated: boolean;
  modelUsed?: string;
  overallVerdict: string;
  archetype: string;
  strengths: { title: string; description: string }[];
  criticalWeaknesses: { title: string; description: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  actionableDrills: { drill: string; focusArea: string; targetMetric: string }[];
  tacticalAdjustment: string;
  sessionAdvice?: string;
}

export interface PredictionResult {
  hasSufficientData: boolean;
  minMatchesRequired: number;
  currentMatches: number;
  predictedScore: number;
  predictedWinProbability: number;
  predictedKD: number;
  confidenceScore: number; // 0 to 100
  trendDirection: 'up' | 'down' | 'flat';
  historicalVsPredicted: {
    matchNumber: number;
    actualScore?: number | undefined;
    predictedScore: number;
    isProjected: boolean;
    dateLabel: string;
  }[];
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }[];
}

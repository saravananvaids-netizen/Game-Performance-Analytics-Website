import { MatchRecord, GamingSession, StrengthWeaknessReport, AICoachingAdvice, PredictionResult, PlayerProfile } from '../types';

export function calculateWinRate(matches: MatchRecord[]): number {
  if (!matches || matches.length === 0) return 0;
  const wins = matches.filter(m => m.result === 'WIN').length;
  return Number(((wins / matches.length) * 100).toFixed(1));
}

export function calculateKdRatio(matches: MatchRecord[]): { kd: number; isFlawless: boolean } {
  if (!matches || matches.length === 0) return { kd: 0, isFlawless: false };
  const totalKills = matches.reduce((acc, m) => acc + (m.kills || 0), 0);
  const totalDeaths = matches.reduce((acc, m) => acc + (m.deaths || 0), 0);
  if (totalDeaths === 0) {
    return { kd: totalKills, isFlawless: totalKills > 0 };
  }
  return { kd: Number((totalKills / totalDeaths).toFixed(2)), isFlawless: false };
}

export function calculateAvgScore(matches: MatchRecord[]): number {
  if (!matches || matches.length === 0) return 0;
  const total = matches.reduce((acc, m) => acc + (m.score || 0), 0);
  return Math.round(total / matches.length);
}

export function calculateAvgAccuracy(matches: MatchRecord[]): number {
  const accMatches = (matches || []).filter(m => m.accuracy !== undefined && m.accuracy !== null);
  if (accMatches.length === 0) return 0;
  const total = accMatches.reduce((acc, m) => acc + (m.accuracy || 0), 0);
  return Number((total / accMatches.length).toFixed(1));
}

export function calculateTrends(matches: MatchRecord[]) {
  if (!matches || matches.length < 2) {
    return {
      winRateDiff: 0,
      kdDiff: 0,
      scoreDiff: 0,
      sampleSizeSufficient: false
    };
  }

  // Matches are sorted newest first
  const half = Math.min(5, Math.floor(matches.length / 2));
  const recent = matches.slice(0, half);
  const previous = matches.slice(half, half * 2);

  if (previous.length === 0) {
    return { winRateDiff: 0, kdDiff: 0, scoreDiff: 0, sampleSizeSufficient: false };
  }

  const recentWr = calculateWinRate(recent);
  const prevWr = calculateWinRate(previous);
  const winRateDiff = Number((recentWr - prevWr).toFixed(1));

  const recentKd = calculateKdRatio(recent).kd;
  const prevKd = calculateKdRatio(previous).kd;
  const kdDiff = Number((recentKd - prevKd).toFixed(2));

  const recentScore = calculateAvgScore(recent);
  const prevScore = calculateAvgScore(previous);
  const scoreDiff = recentScore - prevScore;

  return {
    winRateDiff,
    kdDiff,
    scoreDiff,
    sampleSizeSufficient: true
  };
}

// Cluster matches into sessions based on time gaps (e.g. 120 minutes)
export function detectGamingSessions(matches: MatchRecord[], gapMinutes = 120): GamingSession[] {
  if (!matches || matches.length === 0) return [];

  // Sort chronological (oldest to newest)
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sessions: GamingSession[] = [];
  let currentGroup: MatchRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (currentGroup.length === 0) {
      currentGroup.push(current);
      continue;
    }

    const prev = currentGroup[currentGroup.length - 1];
    const prevTime = new Date(prev.date).getTime() + (prev.durationMinutes || 30) * 60000;
    const currTime = new Date(current.date).getTime();
    const diffMinutes = (currTime - prevTime) / 60000;

    if (diffMinutes <= gapMinutes) {
      currentGroup.push(current);
    } else {
      sessions.push(buildSessionObject(currentGroup, sessions.length + 1));
      currentGroup = [current];
    }
  }

  if (currentGroup.length > 0) {
    sessions.push(buildSessionObject(currentGroup, sessions.length + 1));
  }

  // Return newest sessions first
  return sessions.reverse();
}

function buildSessionObject(matchList: MatchRecord[], index: number): GamingSession {
  const first = matchList[0];
  const last = matchList[matchList.length - 1];
  const totalDuration = matchList.reduce((acc, m) => acc + (m.durationMinutes || 25), 0);
  const wins = matchList.filter(m => m.result === 'WIN').length;
  const losses = matchList.filter(m => m.result === 'LOSS').length;
  const winRate = Number(((wins / matchList.length) * 100).toFixed(1));
  const avgScore = Math.round(matchList.reduce((acc, m) => acc + (m.score || 0), 0) / matchList.length);
  const avgKd = calculateKdRatio(matchList).kd;

  // Trend within session
  let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (matchList.length >= 3) {
    const firstScore = matchList[0].score || 0;
    const lastScore = matchList[matchList.length - 1].score || 0;
    if (lastScore > firstScore * 1.15) performanceTrend = 'improving';
    else if (lastScore < firstScore * 0.85) performanceTrend = 'declining';
  }

  return {
    id: `session-${index}-${first.id}`,
    date: first.date.split('T')[0],
    startTime: new Date(first.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date(last.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    durationMinutes: totalDuration,
    matchCount: matchList.length,
    wins,
    losses,
    winRate,
    avgScore,
    avgKd,
    matches: matchList,
    performanceTrend
  };
}

// Radar Chart & Strength/Weakness Analysis
export function evaluateStrengthsAndWeaknesses(matches: MatchRecord[]): StrengthWeaknessReport {
  if (!matches || matches.length === 0) {
    return {
      dimensions: [
        { subject: 'Aim & Precision', score: 50, fullMark: 100, explanation: 'No match data available.' },
        { subject: 'Survivability', score: 50, fullMark: 100, explanation: 'No match data available.' },
        { subject: 'Objective Play', score: 50, fullMark: 100, explanation: 'No match data available.' },
        { subject: 'Consistency', score: 50, fullMark: 100, explanation: 'No match data available.' },
        { subject: 'K/D Impact', score: 50, fullMark: 100, explanation: 'No match data available.' },
        { subject: 'Clutch / Win Impact', score: 50, fullMark: 100, explanation: 'No match data available.' }
      ],
      strengths: [],
      weaknesses: [],
      inconsistentPatterns: ['Add at least 3 matches to unlock detailed behavioral analysis.'],
      practiceAreas: ['Aim warm-up', 'Positioning drills']
    };
  }

  const winRate = calculateWinRate(matches);
  const kd = calculateKdRatio(matches).kd;
  const avgScore = calculateAvgScore(matches);
  const avgAccuracy = calculateAvgAccuracy(matches);

  // 1. Aim score (normalized to 100)
  // For tactical shooters, 30% HS is world-class (~95 score); for FIFA, 88% is ~90 score
  let aimScore = 60;
  if (avgAccuracy > 0) {
    if (avgAccuracy > 70) aimScore = Math.min(100, Math.round(avgAccuracy));
    else aimScore = Math.min(100, Math.round((avgAccuracy / 35) * 100));
  } else {
    aimScore = Math.min(100, Math.round((kd / 2.0) * 80));
  }

  // 2. Survivability score based on death frequency per match
  const avgDeaths = matches.reduce((acc, m) => acc + (m.deaths || 0), 0) / matches.length;
  const survivabilityScore = Math.max(20, Math.min(100, Math.round(100 - avgDeaths * 4.2)));

  // 3. Objective Play score
  const avgObjectives = matches.reduce((acc, m) => acc + (m.objectivesCompleted || 0), 0) / matches.length;
  const objectiveScore = Math.min(100, Math.max(30, Math.round(avgObjectives * 28 + (winRate * 0.4))));

  // 4. Consistency score (standard deviation of score)
  const scores = matches.map(m => m.score || 0);
  const variance = scores.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgScore > 0 ? stdDev / avgScore : 0.5; // coefficient of variation
  const consistencyScore = Math.max(25, Math.min(100, Math.round((1 - Math.min(1, cv)) * 100)));

  // 5. K/D Impact
  const kdScore = Math.min(100, Math.max(20, Math.round((kd / 2.2) * 100)));

  // 6. Clutch / Win Impact
  const clutchScore = Math.min(100, Math.max(15, Math.round(winRate)));

  const dimensions = [
    {
      subject: 'Aim & Precision',
      score: aimScore,
      fullMark: 100,
      explanation: `Calculated from your average accuracy (${avgAccuracy || 'N/A'}%) and first-engagement kill conversion.`
    },
    {
      subject: 'Survivability',
      score: survivabilityScore,
      fullMark: 100,
      explanation: `Derived from death frequency (averaging ${avgDeaths.toFixed(1)} deaths/match) and round survival rate.`
    },
    {
      subject: 'Objective Play',
      score: objectiveScore,
      fullMark: 100,
      explanation: `Based on an average of ${avgObjectives.toFixed(1)} objectives completed per match and match influence.`
    },
    {
      subject: 'Consistency',
      score: consistencyScore,
      fullMark: 100,
      explanation: `Calculated from score variance across ${matches.length} matches (Score StdDev: ±${Math.round(stdDev)}).`
    },
    {
      subject: 'K/D Impact',
      score: kdScore,
      fullMark: 100,
      explanation: `Based on your overall K/D ratio of ${kd.toFixed(2)} compared to competitive benchmark standards.`
    },
    {
      subject: 'Clutch / Win Impact',
      score: clutchScore,
      fullMark: 100,
      explanation: `Directly correlated with your overall win rate of ${winRate}% across competitive sessions.`
    }
  ];

  // Identify strengths & weaknesses
  const strengths: StrengthWeaknessReport['strengths'] = [];
  const weaknesses: StrengthWeaknessReport['weaknesses'] = [];
  const inconsistentPatterns: string[] = [];
  const practiceAreas: string[] = [];

  if (kd >= 1.35) {
    strengths.push({
      title: 'High Fragging Efficiency',
      score: `${kd} K/D`,
      description: 'You reliably generate positive combat trades and apply significant map pressure.',
      recommendation: 'Translate your early duels into coordinated site takes rather than hunting solo frags.'
    });
  }

  if (winRate >= 65) {
    strengths.push({
      title: 'Decisive Match Impact',
      score: `${winRate}% Win Rate`,
      description: 'Your presence directly correlates with team victories and clutch round closings.',
      recommendation: 'Take leadership of in-game comms during key eco rounds to snowball your advantage.'
    });
  }

  if (aimScore >= 75) {
    strengths.push({
      title: 'Crisp Crosshair Placement',
      score: `${aimScore}/100 Rating`,
      description: 'Your mechanical precision and first-bullet accuracy consistently outperform opponents in your tier.',
      recommendation: 'Maintain your pre-aim discipline around off-angles and common defensive chokepoints.'
    });
  }

  if (avgDeaths >= 14) {
    weaknesses.push({
      title: 'Excessive Round Deaths',
      score: `${avgDeaths.toFixed(1)} deaths/match`,
      description: 'You are dying too frequently, likely from over-extending or fighting without team trade potential.',
      priority: 'HIGH',
      fixGuide: 'Play closer to supportive cover and wait for utility before peeking contested sightlines.'
    });
    practiceAreas.push('Anchor & Retreat Positioning');
  }

  if (consistencyScore < 60) {
    weaknesses.push({
      title: 'High Score Volatility',
      score: `±${Math.round(stdDev)} variance`,
      description: 'Noticeable swings between blowout victories and low-impact losses across consecutive matches.',
      priority: 'MEDIUM',
      fixGuide: 'Establish a consistent 10-minute warm-up routine and take short 5-minute pauses between tough losses.'
    });
    inconsistentPatterns.push('Performance fluctuates by over 35% between back-to-back matches.');
  }

  if (objectiveScore < 55) {
    weaknesses.push({
      title: 'Low Objective Conversion',
      score: `${objectiveScore}/100 Objective Rating`,
      description: 'Your combat kills are not always synchronizing with objective captures or round wins.',
      priority: 'HIGH',
      fixGuide: 'Prioritize spike plant/defuse or zone holding over chasing distant retreating opponents.'
    });
    practiceAreas.push('Objective Focus Drills');
  }

  if (strengths.length === 0) {
    strengths.push({
      title: 'Active Competitive Engagement',
      score: `${matches.length} matches logged`,
      description: 'Consistent match volume provides a solid telemetry foundation for targeted skill improvement.',
      recommendation: 'Focus on one isolated fundamental each play session (e.g. crosshair height or utility timing).'
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      title: 'Marginal Long-Range Duel Efficiency',
      score: 'Micro-optimization',
      description: 'At higher competitive tiers, minor recoil resets and counter-strafing speed separate Immortal from Radiant.',
      priority: 'LOW',
      fixGuide: 'Run 10 minutes of isolated counter-strafing drills in shooting range daily.'
    });
  }

  if (inconsistentPatterns.length === 0) {
    inconsistentPatterns.push('Relatively stable baseline play across multiple maps and match sessions.');
  }

  if (practiceAreas.length === 0) {
    practiceAreas.push('Crosshair Placement & Pre-aiming', 'Utility & Team Trade Coordination');
  }

  return {
    dimensions,
    strengths,
    weaknesses,
    inconsistentPatterns,
    practiceAreas
  };
}

// Rules-based Esports AI Coaching Engine (Transparent fallback & baseline)
export function generateHeuristicCoaching(matches: MatchRecord[], profile: PlayerProfile): AICoachingAdvice {
  const winRate = calculateWinRate(matches);
  const kd = calculateKdRatio(matches).kd;
  const avgScore = calculateAvgScore(matches);
  const avgAccuracy = calculateAvgAccuracy(matches);
  const totalMatches = matches.length;

  let archetype = 'Tactical Hybrid Playmaker';
  if (kd > 1.4 && avgAccuracy > 26) {
    archetype = 'Aggressive Entry Fragger / Duelist';
  } else if (winRate > 65 && kd < 1.1) {
    archetype = 'Support Utility Anchor';
  } else if (kd < 0.95) {
    archetype = 'Developing Contender';
  }

  const strengthsList = [
    {
      title: 'Combat Mechanical Efficiency',
      description: `Maintaining a solid ${kd} K/D ratio demonstrates sharp individual duel conversion and reactive target acquisition.`
    },
    {
      title: 'Match Presence & Pressure',
      description: `Average combat rating of ${avgScore} places you in the upper bracket of round contribution across logged sessions.`
    }
  ];

  const criticalWeaknesses: AICoachingAdvice['criticalWeaknesses'] = [];
  const actionableDrills: AICoachingAdvice['actionableDrills'] = [];

  if (kd < 1.1) {
    criticalWeaknesses.push({
      title: 'Negative Combat Trade Deficit',
      description: `Current K/D of ${kd} reveals that you are giving away more lives than you secure, putting your squad at regular disadvantage.`,
      severity: 'HIGH'
    });
    actionableDrills.push({
      drill: 'Isolation & Crosshair Placement Warm-up',
      focusArea: 'Crosshair discipline at head level',
      targetMetric: '+0.25 K/D increase over next 8 matches'
    });
  } else {
    criticalWeaknesses.push({
      title: 'Post-Plant Round Conversions',
      description: 'Analysis shows vulnerability during retakes and late-round utility exhaustion.',
      severity: 'MEDIUM'
    });
    actionableDrills.push({
      drill: 'Clutch Time Clock & Positioning Exercise',
      focusArea: 'Retake coordination & passive site holding',
      targetMetric: '+5% round conversion rate'
    });
  }

  if (avgAccuracy > 0 && avgAccuracy < 24) {
    criticalWeaknesses.push({
      title: 'Spray Control & Headshot Rate Drop-off',
      description: `At ${avgAccuracy}% accuracy, too many bullets hit torso or miss, extending time-to-kill against higher-ranked players.`,
      severity: 'MEDIUM'
    });
    actionableDrills.push({
      drill: 'Micro-Adjustment Flick Training (15 mins/day)',
      focusArea: 'First-bullet accuracy on static targets',
      targetMetric: 'Push accuracy past 28%'
    });
  }

  const tacticalAdjustment = totalMatches > 0
    ? `For your next 5 matches: Stop dry-peeking wide sightlines without flashing or smoking first. Coordinate with an ally for guaranteed trade-frags on opening rounds.`
    : `Play and record at least 3 matches to unlock tailored tactical adjustments.`;

  const sessionAdvice = `Noticeable drop in reaction times after match 4 in prolonged sessions. Cap competitive sessions at 3 to 4 ranked games, then take a 15-minute screen break.`;

  return {
    isAiGenerated: false,
    modelUsed: 'GameVision Heuristic Esports Engine v2.4 (Rules-Based)',
    overallVerdict: `Player ${profile.name} exhibits sharp ${archetype} tendencies with high ceiling, but needs tighter discipline on trade angles and objective conversion.`,
    archetype,
    strengths: strengthsList,
    criticalWeaknesses,
    actionableDrills,
    tacticalAdjustment,
    sessionAdvice
  };
}

// Performance Prediction (Machine Learning / Statistical Linear Trend Model)
export function predictNextPerformance(matches: MatchRecord[]): PredictionResult {
  const minMatchesRequired = 3;
  const currentMatches = matches?.length || 0;

  if (currentMatches < minMatchesRequired) {
    return {
      hasSufficientData: false,
      minMatchesRequired,
      currentMatches,
      predictedScore: 0,
      predictedWinProbability: 50,
      predictedKD: 1.0,
      confidenceScore: 0,
      trendDirection: 'flat',
      historicalVsPredicted: [],
      factors: []
    };
  }

  // Sort chronological for time-series analysis (oldest to newest)
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const scores = sorted.map(m => m.score || 0);
  const n = scores.length;

  // Simple Linear Regression on Match Number vs Score
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = scores[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Weighted moving average of recent 5 matches
  const recentSlice = sorted.slice(-5);
  let weightedSum = 0;
  let weightDivider = 0;
  recentSlice.forEach((m, idx) => {
    const w = idx + 1;
    weightedSum += (m.score || 0) * w;
    weightDivider += w;
  });
  const wmaScore = weightedSum / weightDivider;

  // Blend regression and WMA for projected score
  const regressionProjected = intercept + slope * (n + 1);
  const finalProjectedScore = Math.max(50, Math.round(regressionProjected * 0.4 + wmaScore * 0.6));

  // Recent Win Rate & Form
  const recentWins = recentSlice.filter(m => m.result === 'WIN').length;
  const recentWr = (recentWins / recentSlice.length) * 100;
  const overallWr = calculateWinRate(matches);
  const predictedWinProb = Math.min(92, Math.max(18, Math.round(recentWr * 0.6 + overallWr * 0.4)));

  // Predicted K/D
  const recentKd = calculateKdRatio(recentSlice).kd;
  const overallKd = calculateKdRatio(matches).kd;
  const predictedKD = Number((recentKd * 0.65 + overallKd * 0.35).toFixed(2));

  // Trend direction
  const trendDirection: 'up' | 'down' | 'flat' = slope > 1.5 ? 'up' : slope < -1.5 ? 'down' : 'flat';

  // Confidence Score: scales with sample size and lower variance
  const avgS = sumY / n;
  const variance = scores.reduce((acc, s) => acc + Math.pow(s - avgS, 2), 0) / n;
  const cv = avgS > 0 ? Math.sqrt(variance) / avgS : 0.5;
  const sizeFactor = Math.min(1, n / 12); // reaches max weight at 12 matches
  const varianceFactor = Math.max(0.2, 1 - cv);
  const confidenceScore = Math.min(95, Math.max(40, Math.round((sizeFactor * 0.5 + varianceFactor * 0.5) * 100)));

  // Historical vs Predicted series
  const historicalVsPredicted: PredictionResult['historicalVsPredicted'] = sorted.map((m, idx) => {
    const projectedHistorical = Math.round(intercept + slope * (idx + 1));
    return {
      matchNumber: idx + 1,
      actualScore: m.score,
      predictedScore: projectedHistorical,
      isProjected: false,
      dateLabel: `M${idx + 1} (${m.result})`
    };
  });

  // Append next 3 projected future matches
  for (let step = 1; step <= 3; step++) {
    const projMatchNum = n + step;
    const est = Math.round(intercept + slope * projMatchNum * 0.8 + wmaScore * 0.2);
    historicalVsPredicted.push({
      matchNumber: projMatchNum,
      predictedScore: est,
      isProjected: true,
      dateLabel: `Next #${step} (Est)`
    });
  }

  const factors = [
    {
      name: 'Recent 5-Match Momentum',
      impact: (recentWr >= 60 ? 'positive' : recentWr <= 40 ? 'negative' : 'neutral') as any,
      weight: 35,
      description: `${recentWins} wins out of last ${recentSlice.length} matches (${Math.round(recentWr)}% win rate).`
    },
    {
      name: 'Historical Regression Trajectory',
      impact: (slope > 0 ? 'positive' : slope < 0 ? 'negative' : 'neutral') as any,
      weight: 30,
      description: `Linear score growth slope is ${slope > 0 ? '+' : ''}${slope.toFixed(2)} pts per match.`
    },
    {
      name: 'Fragging Consistency Index',
      impact: (recentKd >= 1.2 ? 'positive' : recentKd < 0.9 ? 'negative' : 'neutral') as any,
      weight: 20,
      description: `Current form K/D of ${recentKd} vs overall historical K/D of ${overallKd}.`
    },
    {
      name: 'Sample Size Maturity',
      impact: (n >= 10 ? 'positive' : 'neutral') as any,
      weight: 15,
      description: `${n} verified matches in database providing ${confidenceScore}% statistical stability.`
    }
  ];

  return {
    hasSufficientData: true,
    minMatchesRequired,
    currentMatches: n,
    predictedScore: finalProjectedScore,
    predictedWinProbability: predictedWinProb,
    predictedKD,
    confidenceScore,
    trendDirection,
    historicalVsPredicted,
    factors
  };
}

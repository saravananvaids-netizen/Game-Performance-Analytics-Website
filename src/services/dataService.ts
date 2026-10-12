import { MatchRecord, PlayerProfile, LeaderboardPlayer, GameType } from '../types';
import {
  INITIAL_MATCH_RECORDS,
  INITIAL_PLAYER_PROFILE,
  INITIAL_LEADERBOARD_PLAYERS
} from '../data/initialData';

const MATCHES_STORAGE_KEY = 'gamevision_matches_v1';
const PROFILE_STORAGE_KEY = 'gamevision_profile_v1';
const LEADERBOARD_STORAGE_KEY = 'gamevision_leaderboard_v1';
const ACTIVE_GAME_KEY = 'gamevision_active_game_v1';

class DataService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(MATCHES_STORAGE_KEY)) {
      localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(INITIAL_MATCH_RECORDS));
    }
    if (!localStorage.getItem(PROFILE_STORAGE_KEY)) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_PLAYER_PROFILE));
    }
    if (!localStorage.getItem(LEADERBOARD_STORAGE_KEY)) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD_PLAYERS));
    }
    if (!localStorage.getItem(ACTIVE_GAME_KEY)) {
      localStorage.setItem(ACTIVE_GAME_KEY, 'valorant');
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.syncCurrentUserInLeaderboard();
    this.listeners.forEach(fn => fn());
  }

  public getActiveGame(): GameType {
    if (typeof window === 'undefined') return 'valorant';
    return (localStorage.getItem(ACTIVE_GAME_KEY) as GameType) || 'valorant';
  }

  public setActiveGame(gameId: GameType) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_GAME_KEY, gameId);
    this.notify();
  }

  public getMatches(filterGame?: GameType | 'all', startDate?: string, endDate?: string): MatchRecord[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
      let list: MatchRecord[] = raw ? JSON.parse(raw) : INITIAL_MATCH_RECORDS;

      if (filterGame && filterGame !== 'all') {
        list = list.filter(m => m.gameId === filterGame);
      }

      if (startDate) {
        list = list.filter(m => m.date >= startDate);
      }
      if (endDate) {
        list = list.filter(m => m.date <= endDate);
      }

      // Sort descending by date (most recent first)
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error fetching matches:', e);
      return [];
    }
  }

  public getMatchById(id: string): MatchRecord | undefined {
    const matches = this.getMatches('all');
    return matches.find(m => m.id === id);
  }

  public addMatch(data: Omit<MatchRecord, 'id'>): MatchRecord {
    const matches = this.getMatches('all');
    const newMatch: MatchRecord = {
      ...data,
      id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    const updated = [newMatch, ...matches];
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    return newMatch;
  }

  public updateMatch(updatedMatch: MatchRecord): MatchRecord {
    const matches = this.getMatches('all');
    const index = matches.findIndex(m => m.id === updatedMatch.id);
    if (index !== -1) {
      matches[index] = updatedMatch;
      localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
      this.notify();
    }
    return updatedMatch;
  }

  public deleteMatch(id: string): boolean {
    const matches = this.getMatches('all');
    const filtered = matches.filter(m => m.id !== id);
    if (filtered.length !== matches.length) {
      localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  public getProfile(): PlayerProfile {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_PLAYER_PROFILE;
    } catch {
      return INITIAL_PLAYER_PROFILE;
    }
  }

  public updateProfile(partial: Partial<PlayerProfile>): PlayerProfile {
    const current = this.getProfile();
    const updated = { ...current, ...partial };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public getLeaderboard(): LeaderboardPlayer[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      const list: LeaderboardPlayer[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD_PLAYERS;
      return list;
    } catch {
      return INITIAL_LEADERBOARD_PLAYERS;
    }
  }

  private syncCurrentUserInLeaderboard() {
    try {
      const profile = this.getProfile();
      const allMatches = this.getMatches('all');
      const lb = this.getLeaderboard();

      const wins = allMatches.filter(m => m.result === 'WIN').length;
      const losses = allMatches.filter(m => m.result === 'LOSS').length;
      const totalMatches = allMatches.length;
      const winRate = totalMatches > 0 ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0;
      
      const totalKills = allMatches.reduce((acc, m) => acc + (m.kills || 0), 0);
      const totalDeaths = allMatches.reduce((acc, m) => acc + (m.deaths || 0), 0);
      const kdRatio = totalDeaths > 0 ? Number((totalKills / totalDeaths).toFixed(2)) : totalKills;

      const avgScore = totalMatches > 0
        ? Math.round(allMatches.reduce((acc, m) => acc + (m.score || 0), 0) / totalMatches)
        : 0;

      const accuracyMatches = allMatches.filter(m => m.accuracy !== undefined && m.accuracy !== null);
      const avgAccuracy = accuracyMatches.length > 0
        ? Number((accuracyMatches.reduce((acc, m) => acc + (m.accuracy || 0), 0) / accuracyMatches.length).toFixed(1))
        : 0;

      // Tier score calculation
      const tierScore = Math.round((wins * 120) + (avgScore * 12) + (kdRatio * 350));

      const updatedLb = lb.map(p => {
        if (p.isCurrentUser || p.id === 'player-current') {
          return {
            ...p,
            name: profile.name,
            tag: profile.tag,
            avatar: profile.avatar,
            game: profile.primaryGame,
            rank: profile.rank,
            totalMatches,
            wins,
            losses,
            winRate,
            kdRatio,
            avgScore,
            avgAccuracy,
            tierScore
          };
        }
        return p;
      });

      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updatedLb));
    } catch (e) {
      console.warn('Could not sync user in leaderboard', e);
    }
  }

  public resetToDemoData() {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(INITIAL_MATCH_RECORDS));
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_PLAYER_PROFILE));
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD_PLAYERS));
    localStorage.setItem(ACTIVE_GAME_KEY, 'valorant');
    this.notify();
  }

  public exportMatchesToCsv(gameFilter?: GameType | 'all'): string {
    const matches = this.getMatches(gameFilter);
    const headers = [
      'id',
      'gameId',
      'gameTitle',
      'gameMode',
      'date',
      'result',
      'score',
      'durationMinutes',
      'kills',
      'deaths',
      'assists',
      'accuracy',
      'headshots',
      'damageDealt',
      'objectivesCompleted',
      'mapName',
      'notes'
    ];

    const rows = matches.map(m => [
      m.id,
      m.gameId,
      `"${(m.gameTitle || '').replace(/"/g, '""')}"`,
      `"${(m.gameMode || '').replace(/"/g, '""')}"`,
      m.date,
      m.result,
      m.score,
      m.durationMinutes,
      m.kills,
      m.deaths,
      m.assists,
      m.accuracy ?? '',
      m.headshots ?? '',
      m.damageDealt ?? '',
      m.objectivesCompleted ?? '',
      `"${(m.mapName || '').replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public importMatchesFromCsv(csvText: string): { importedCount: number; errors: string[] } {
    const errors: string[] = [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { importedCount: 0, errors: ['CSV file is empty or missing headers'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const imported: MatchRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV regex parse for quotes
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      const record: any = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] ?? '';
      });

      // Validation
      const result = record.result?.toUpperCase();
      if (!['WIN', 'LOSS', 'DRAW'].includes(result)) {
        errors.push(`Row ${i + 1}: Invalid match result "${record.result}". Must be WIN, LOSS, or DRAW.`);
        continue;
      }

      const kills = parseInt(record.kills, 10);
      const deaths = parseInt(record.deaths, 10);
      if (isNaN(kills) || isNaN(deaths)) {
        errors.push(`Row ${i + 1}: Kills and Deaths must be valid numeric values.`);
        continue;
      }

      const matchRecord: MatchRecord = {
        id: record.id || `imported-${Date.now()}-${i}`,
        playerId: 'player-current',
        gameId: (record.gameId as GameType) || 'valorant',
        gameTitle: record.gameTitle || 'Imported Game',
        gameMode: record.gameMode || 'Standard',
        date: record.date || new Date().toISOString(),
        result: result as 'WIN' | 'LOSS' | 'DRAW',
        score: parseInt(record.score, 10) || 0,
        durationMinutes: parseInt(record.durationMinutes, 10) || 20,
        kills,
        deaths,
        assists: parseInt(record.assists, 10) || 0,
        accuracy: record.accuracy ? parseFloat(record.accuracy) : undefined,
        headshots: record.headshots ? parseInt(record.headshots, 10) : undefined,
        damageDealt: record.damageDealt ? parseInt(record.damageDealt, 10) : undefined,
        objectivesCompleted: record.objectivesCompleted ? parseInt(record.objectivesCompleted, 10) : undefined,
        mapName: record.mapName || '',
        notes: record.notes || ''
      };

      imported.push(matchRecord);
    }

    if (imported.length > 0) {
      const existing = this.getMatches('all');
      const merged = [...imported, ...existing];
      localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(merged));
      this.notify();
    }

    return { importedCount: imported.length, errors };
  }

  public exportAllDataJson(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      matches: this.getMatches('all'),
      leaderboard: this.getLeaderboard()
    }, null, 2);
  }

  public importAllDataJson(jsonText: string): boolean {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.matches && Array.isArray(parsed.matches)) {
        localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(parsed.matches));
      }
      if (parsed.profile) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed.profile));
      }
      if (parsed.leaderboard) {
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(parsed.leaderboard));
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to parse full backup JSON', e);
      return false;
    }
  }
}

export const dataService = new DataService();

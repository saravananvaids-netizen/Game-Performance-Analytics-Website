import React, { useState, useEffect } from 'react';
import { X, Check, Crosshair, Trophy, Calendar, Clock, ShieldAlert, Award } from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { SUPPORTED_GAMES } from '../../data/initialData';
import { dataService } from '../../services/dataService';
import confetti from 'canvas-confetti';

interface AddEditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchToEdit?: MatchRecord | null;
  onSaved?: (match: MatchRecord) => void;
}

export const AddEditMatchModal: React.FC<AddEditMatchModalProps> = ({
  isOpen,
  onClose,
  matchToEdit,
  onSaved
}) => {
  const [gameId, setGameId] = useState<GameType>('valorant');
  const [gameMode, setGameMode] = useState('Competitive');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<'WIN' | 'LOSS' | 'DRAW'>('WIN');
  const [score, setScore] = useState<string>('240');
  const [durationMinutes, setDurationMinutes] = useState<string>('35');
  const [kills, setKills] = useState<string>('18');
  const [deaths, setDeaths] = useState<string>('12');
  const [assists, setAssists] = useState<string>('6');
  const [accuracy, setAccuracy] = useState<string>('25');
  const [headshots, setHeadshots] = useState<string>('10');
  const [damageDealt, setDamageDealt] = useState<string>('3200');
  const [objectivesCompleted, setObjectivesCompleted] = useState<string>('2');
  const [mapName, setMapName] = useState('Ascent');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentGameConfig = SUPPORTED_GAMES.find(g => g.id === gameId) || SUPPORTED_GAMES[0];

  useEffect(() => {
    if (matchToEdit) {
      setGameId(matchToEdit.gameId);
      setGameMode(matchToEdit.gameMode);
      setDate(matchToEdit.date.slice(0, 16));
      setResult(matchToEdit.result);
      setScore(String(matchToEdit.score ?? 0));
      setDurationMinutes(String(matchToEdit.durationMinutes ?? 30));
      setKills(String(matchToEdit.kills ?? 0));
      setDeaths(String(matchToEdit.deaths ?? 0));
      setAssists(String(matchToEdit.assists ?? 0));
      setAccuracy(matchToEdit.accuracy !== undefined ? String(matchToEdit.accuracy) : '');
      setHeadshots(matchToEdit.headshots !== undefined ? String(matchToEdit.headshots) : '');
      setDamageDealt(matchToEdit.damageDealt !== undefined ? String(matchToEdit.damageDealt) : '');
      setObjectivesCompleted(matchToEdit.objectivesCompleted !== undefined ? String(matchToEdit.objectivesCompleted) : '');
      setMapName(matchToEdit.mapName || '');
      setNotes(matchToEdit.notes || '');
    } else {
      const activeGame = dataService.getActiveGame();
      const cfg = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];
      setGameId(cfg.id);
      setGameMode(cfg.modes[0] || 'Ranked');
      // Set to current local time in ISO format for datetime-local
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setDate(formatted);
      setResult('WIN');
      setScore('250');
      setDurationMinutes('32');
      setKills('20');
      setDeaths('12');
      setAssists('7');
      setAccuracy('28.5');
      setHeadshots('12');
      setDamageDealt('3600');
      setObjectivesCompleted('2');
      setMapName('');
      setNotes('');
    }
    setErrors({});
  }, [matchToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGameChange = (newGame: GameType) => {
    setGameId(newGame);
    const cfg = SUPPORTED_GAMES.find(g => g.id === newGame);
    if (cfg && cfg.modes.length > 0) {
      setGameMode(cfg.modes[0]);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!date) errs.date = 'Match date & time is required';
    const k = parseInt(kills, 10);
    const d = parseInt(deaths, 10);
    const s = parseInt(score, 10);
    const dur = parseInt(durationMinutes, 10);

    if (isNaN(k) || k < 0) errs.kills = 'Kills must be 0 or greater';
    if (isNaN(d) || d < 0) errs.deaths = 'Deaths must be 0 or greater';
    if (isNaN(s) || s < 0) errs.score = 'Score must be a valid non-negative number';
    if (isNaN(dur) || dur <= 0) errs.durationMinutes = 'Duration must be at least 1 minute';

    if (accuracy) {
      const acc = parseFloat(accuracy);
      if (isNaN(acc) || acc < 0 || acc > 100) {
        errs.accuracy = 'Accuracy must be between 0% and 100%';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<MatchRecord, 'id'> = {
      playerId: 'player-current',
      gameId,
      gameTitle: currentGameConfig.name,
      gameMode,
      date: date.length === 16 ? `${date}:00` : date,
      result,
      score: parseInt(score, 10),
      durationMinutes: parseInt(durationMinutes, 10),
      kills: parseInt(kills, 10),
      deaths: parseInt(deaths, 10),
      assists: parseInt(assists, 10) || 0,
      accuracy: accuracy ? parseFloat(accuracy) : undefined,
      headshots: headshots ? parseInt(headshots, 10) : undefined,
      damageDealt: damageDealt ? parseInt(damageDealt, 10) : undefined,
      objectivesCompleted: objectivesCompleted ? parseInt(objectivesCompleted, 10) : undefined,
      mapName: mapName.trim() || undefined,
      notes: notes.trim() || undefined
    };

    let saved: MatchRecord;
    if (matchToEdit) {
      saved = dataService.updateMatch({ ...payload, id: matchToEdit.id });
    } else {
      saved = dataService.addMatch(payload);
      if (result === 'WIN') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  const currentKills = parseInt(kills, 10) || 0;
  const currentDeaths = parseInt(deaths, 10) || 0;
  const kdRatioPreview = currentDeaths === 0 ? currentKills.toFixed(2) : (currentKills / currentDeaths).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {matchToEdit ? 'Edit Match Telemetry' : 'Log New Match Record'}
              </h2>
              <p className="text-xs text-slate-400">
                Record real game metrics for precision AI analysis & rank tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Game Selection & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Game Title
              </label>
              <select
                value={gameId}
                onChange={e => handleGameChange(e.target.value as GameType)}
                className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {SUPPORTED_GAMES.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Game Mode
              </label>
              <select
                value={gameMode}
                onChange={e => setGameMode(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {currentGameConfig.modes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Match Outcome
            </label>
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#131d33] border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setResult('WIN')}
                className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  result === 'WIN'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                VICTORY (WIN)
              </button>
              <button
                type="button"
                onClick={() => setResult('LOSS')}
                className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  result === 'LOSS'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                DEFEAT (LOSS)
              </button>
              <button
                type="button"
                onClick={() => setResult('DRAW')}
                className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  result === 'DRAW'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                DRAW / TIE
              </button>
            </div>
          </div>

          {/* Date and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date & Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. 35"
                />
              </div>
              {errors.durationMinutes && <p className="text-xs text-rose-400 mt-1">{errors.durationMinutes}</p>}
            </div>
          </div>

          {/* Core Combat Stats: Kills, Deaths, Assists */}
          <div className="p-4 bg-[#111a2e] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Combat Telemetry
              </span>
              <span className="text-xs text-slate-400">
                Calculated K/D: <strong className="text-cyan-300">{kdRatioPreview}</strong>
                {currentDeaths === 0 && currentKills > 0 && ' (Flawless)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kills / Goals</label>
                <input
                  type="number"
                  min="0"
                  value={kills}
                  onChange={e => setKills(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="0"
                />
                {errors.kills && <p className="text-xs text-rose-400 mt-1">{errors.kills}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Deaths / Conceded</label>
                <input
                  type="number"
                  min="0"
                  value={deaths}
                  onChange={e => setDeaths(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="0"
                />
                {errors.deaths && <p className="text-xs text-rose-400 mt-1">{errors.deaths}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Assists</label>
                <input
                  type="number"
                  min="0"
                  value={assists}
                  onChange={e => setAssists(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Score & Accuracy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Match Score / Rating Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. 250"
                />
                {errors.score && <p className="text-xs text-rose-400 mt-1">{errors.score}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Accuracy / Headshot Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={accuracy}
                  onChange={e => setAccuracy(e.target.value)}
                  className="w-full bg-[#18233c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. 27.5"
                />
                {errors.accuracy && <p className="text-xs text-rose-400 mt-1">{errors.accuracy}</p>}
              </div>
            </div>
          </div>

          {/* Optional / Game Specific Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Damage Dealt</label>
              <input
                type="number"
                min="0"
                value={damageDealt}
                onChange={e => setDamageDealt(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. 3200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Objectives / Plants</label>
              <input
                type="number"
                min="0"
                value={objectivesCompleted}
                onChange={e => setObjectivesCompleted(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Map / Arena</label>
              <input
                type="text"
                value={mapName}
                onChange={e => setMapName(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. Ascent, Erangel"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tactical Match Notes & Lessons
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#131d33] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Good retake communications. Need to stop peeking mid with operator."
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-400/25 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              {matchToEdit ? 'Save Changes' : 'Record Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

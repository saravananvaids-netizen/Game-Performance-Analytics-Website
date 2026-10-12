import React, { useState } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  RotateCcw,
  Upload,
  Download,
  KeyRound,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  LogOut,
  Sparkles
} from 'lucide-react';
import { PlayerProfile, GameType } from '../../types';
import { dataService } from '../../services/dataService';
import { SUPPORTED_GAMES } from '../../data/initialData';

interface SettingsPageProps {
  profile: PlayerProfile;
  onProfileUpdated: (p: PlayerProfile) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ profile, onProfileUpdated }) => {
  const [name, setName] = useState(profile.name);
  const [tag, setTag] = useState(profile.tag);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [rank, setRank] = useState(profile.rank);
  const [bio, setBio] = useState(profile.bio);
  const [primaryGame, setPrimaryGame] = useState<GameType>(profile.primaryGame);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState('');
  const [csvStatus, setCsvStatus] = useState<{ imported: number; errors: string[] } | null>(null);

  // Simulated Demo Auth State
  const [demoAuthStatus, setDemoAuthStatus] = useState<'logged_in' | 'logged_out'>('logged_in');
  const [loginEmail, setLoginEmail] = useState('player1@esports.ai');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dataService.updateProfile({
      name: name.trim() || 'Player',
      tag: tag.trim() || 'TAG#001',
      avatar: avatar.trim(),
      rank: rank.trim(),
      bio: bio.trim(),
      primaryGame
    });
    onProfileUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all match telemetry, profiles, and leaderboard back to the initial 24 demo matches? This will erase custom records.')) {
      dataService.resetToDemoData();
      const p = dataService.getProfile();
      setName(p.name);
      setTag(p.tag);
      setAvatar(p.avatar);
      setRank(p.rank);
      setBio(p.bio);
      setPrimaryGame(p.primaryGame);
      onProfileUpdated(p);
      alert('Demo data successfully reset!');
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvFileContent(text);
      const result = dataService.importMatchesFromCsv(text);
      setCsvStatus({ imported: result.importedCount, errors: result.errors });
    };
    reader.readAsText(file);
  };

  const handleDownloadFullJson = () => {
    const jsonStr = dataService.exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GameVision_FullBackup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSwitchDemoAccount = (accountName: string, accountTag: string, accountRank: string, game: GameType) => {
    const updated = dataService.updateProfile({
      name: accountName,
      tag: accountTag,
      rank: accountRank,
      primaryGame: game
    });
    setName(updated.name);
    setTag(updated.tag);
    setRank(updated.rank);
    setPrimaryGame(updated.primaryGame);
    onProfileUpdated(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Settings & Data Management
            </h1>
            <p className="text-xs text-slate-400">
              Player profile configuration, CSV imports, demo database controls, and authentication simulation
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Authentication & Account Status Card */}
      <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Authentication Status (Simulated Demo Auth)
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
            DEMO MODE
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1122] border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
              GV
            </div>
            <div>
              <div className="font-bold text-white">{name} ({tag})</div>
              <div className="text-[11px] text-slate-400">demo.user@gamevision.local · Session Active</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Authenticated
            </span>
          </div>
        </div>

        {/* Quick Demo Switcher */}
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">
            Switch Demo Esports Identity:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSwitchDemoAccount('ViperStrike', 'PRO#992', 'Immortal 2', 'valorant')}
              className="p-2.5 rounded-lg bg-[#111a2f] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-800 text-left text-xs transition-colors"
            >
              <div className="font-bold text-white">ViperStrike</div>
              <div className="text-[10px] text-slate-400">Immortal 2 · Valorant</div>
            </button>
            <button
              onClick={() => handleSwitchDemoAccount('ShadowFox', 'KR#777', 'Conqueror Top 100', 'bgmi')}
              className="p-2.5 rounded-lg bg-[#111a2f] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-800 text-left text-xs transition-colors"
            >
              <div className="font-bold text-white">ShadowFox</div>
              <div className="text-[10px] text-slate-400">Conqueror · BGMI</div>
            </button>
            <button
              onClick={() => handleSwitchDemoAccount('PhoenixEcho', 'BR#505', 'Grandmaster', 'freefire')}
              className="p-2.5 rounded-lg bg-[#111a2f] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-800 text-left text-xs transition-colors"
            >
              <div className="font-bold text-white">PhoenixEcho</div>
              <div className="text-[10px] text-slate-400">Grandmaster · Free Fire</div>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Player Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
            <User className="w-4 h-4 text-purple-400" />
            Player Profile Configuration
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Changes Persisted
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Player In-Game Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Esports Tag / Handle
            </label>
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Competitive Rank Tier
            </label>
            <input
              type="text"
              value={rank}
              onChange={e => setRank(e.target.value)}
              className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Competitive Game
            </label>
            <select
              value={primaryGame}
              onChange={e => setPrimaryGame(e.target.value as GameType)}
              className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {SUPPORTED_GAMES.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Player Avatar Image URL
          </label>
          <input
            type="url"
            value={avatar}
            onChange={e => setAvatar(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Player Bio / Playstyle Notes
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-md transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* CSV Import / Export & Telemetry Sync */}
      <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
            <Upload className="w-4 h-4 text-emerald-400" />
            Telemetry CSV Import & Data Portability
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Upload match records from third-party scrim logs or spreadsheets. Supported headers: <code className="text-slate-300">result, kills, deaths, assists, score, durationMinutes, accuracy, gameTitle, gameMode</code>.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111a2f] border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-cyan-400" />
            Upload CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleDownloadFullJson}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export Full Telemetry Backup (JSON)
          </button>
        </div>

        {csvStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              csvStatus.imported > 0
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
            }`}
          >
            <div className="font-bold">
              {csvStatus.imported > 0
                ? `Successfully imported ${csvStatus.imported} match record(s)!`
                : 'CSV Import Failed'}
            </div>
            {csvStatus.errors.length > 0 && (
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px] text-rose-300">
                {csvStatus.errors.slice(0, 4).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Dangerous Zone: Reset Demo Data */}
      <div className="p-6 rounded-2xl bg-[#0d1424] border border-rose-950 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Initial Demo Database
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Restore the application to the fresh pre-seeded state with 24 realistic fictional match records across Valorant, BGMI, Free Fire, and EA Sports FC.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs border border-rose-800 transition-colors self-start sm:self-auto"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};

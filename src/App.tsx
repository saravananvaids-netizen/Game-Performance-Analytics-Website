import React, { useState, useEffect } from 'react';
import { MatchRecord, PlayerProfile, GameType, LeaderboardPlayer } from './types';
import { dataService } from './services/dataService';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { AddEditMatchModal } from './components/common/AddEditMatchModal';

// Features
import { OverviewDashboard } from './components/features/OverviewDashboard';
import { PerformanceTracking } from './components/features/PerformanceTracking';
import { WinRateAnalyzer } from './components/features/WinRateAnalyzer';
import { ProgressTracker } from './components/features/ProgressTracker';
import { AICoach } from './components/features/AICoach';
import { StrengthsWeaknesses } from './components/features/StrengthsWeaknesses';
import { Leaderboard } from './components/features/Leaderboard';
import { MatchHistory } from './components/features/MatchHistory';
import { PlayerComparison } from './components/features/PlayerComparison';
import { PerformancePrediction } from './components/features/PerformancePrediction';
import { SessionAnalyzer } from './components/features/SessionAnalyzer';
import { ReportGenerator } from './components/features/ReportGenerator';
import { SettingsPage } from './components/features/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('overview');
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [profile, setProfile] = useState<PlayerProfile>(dataService.getProfile());
  const [activeGame, setActiveGame] = useState<GameType>(dataService.getActiveGame());
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(dataService.getLeaderboard());

  // Navigation & Modals
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<MatchRecord | null>(null);
  const [compareTargetPlayerId, setCompareTargetPlayerId] = useState<string | undefined>(undefined);

  // Sync state from dataService reactively
  const syncData = () => {
    setMatches(dataService.getMatches('all'));
    setProfile(dataService.getProfile());
    setActiveGame(dataService.getActiveGame());
    setLeaderboard(dataService.getLeaderboard());
  };

  useEffect(() => {
    syncData();
    const unsubscribe = dataService.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  const handleOpenAddMatch = () => {
    setMatchToEdit(null);
    setIsAddMatchModalOpen(true);
  };

  const handleEditMatch = (m: MatchRecord) => {
    setMatchToEdit(m);
    setIsAddMatchModalOpen(true);
  };

  const handleCompareWithPlayer = (playerId: string) => {
    setCompareTargetPlayerId(playerId);
    setCurrentTab('comparison');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Navbar
        currentProfile={profile}
        activeGame={activeGame}
        onSelectGame={(g) => {
          setActiveGame(g);
          dataService.setActiveGame(g);
        }}
        onOpenAddMatch={handleOpenAddMatch}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenProfile={() => setCurrentTab('settings')}
      />

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          matchCount={matches.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewDashboard
              matches={matches}
              profile={profile}
              activeGame={activeGame}
              onOpenAddMatch={handleOpenAddMatch}
              onNavigateToTab={(t) => setCurrentTab(t)}
            />
          )}

          {currentTab === 'tracking' && (
            <PerformanceTracking
              matches={matches}
              activeGame={activeGame}
              onOpenAddMatch={handleOpenAddMatch}
              onEditMatch={handleEditMatch}
            />
          )}

          {currentTab === 'winrate' && (
            <WinRateAnalyzer
              matches={matches}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressTracker
              matches={matches}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'coach' && (
            <AICoach
              matches={matches}
              profile={profile}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'strengths' && (
            <StrengthsWeaknesses
              matches={matches}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'leaderboard' && (
            <Leaderboard
              leaderboard={leaderboard}
              currentUserId={profile.id}
              onCompareWithPlayer={handleCompareWithPlayer}
            />
          )}

          {currentTab === 'history' && (
            <MatchHistory
              matches={matches}
              onOpenAddMatch={handleOpenAddMatch}
              onEditMatch={handleEditMatch}
            />
          )}

          {currentTab === 'comparison' && (
            <PlayerComparison
              leaderboard={leaderboard}
              initialPlayer2Id={compareTargetPlayerId}
            />
          )}

          {currentTab === 'predictions' && (
            <PerformancePrediction
              matches={matches}
              activeGame={activeGame}
              onOpenAddMatch={handleOpenAddMatch}
            />
          )}

          {currentTab === 'sessions' && (
            <SessionAnalyzer
              matches={matches}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'reports' && (
            <ReportGenerator
              matches={matches}
              profile={profile}
              activeGame={activeGame}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              profile={profile}
              onProfileUpdated={(p) => setProfile(p)}
            />
          )}
        </main>
      </div>

      {/* Global Add/Edit Match Modal */}
      <AddEditMatchModal
        isOpen={isAddMatchModalOpen}
        onClose={() => {
          setIsAddMatchModalOpen(false);
          setMatchToEdit(null);
        }}
        matchToEdit={matchToEdit}
      />
    </div>
  );
}

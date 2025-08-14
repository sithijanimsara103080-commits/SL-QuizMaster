'use client';

import { Volume2, VolumeX, Sun, Moon, LogOut, Play, Bell } from 'lucide-react';

interface BattleState {
  isActive: boolean;
  isWaiting: boolean;
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question | null;
  roundStartTime: number;
  roundEndTime: number;
}

interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  timeLimit: number;
}

interface BattleHeaderProps {
  roomCode: string;
  onThemeToggle: () => void;
  onSoundToggle: () => void;
  onLeave: () => void;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  battleState: BattleState;
  onStartBattle: () => void;
  onShowInvites: () => void;
  pendingInvitesCount: number;
}

export default function BattleHeader({
  roomCode,
  onThemeToggle,
  onSoundToggle,
  onLeave,
  soundEnabled,
  theme,
  battleState,
  onStartBattle,
  onShowInvites,
  pendingInvitesCount
}: BattleHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Room Code */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">⚔️ MCQ Battle</h1>
            <p className="text-sm text-muted-foreground">Real-time multiplayer quiz</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">🚪 Room:</span>
            <code className="bg-muted px-3 py-1 rounded-md font-mono text-sm font-semibold text-primary">
              {roomCode}
            </code>
          </div>
          
          {/* Battle Status */}
          <div className="flex items-center space-x-2">
            {battleState.isActive ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>🎯 Round {battleState.roundNumber}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>⏳ Waiting</span>
              </div>
            )}
          </div>
        </div>

        {/* Center - Battle Controls */}
        <div className="flex items-center space-x-3">
          {/* Start Battle Button */}
          {!battleState.isActive && (
            <button
              onClick={onStartBattle}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              title="Start the battle"
            >
              <Play className="w-4 h-4" />
              <span>🚀 Start Battle</span>
            </button>
          )}

          {/* Pending Invites */}
          {pendingInvitesCount > 0 && (
            <button
              onClick={onShowInvites}
              className="relative flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              title={`${pendingInvitesCount} pending invite(s)`}
            >
              <Bell className="w-4 h-4" />
              <span>📨 Invites ({pendingInvitesCount})</span>
            </button>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onSoundToggle}
            className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
            title={`${soundEnabled ? 'Mute' : 'Unmute'} sound`}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Leave Room */}
          <button
            onClick={onLeave}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            title="Leave battle room"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Leave</span>
          </button>
        </div>
      </div>
    </header>
  );
} 
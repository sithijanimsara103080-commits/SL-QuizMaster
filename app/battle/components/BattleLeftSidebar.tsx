'use client';

import { Users, Target, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  grade: string;
  score: number;
  streak: number;
  isOnline: boolean;
  isRealPlayer: boolean;
  avatar?: string;
  currentAnswer?: 'A' | 'B' | 'C' | 'D' | null;
  isAnswerLocked?: boolean;
  answerTime?: number;
  isCorrect?: boolean;
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

interface BattleState {
  isActive: boolean;
  isWaiting: boolean;
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question | null;
  roundStartTime: number;
  roundEndTime: number;
}

interface BattleLeftSidebarProps {
  players: Player[];
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question | null;
  allUsers: any[];
  currentUser: any;
  onInvitePlayer: (user: any) => void;
  battleState: BattleState;
}

export default function BattleLeftSidebar({
  players,
  roundNumber,
  totalRounds,
  currentQuestion,
  allUsers,
  currentUser,
  onInvitePlayer,
  battleState
}: BattleLeftSidebarProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getAnswerStatus = (player: Player) => {
    if (!battleState.isActive) return null;
    
    if (player.isAnswerLocked) {
      if (player.isCorrect) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else {
        return <XCircle className="w-4 h-4 text-red-500" />;
      }
    }
    
    if (player.currentAnswer) {
      return <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>;
    }
    
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
  };

  const getAnswerLabel = (answer: 'A' | 'B' | 'C' | 'D') => {
    return answer;
  };

  return (
    <div className="w-80 bg-card border-r border-border p-6 space-y-6 overflow-y-auto">
      {/* Players List */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👥</span>
          <h3 className="font-semibold text-lg">Players ({players.length}/2)</h3>
        </div>
        
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                player.isOnline ? 'bg-accent/50 border-accent' : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getAnswerStatus(player)}
                  <div className={`w-3 h-3 rounded-full ${
                    player.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex items-center space-x-2">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{player.name}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {player.grade}
                      </span>
                      {!player.isRealPlayer && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          🤖
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🔥 Streak: {player.streak}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{player.score}</p>
                <p className="text-xs text-muted-foreground">pts</p>
                {player.currentAnswer && (
                  <p className="text-xs text-blue-600 font-medium">
                    📝 {getAnswerLabel(player.currentAnswer)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Player Limit Message */}
        {players.length >= 2 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <span className="text-lg">✅</span>
              <p className="text-sm text-green-700 font-medium">Maximum players reached (2/2)</p>
              <p className="text-xs text-green-600">Ready to start battle!</p>
            </div>
          </div>
        )}

        {players.length < 2 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <span className="text-lg">⏳</span>
              <p className="text-sm text-yellow-700 font-medium">Need {2 - players.length} more player(s)</p>
              <p className="text-xs text-yellow-600">Invite players to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">🔗 Connect Players</h3>
        </div>
        
        {/* Available Users to Invite */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {allUsers
            .filter(user => user.id !== currentUser?.id && !players.find(p => p.id === user.id))
            .slice(0, 5)
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">👤</span>
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">({user.grade})</span>
                </div>
                <button
                  onClick={() => onInvitePlayer(user)}
                  disabled={players.length >= 2}
                  className="p-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={players.length >= 2 ? "Maximum players reached" : "Invite to battle"}
                >
                  📨
                </button>
              </div>
            ))}
        </div>

        {/* Invite Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <span className="text-lg">💡</span>
            <p className="text-sm text-blue-700 font-medium">Battle Rules</p>
            <p className="text-xs text-blue-600">• Only 2 players per battle</p>
            <p className="text-xs text-blue-600">• Send invites to start</p>
            <p className="text-xs text-blue-600">• First to answer gets +20 points</p>
          </div>
        </div>
      </div>

      {/* Round Progress */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <h3 className="font-semibold text-lg">Round Progress</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Round {roundNumber} of {totalRounds}</span>
            <span className="text-sm font-medium text-primary">
              {Math.round((roundNumber / totalRounds) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(roundNumber / totalRounds) * 100}%` }}
            />
          </div>

          {currentQuestion && (
            <div className="p-3 bg-accent/30 rounded-lg border border-accent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">📚 {currentQuestion.category}</span>
                <span className={`text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {getDifficultyIcon(currentQuestion.difficulty)} {currentQuestion.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className="text-sm">⏰</span>
                <span>{currentQuestion.timeLimit}s time limit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
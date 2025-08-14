'use client';

import { Clock, Lock, X, CheckCircle, Users, XCircle, Trophy } from 'lucide-react';

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

interface BattleCenterProps {
  question: Question | null;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  timeRemaining: number;
  isAnswerLocked: boolean;
  onAnswerSelect: (answer: 'A' | 'B' | 'C' | 'D') => void;
  onLockIn: () => void;
  onClear: () => void;
  battleState: BattleState;
  players: Player[];
}

export default function BattleCenter({
  question,
  selectedAnswer,
  timeRemaining,
  isAnswerLocked,
  onAnswerSelect,
  onLockIn,
  onClear,
  battleState,
  players
}: BattleCenterProps) {
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Waiting for Question</h2>
          <p className="text-muted-foreground">Get ready for the battle! 🚀</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChoiceStyle = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswer === choice) {
      return 'bg-primary text-primary-foreground border-primary shadow-lg scale-105';
    }
    return 'bg-card hover:bg-accent border-border hover:border-primary transition-all duration-200';
  };

  const getTimeColor = () => {
    if (timeRemaining > 20) return 'text-green-500';
    if (timeRemaining > 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
      {/* Battle Status */}
      {!battleState.isActive && (
        <div className="w-full max-w-2xl text-center p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="text-4xl mb-2">⚔️</div>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Waiting to Start Battle</h2>
          <p className="text-yellow-700">Need at least 2 players to begin. Invite players or add random opponents. 👥</p>
        </div>
      )}

      {/* Timer and Progress */}
      {battleState.isActive && (
        <div className="w-full max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Remaining</span>
            </div>
            <span className={`text-2xl font-bold ${getTimeColor()}`}>
              {timeRemaining}s
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timeRemaining > 20 ? 'bg-green-500' : timeRemaining > 10 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(timeRemaining / question.timeLimit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl p-8 shadow-lg">
        {/* Question Meta */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
              {question.category}
            </span>
            <span className={`px-3 py-1 border rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Question</p>
            <p className="text-lg font-bold text-primary">#{question.id}</p>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Answer Choices */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {(['A', 'B', 'C', 'D'] as const).map((choice) => (
            <button
              key={choice}
              onClick={() => onAnswerSelect(choice)}
              disabled={isAnswerLocked}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                getChoiceStyle(choice)
              } ${isAnswerLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-102'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg ${
                  selectedAnswer === choice 
                    ? 'bg-primary-foreground text-primary border-primary' 
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {choice}
                </div>
                <p className="text-lg font-medium">{question.choices[choice]}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        {battleState.isActive && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onClear}
              disabled={isAnswerLocked}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
            
            <button
              onClick={onLockIn}
              disabled={!selectedAnswer || isAnswerLocked}
              className="flex items-center space-x-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnswerLocked ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Locked In</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock In Answer</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Player Status */}
      {battleState.isActive && (
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span className="text-2xl">👥</span>
              <span>Player Status</span>
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
              ✅ {players.filter(p => p.isAnswerLocked).length} Answered
            </span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              ⏳ {players.filter(p => !p.isAnswerLocked).length} Waiting
            </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg border ${
                  player.isAnswerLocked 
                    ? player.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="text-xs text-muted-foreground">{player.grade}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  {player.isAnswerLocked ? (
                    <div className="flex items-center space-x-2">
                      {player.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {player.currentAnswer ? player.currentAnswer : 'No Answer'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">🤔 Thinking...</span>
                    </div>
                  )}
                  
                  <span className="text-sm font-bold text-primary">{player.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {isAnswerLocked && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-full">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">🔒 Answer locked in! Waiting for other players...</span>
          </div>
        </div>
      )}

      {!battleState.isActive && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-medium">🚀 Battle not started yet. Invite players to begin!</span>
          </div>
        </div>
      )}
    </div>
  );
} 
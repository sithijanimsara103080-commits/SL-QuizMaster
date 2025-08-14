'use client';

import { useState } from 'react';
import { MessageCircle, Send, Crown, Medal, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'answer' | 'battle';
}

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

interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  grade: string;
}

interface BattleRightSidebarProps {
  chatMessages: ChatMessage[];
  leaderboard: LeaderboardEntry[];
  onSendMessage: (message: string) => void;
  players: Player[];
  currentUser: any;
}

export default function BattleRightSidebar({
  chatMessages,
  leaderboard,
  onSendMessage,
  players,
  currentUser
}: BattleRightSidebarProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'answer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'battle':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-card text-foreground border-border';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 text-center text-xs font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '🏆';
      case 'battle':
        return '⚔️';
      case 'answer':
        return '✅';
      default:
        return '💬';
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border p-6 space-y-6 overflow-y-auto">
      {/* Chat Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💬</span>
          <h3 className="font-semibold text-lg">Battle Chat</h3>
        </div>
        
        {/* Chat Messages */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg border ${getMessageTypeStyle(message.type)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMessageIcon(message.type)}</span>
                  <span className="text-sm font-medium">
                    {message.type === 'system' ? '🏆 System' : message.playerName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {newMessage.length}/100
          </p>
        </form>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-semibold text-lg">Leaderboard</h3>
        </div>
        
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <span className="font-medium text-sm">{entry.name}</span>
                  <div className="text-xs text-muted-foreground">{entry.grade}</div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{entry.score}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="p-4 bg-accent/30 rounded-lg border border-accent">
          <h4 className="font-medium text-sm mb-3 text-center">📊 Battle Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{leaderboard[0]?.score || 0}</p>
                              <p className="text-xs text-muted-foreground">🥇 Top Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {Math.round(leaderboard.reduce((acc, entry) => acc + entry.score, 0) / leaderboard.length)}
              </p>
                              <p className="text-xs text-muted-foreground">📈 Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Overview */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👥</span>
          <h3 className="font-semibold text-lg">Players Overview</h3>
        </div>
        
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-lg border ${
                player.id === currentUser?.id 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{player.name}</span>
                  {player.id === currentUser?.id && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{player.grade}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    player.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {player.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">{player.score}</span>
              </div>
              
              {player.currentAnswer && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    📝 {player.currentAnswer}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
} 
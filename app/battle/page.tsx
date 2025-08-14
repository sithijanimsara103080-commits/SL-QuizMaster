'use client';

import React, { useState, useEffect, useCallback } from 'react';

// This is a self-contained component. All sub-components are defined within this file.
// This is necessary because the previous code was trying to import files that do not exist in this environment.

// Helper to replace `next/navigation`'s useRouter.
// Since this is a single, self-contained component, we can't actually navigate away.
// So we'll just show an alert and reload the page.
const mockRouter = {
  push: (path: string) => {
    alert(`Navigating to ${path}.`);
    // In a real app, this would perform a client-side navigation.
    // For this demonstration, we'll just simulate a redirect.
    window.location.reload();
  },
};

// Interface definitions from the original code
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

interface BattleInvite {
  id: string;
  fromPlayer: string;
  fromPlayerId: string;
  toPlayer: string;
  toPlayerId: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
  roomCode: string;
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

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'answer' | 'battle';
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

// --- SUB-COMPONENTS ---
// All sub-components are defined here to make the main component self-contained and runnable.

const BattleHeader = ({ roomCode, onThemeToggle, onSoundToggle, onLeave, soundEnabled, theme, battleState, onStartBattle, onShowInvites, pendingInvitesCount }: any) => (
  <header className={`flex items-center justify-between p-4 shadow-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
    <div className="flex items-center space-x-4">
      <h1 className="text-xl font-bold">Quiz Battle</h1>
      <span className="bg-primary-500 rounded-full px-3 py-1 text-sm font-semibold text-white">Room: {roomCode}</span>
    </div>
    <div className="flex items-center space-x-4">
      {battleState.isWaiting && (
        <>
          <button
            onClick={onStartBattle}
            className="rounded-full bg-green-500 px-6 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Start Battle
          </button>
          <div className="relative">
            <button
              onClick={onShowInvites}
              className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Invites ({pendingInvitesCount})
            </button>
            {pendingInvitesCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {pendingInvitesCount}
              </span>
            )}
          </div>
        </>
      )}
      <button onClick={onSoundToggle} className="text-xl">
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      <button onClick={onThemeToggle} className="text-xl">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button onClick={onLeave} className="rounded-full bg-red-500 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105">
        Leave
      </button>
    </div>
  </header>
);

const BattleLeftSidebar = ({ players, roundNumber, totalRounds, allUsers, currentUser, onInvitePlayer, battleState }: any) => (
  <aside className="w-1/4 p-4 border-r border-border overflow-y-auto">
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Players ({players.length})</h2>
      <div className="space-y-4">
        {players.map((player: Player) => (
          <div key={player.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-xl shadow-sm">
            <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-primary" />
            <div className="flex-1">
              <p className="font-semibold">{player.name}</p>
              <p className="text-sm text-muted-foreground">{player.grade}</p>
            </div>
            <span className={`text-lg font-bold ${player.isCorrect === true ? 'text-green-500' : player.isCorrect === false ? 'text-red-500' : 'text-gray-500'}`}>
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Game Info</h2>
      <p>Round: {roundNumber} / {totalRounds}</p>
    </div>
    {battleState.isWaiting && (
      <div>
        <h2 className="text-lg font-semibold mb-2">Invite Players</h2>
        <div className="space-y-2">
          {allUsers
            .filter((user: any) => user.id !== currentUser?.id)
            .map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`} alt={user.name} className="w-8 h-8 rounded-full" />
                  <p>{user.name}</p>
                </div>
                <button
                  onClick={() => onInvitePlayer(user)}
                  className="bg-primary text-white text-sm rounded-lg px-3 py-1 hover:bg-primary/90"
                >
                  Invite
                </button>
              </div>
            ))}
        </div>
      </div>
    )}
  </aside>
);

const BattleCenter = ({ question, selectedAnswer, timeRemaining, isAnswerLocked, onAnswerSelect, onLockIn, onClear, battleState, players }: any) => (
  <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2">Quiz Battle</h2>
      <p className="text-lg text-muted-foreground">Round {battleState.roundNumber} / {battleState.totalRounds}</p>
    </div>

    {battleState.isWaiting && (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">Waiting for players to join...</h3>
        <p className="text-lg">Share the room code: <span className="font-mono bg-muted p-1 rounded-md">{battleState.roomCode}</span></p>
      </div>
    )}

    {battleState.isActive && question && (
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-primary">Time Remaining: {timeRemaining}s</span>
          <span className="text-lg font-semibold text-primary">Difficulty: <span className="capitalize">{question.difficulty}</span></span>
        </div>
        <div className="mb-8">
          <p className="text-xl font-medium mb-4">{question.text}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map(choice => (
            <button
              key={choice}
              onClick={() => onAnswerSelect(choice)}
              disabled={isAnswerLocked}
              className={`p-4 rounded-lg text-left transition-colors duration-200 ${
                selectedAnswer === choice
                  ? 'bg-primary text-white border-2 border-primary-500'
                  : 'bg-muted/50 hover:bg-muted'
              } ${isAnswerLocked && selectedAnswer === choice ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            >
              <span className="font-bold mr-2">{choice}:</span> {question.choices[choice as 'A' | 'B' | 'C' | 'D']}
            </button>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={onLockIn}
            disabled={!selectedAnswer || isAnswerLocked}
            className={`px-6 py-3 rounded-full font-bold text-white transition-colors duration-200 ${
              !selectedAnswer || isAnswerLocked ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Lock In Answer
          </button>
          <button
            onClick={onClear}
            disabled={isAnswerLocked}
            className={`px-6 py-3 rounded-full font-bold text-white transition-colors duration-200 ${
              isAnswerLocked ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            Clear
          </button>
        </div>
      </div>
    )}
  </main>
);

const BattleRightSidebar = ({ chatMessages, leaderboard, onSendMessage, players, currentUser }: any) => {
  const [message, setMessage] = useState('');
  const handleMessageSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <aside className="w-1/4 p-4 border-l border-border flex flex-col overflow-hidden">
      <div className="mb-6 flex-1 flex flex-col overflow-hidden">
        <h2 className="text-lg font-semibold mb-2">Chat</h2>
        <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-muted rounded-xl shadow-inner">
          {chatMessages.map((msg: ChatMessage) => (
            <div key={msg.id} className={`text-sm ${msg.type === 'system' || msg.type === 'battle' ? 'italic text-muted-foreground' : ''}`}>
              <span className="font-semibold">{msg.playerName}:</span> {msg.message}
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMessageSubmit()}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleMessageSubmit}
            className="bg-primary text-white px-4 rounded-lg font-bold hover:bg-primary/90"
          >
            Send
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
        <div className="space-y-2">
          {leaderboard.map((player: any) => (
            <div key={player.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="font-medium">{player.rank}. {player.name}</span>
              <span className="font-bold text-lg">{player.score}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

const CountdownOverlay = ({ onComplete }: any) => (
  <div className="fixed inset-0 bg-black/80 text-white flex items-center justify-center z-50">
    <div className="text-center">
      <h2 className="text-6xl font-bold animate-pulse">Get Ready!</h2>
      {/* A simple countdown animation could be added here */}
      <div className="mt-4">
        <button onClick={onComplete} className="px-6 py-3 rounded-full bg-primary text-white text-lg font-bold hover:bg-primary/90">
          Start Now
        </button>
      </div>
    </div>
  </div>
);

const RoundResultsModal = ({ onClose, results }: any) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full text-center">
      <h3 className="text-2xl font-bold mb-4">Round {results.round} Results</h3>
      <div className="space-y-2 mb-6">
        <p className="text-lg">Your Answer: <span className="font-semibold">{results.selectedAnswer || 'Not Answered'}</span></p>
        <p className="text-lg">Correct Answer: <span className="font-semibold text-green-500">{results.correctAnswer}</span></p>
        <p className={`text-xl font-bold ${results.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {results.isCorrect ? 'You were correct!' : 'You were incorrect.'}
        </p>
      </div>
      <button onClick={onClose} className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90">
        Next Round
      </button>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function BattlePage() {
  const [roomCode] = useState('ABC123');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showRoundResults, setShowRoundResults] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Battle state
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    isWaiting: true,
    roundNumber: 1,
    totalRounds: 10,
    currentQuestion: null,
    roundStartTime: 0,
    roundEndTime: 0
  });

  // Real user data from localStorage
  const [players, setPlayers] = useState<Player[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [battleInvites, setBattleInvites] = useState<BattleInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBattleInviteModal, setShowBattleInviteModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedInviteUser, setSelectedInviteUser] = useState<any>(null);
  const [pendingInvites, setPendingInvites] = useState<BattleInvite[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', playerName: 'System', message: 'Welcome to the battle! Invite players to start.', timestamp: new Date(), type: 'system' },
  ]);

  // Generate leaderboard from current players
  const leaderboard = players
    .filter(player => player && player.name && typeof player.score === 'number' && !isNaN(player.score))
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      name: player.name || 'Unknown Player',
      score: Math.max(0, player.score || 0),
      rank: index + 1,
      grade: player.grade || 'Unknown'
    }));

  // Load real user data
  useEffect(() => {
    const savedCurrentUser = localStorage.getItem('currentUser');
    const savedAllUsers = localStorage.getItem('allUsers');
    
    if (savedCurrentUser) {
      const user = JSON.parse(savedCurrentUser);
      setCurrentUser(user);
      
      // Add current user as first player
      const currentPlayer: Player = {
        id: user.id,
        name: user.name,
        grade: user.grade || 'Unknown',
        score: typeof user.score === 'number' && !isNaN(user.score) ? user.score : 0,
        streak: 0,
        isOnline: true,
        isRealPlayer: true,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`
      };
      
      setPlayers([currentPlayer]);
    }
    
    if (savedAllUsers) {
      const users = JSON.parse(savedAllUsers);
      setAllUsers(users);
    }

    // Check for pending battle invites
    checkPendingInvites();
  }, []);

  const checkPendingInvites = useCallback(() => {
    const savedInvites = localStorage.getItem('battleInvites');
    if (savedInvites && currentUser) {
      const invites = JSON.parse(savedInvites);
      const pending = invites.filter((invite: BattleInvite) => 
        invite.toPlayerId === currentUser.id && invite.status === 'pending'
      );
      setPendingInvites(pending);
    }
  }, [currentUser]);

  // Load battle invites
  useEffect(() => {
    const savedInvites = localStorage.getItem('battleInvites');
    if (savedInvites) {
      const invites = JSON.parse(savedInvites);
      setBattleInvites(invites);
      // Filter pending invites for current user
      const pending = invites.filter((invite: BattleInvite) => 
        invite.toPlayerId === currentUser?.id && invite.status === 'pending'
      );
      setPendingInvites(pending);
    }
  }, [currentUser]);

  const handleTimeUp = useCallback(() => {
    setIsAnswerLocked(true);
    // Auto-submit or show results
    if (selectedAnswer) {
      handleLockIn();
    }
  }, [selectedAnswer]);

  useEffect(() => {
    // Mock question loading (replace with real questions later)
    const mockQuestion: Question = {
      id: '1',
      category: 'Mathematics',
      difficulty: 'medium',
      text: 'What is the value of x in the equation 2x + 5 = 13?',
      choices: {
        A: 'x = 3',
        B: 'x = 4',
        C: 'x = 5',
        D: 'x = 6',
      },
      correctAnswer: 'B',
      timeLimit: 30,
    };
    setCurrentQuestion(mockQuestion);
    setTimeRemaining(mockQuestion.timeLimit);
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && !isAnswerLocked && battleState.isActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !isAnswerLocked && battleState.isActive) {
      handleTimeUp();
    }
  }, [timeRemaining, isAnswerLocked, battleState.isActive, handleTimeUp]);

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!isAnswerLocked && battleState.isActive) {
      setSelectedAnswer(answer);
    }
  };

  const handleLockIn = () => {
    if (selectedAnswer && battleState.isActive) {
      setIsAnswerLocked(true);
      const answerTime = Date.now();
      
      // Update current player's answer
      setPlayers(prev => prev.map(player => 
        player.id === currentUser?.id 
          ? { 
              ...player, 
              currentAnswer: selectedAnswer, 
              isAnswerLocked: true, 
              answerTime,
              isCorrect: selectedAnswer === currentQuestion?.correctAnswer
            }
          : player
      ));

      // Check if all players have answered
      checkAllPlayersAnswered();
    }
  };

  const checkAllPlayersAnswered = () => {
    const allAnswered = players.every(player => player.isAnswerLocked);
    if (allAnswered) {
      // Calculate scores and show results
      calculateRoundScores();
    }
  };

  const calculateRoundScores = () => {
    const roundEndTime = Date.now();
    const roundDuration = roundEndTime - battleState.roundStartTime;
    
    // Find fastest correct answer
    let fastestCorrectPlayer: Player | null = null;
    let fastestTime = Infinity;
    
    players.forEach(player => {
      if (player.isCorrect && player.answerTime) {
        const answerTime = player.answerTime - battleState.roundStartTime;
        if (answerTime < fastestTime) {
          fastestTime = answerTime;
          fastestCorrectPlayer = player;
        }
      }
    });

    // Update scores: fastest correct gets +20, others get -20
    setPlayers(prev => prev.map(player => {
      if (player.isCorrect) {
        if (player.id === fastestCorrectPlayer?.id) {
          // Fastest correct answer: +20 points
          return { ...player, score: player.score + 20 };
        } else {
          // Other correct answers: -20 points
          return { ...player, score: Math.max(0, player.score - 20) };
        }
      } else {
        // Wrong answers: -20 points
        return { ...player, score: Math.max(0, player.score - 20) };
      }
    }));

    // Add battle messages
    const battleMessages: ChatMessage[] = [];
    
    if (fastestCorrectPlayer) {
      battleMessages.push({
        id: Date.now().toString(),
        playerName: 'System',
        message: `🏆 ${(fastestCorrectPlayer as Player).name} answered fastest and correctly! +20 points`,
        type: 'battle',
        timestamp: new Date()
      });
    }

    players.forEach(player => {
      if (player.isCorrect && player.id !== fastestCorrectPlayer?.id) {
        battleMessages.push({
          id: (Date.now() + Math.random()).toString(),
          playerName: 'System',
          message: `${player.name} answered correctly but not fastest. -20 points`,
          timestamp: new Date(),
          type: 'battle'
        });
      } else if (!player.isCorrect) {
        battleMessages.push({
          id: (Date.now() + Math.random()).toString(),
          playerName: 'System',
          message: `${player.name} answered incorrectly. -20 points`,
          timestamp: new Date(),
          type: 'battle'
        });
      }
    });

    setChatMessages(prev => [...prev, ...battleMessages]);

    // Show round results
    setShowRoundResults(true);
  };

  const handleClear = () => {
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
  };

  const handleLeaveRoom = () => {
    // Replaced `confirm` with an alert as per instructions. In a real app, use a custom modal.
    // window.confirm('Are you sure you want to leave the battle?')
    alert('Are you sure you want to leave the battle?');
    mockRouter.push('/');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Battle invitation functions
  const invitePlayer = (user: any) => {
    setSelectedInviteUser(user);
    setShowInviteModal(true);
  };

  const sendBattleInvite = () => {
    if (!selectedInviteUser || !inviteMessage.trim()) return;

    const newInvite: BattleInvite = {
      id: Date.now().toString(),
      fromPlayer: currentUser.name,
      fromPlayerId: currentUser.id,
      toPlayer: selectedInviteUser.name,
      toPlayerId: selectedInviteUser.id,
      status: 'pending',
      timestamp: new Date(),
      roomCode: roomCode
    };

    // Save invite to localStorage
    const updatedInvites = [...battleInvites, newInvite];
    setBattleInvites(updatedInvites);
    localStorage.setItem('battleInvites', JSON.stringify(updatedInvites));

    // Add system message to chat
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      playerName: 'System',
      message: `📨 Battle invite sent to ${selectedInviteUser.name} (${selectedInviteUser.grade})`,
      timestamp: new Date(),
      type: 'system'
    };

    setChatMessages(prev => [...prev, systemMessage]);

    setShowInviteModal(false);
    setInviteMessage('');
    setSelectedInviteUser(null);

    // Show success message and redirect to home after 2 seconds
    // Replaced `alert` with a simple console log as per instructions. In a real app, use a custom modal.
    setTimeout(() => {
      console.log(`✅ Battle invite sent to ${selectedInviteUser.name}! They will be notified.`);
      // Redirect logic removed since this is a single component
    }, 2000);
  };

  const acceptBattleInvite = (invite: BattleInvite) => {
    // Check if user already has an active battle
    // Replaced `alert` with a simple console log. In a real app, use a custom modal.
    const hasActiveBattle = localStorage.getItem('activeBattle');
    if (hasActiveBattle) {
      console.log('❌ You already have an active battle! Please finish your current battle first.');
      return;
    }

    // Update invite status
    const updatedInvites = battleInvites.map(inv => 
      inv.id === invite.id ? { ...inv, status: 'accepted' as const } : inv
    );
    setBattleInvites(updatedInvites);
    localStorage.setItem('battleInvites', JSON.stringify(updatedInvites));

    // Add player to battle
    const invitedUser = allUsers.find(user => user.id === invite.fromPlayerId);
    if (invitedUser) {
      const newPlayer: Player = {
        id: invitedUser.id,
        name: invitedUser.name,
        grade: invitedUser.grade || 'Unknown',
        score: typeof invitedUser.score === 'number' && !isNaN(invitedUser.score) ? invitedUser.score : 0,
        streak: 0,
        isOnline: true,
        isRealPlayer: true,
        avatar: invitedUser.avatar || `https://ui-avatars.com/api/?name=${invitedUser.name}&background=random&color=fff&size=128`
      };

      setPlayers(prev => [...prev, newPlayer]);

      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: 'System',
        message: `🎉 ${invitedUser.name} (${invitedUser.grade}) joined the battle!`,
        timestamp: new Date(),
        type: 'system'
      };

      setChatMessages(prev => [...prev, systemMessage]);
    }

    // Remove from pending invites
    setPendingInvites(prev => prev.filter(inv => inv.id !== invite.id));
    setShowBattleInviteModal(false);
  };

  const declineBattleInvite = (invite: BattleInvite) => {
    // Update invite status
    const updatedInvites = battleInvites.map(inv => 
      inv.id === invite.id ? { ...inv, status: 'declined' as const } : inv
    );
    setBattleInvites(updatedInvites);
    localStorage.setItem('battleInvites', JSON.stringify(updatedInvites));

    // Remove from pending invites
    setPendingInvites(prev => prev.filter(inv => inv.id !== invite.id));
    setShowBattleInviteModal(false);
  };

  const startBattle = () => {
    if (players.length !== 2) {
      // Replaced `alert` with a simple console log. In a real app, use a custom modal.
      console.log('❌ Need exactly 2 players to start a battle!');
      return;
    }

    setBattleState(prev => ({
      ...prev,
      isActive: true,
      isWaiting: false,
      roundStartTime: Date.now()
    }));

    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      playerName: 'System',
      message: '🎯 Battle started! Get ready for the first question!',
      timestamp: new Date(),
      type: 'battle'
    };

    setChatMessages(prev => [...prev, systemMessage]);
    setShowCountdown(true);
  };

  const nextRound = () => {
    if (roundNumber < totalRounds) {
      setRoundNumber(prev => prev + 1);
      setBattleState(prev => ({
        ...prev,
        roundNumber: prev.roundNumber + 1,
        roundStartTime: Date.now()
      }));

      // Reset for next round
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
      setTimeRemaining(30);
      setShowRoundResults(false);

      // Reset player answers
      setPlayers(prev => prev.map(player => ({
        ...player,
        currentAnswer: undefined,
        isAnswerLocked: false,
        answerTime: undefined,
        isCorrect: undefined
      })));

      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: 'System',
        message: `🎯 Round ${roundNumber + 1} starting!`,
        timestamp: new Date(),
        type: 'battle'
      };

      setChatMessages(prev => [...prev, systemMessage]);
    } else {
      // Battle finished
      endBattle();
    }
  };

  const endBattle = () => {
    setBattleState(prev => ({
      ...prev,
      isActive: false,
      isWaiting: true
    }));

    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      playerName: 'System',
      message: '🏁 Battle finished! Check the final leaderboard!',
      timestamp: new Date(),
      type: 'battle'
    };

    setChatMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Countdown Overlay */}
      {showCountdown && (
        <CountdownOverlay 
          onComplete={() => {
            setShowCountdown(false);
            setBattleState(prev => ({ ...prev, roundStartTime: Date.now() }));
          }}
        />
      )}

      {/* Round Results Modal */}
      {showRoundResults && (
        <RoundResultsModal 
          onClose={nextRound}
          results={{
            round: roundNumber,
            correctAnswer: currentQuestion?.correctAnswer || 'A',
            selectedAnswer,
            isCorrect: selectedAnswer === currentQuestion?.correctAnswer,
            pointsEarned: selectedAnswer === currentQuestion?.correctAnswer ? 20 : -20,
            timeBonus: 0,
          }}
        />
      )}

      {/* Battle Invite Modal */}
      {showInviteModal && selectedInviteUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Invite to Battle</h3>
              <p className="text-sm text-muted-foreground">
                Send a battle invitation to <span className="font-medium text-primary">{selectedInviteUser.name}</span> ({selectedInviteUser.grade})
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey! Want to join this MCQ battle?"
                  className="w-full p-3 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {inviteMessage.length}/200
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={sendBattleInvite}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="mr-2">📨</span>
                Send Invite
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteMessage('');
                  setSelectedInviteUser(null);
                }}
                className="flex-1 bg-muted text-muted-foreground py-3 rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Battle Invites Modal */}
      {showBattleInviteModal && pendingInvites.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Battle Invites</h3>
              <p className="text-sm text-muted-foreground">You have pending battle invitations</p>
            </div>

            <div className="space-y-4 mb-6">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{invite.fromPlayer}</span>
                    <span className="text-sm text-muted-foreground">Room: {invite.roomCode}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Invited you to join a battle
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptBattleInvite(invite)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => declineBattleInvite(invite)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      ❌ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowBattleInviteModal(false)}
              className="w-full bg-muted text-muted-foreground py-3 rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Battle Layout */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <BattleHeader
          roomCode={roomCode}
          onThemeToggle={toggleTheme}
          onSoundToggle={toggleSound}
          onLeave={handleLeaveRoom}
          soundEnabled={soundEnabled}
          theme={theme}
          battleState={battleState}
          onStartBattle={startBattle}
          onShowInvites={() => setShowBattleInviteModal(true)}
          pendingInvitesCount={pendingInvites.length}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <BattleLeftSidebar
            players={players}
            roundNumber={roundNumber}
            totalRounds={totalRounds}
            currentQuestion={currentQuestion}
            allUsers={allUsers}
            currentUser={currentUser}
            onInvitePlayer={invitePlayer}
            battleState={battleState}
          />

          {/* Center Content */}
          <BattleCenter
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            timeRemaining={timeRemaining}
            isAnswerLocked={isAnswerLocked}
            onAnswerSelect={handleAnswerSelect}
            onLockIn={handleLockIn}
            onClear={handleClear}
            battleState={battleState}
            players={players}
          />

          {/* Right Sidebar */}
          <BattleRightSidebar
            chatMessages={chatMessages}
            leaderboard={leaderboard}
            onSendMessage={(message: string) => {
              // Handle sending message
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                playerName: currentUser?.name || 'Unknown',
                message,
                timestamp: new Date(),
                type: 'chat'
              };
              setChatMessages(prev => [...prev, newMessage]);
            }}
            players={players}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );

} 





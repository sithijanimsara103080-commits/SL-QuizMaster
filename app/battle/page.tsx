'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BattleHeader from './components/BattleHeader';
import BattleLeftSidebar from './components/BattleLeftSidebar';
import BattleCenter from './components/BattleCenter';
import BattleRightSidebar from './components/BattleRightSidebar';
import CountdownOverlay from './components/CountdownOverlay';
import RoundResultsModal from './components/RoundResultsModal';


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

export default function BattlePage() {
  const router = useRouter();
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

  // Check for pending battle invites
  const checkPendingInvites = () => {
    const savedInvites = localStorage.getItem('battleInvites');
    if (savedInvites && currentUser) {
      const invites = JSON.parse(savedInvites);
      const pending = invites.filter((invite: BattleInvite) => 
        invite.toPlayerId === currentUser.id && invite.status === 'pending'
      );
      setPendingInvites(pending);
    }
  };

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
  }, [timeRemaining, isAnswerLocked, battleState.isActive]);

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

  const handleTimeUp = () => {
    setIsAnswerLocked(true);
    // Auto-submit or show results
    if (selectedAnswer) {
      handleLockIn();
    }
  };

  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave the battle?')) {
      // Navigate back to home or lobby
      router.push('/');
    }
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
    setTimeout(() => {
      alert(`✅ Battle invite sent to ${selectedInviteUser.name}! They will be notified.`);
      router.push('/');
    }, 2000);
  };

  const acceptBattleInvite = (invite: BattleInvite) => {
    // Check if user already has an active battle
    const hasActiveBattle = localStorage.getItem('activeBattle');
    if (hasActiveBattle) {
      alert('❌ You already have an active battle! Please finish your current battle first.');
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
      alert('❌ Need exactly 2 players to start a battle!');
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


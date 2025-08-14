# MCQ Battle App

A real-time multiplayer MCQ (Multiple Choice Question) battle application built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Battle System
- **Real-time multiplayer battles** - Players can join battles and compete in real-time
- **Battle state management** - Players cannot start another battle while in one
- **Accept/Join functionality** - Players can accept battle invites and join existing battles
- **Grade compatibility** - Any grade player can play with any grade player

### Scoring System
- **Speed-based scoring** - Fastest correct answer gets +20 points
- **Penalty system** - Other players get -20 points (correct or incorrect)
- **Real-time leaderboard** - Live updates of player scores and rankings

### Player Management
- **Player invites** - Send battle invitations to other users
- **Random AI opponents** - Add AI players for practice battles
- **Player status tracking** - See who has answered, who is thinking, and current scores
- **Grade display** - All players show their grade level

### Battle Interface
- **Question display** - Clear presentation of MCQ questions with choices
- **Answer selection** - Easy-to-use answer selection interface
- **Timer system** - Countdown timer for each question
- **Player answers** - See what other players have answered
- **Battle chat** - Real-time communication during battles

### Round Management
- **Round progression** - Track current round and total rounds
- **Round results** - Detailed results showing all players' performance
- **Score updates** - Real-time score updates after each round
- **Battle completion** - End-of-battle summary and final rankings

## How to Use

### Starting a Battle
1. Navigate to the Battle page
2. Invite players or add random AI opponents
3. Click "Start Battle" when ready
4. Answer questions within the time limit

### Joining a Battle
1. Check for pending battle invites
2. Accept or decline invitations
3. Join the battle room
4. Wait for the battle to start

### Battle Rules
- Each question has a time limit
- First correct answer gets +20 points
- All other players get -20 points
- Battle continues for multiple rounds
- Final winner is determined by total score

### Player Grades
- Players from any grade can participate together
- Grade information is displayed for all players
- No grade restrictions on battle participation

## Technical Details

### Technologies Used
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks and localStorage

### Key Components
- `BattlePage` - Main battle controller
- `BattleHeader` - Battle status and controls
- `BattleLeftSidebar` - Player management and round info
- `BattleCenter` - Question display and answer interface
- `BattleRightSidebar` - Chat and leaderboard
- `RoundResultsModal` - Round results and scoring

### Data Flow
1. Battle state managed in main component
2. Player answers tracked in real-time
3. Scoring calculated after all players answer
4. Results displayed in modal
5. Scores updated and next round begins

## Future Enhancements
- Real-time WebSocket connections
- More question categories and difficulty levels
- Power-ups and special abilities
- Tournament mode
- Spectator mode
- Replay system

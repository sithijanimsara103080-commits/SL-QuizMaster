'use client';

interface RoundResults {
  round: number;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  pointsEarned: number;
  timeBonus: number;
}

interface RoundResultsModalProps {
  results: RoundResults;
  onClose: () => void;
}

export default function RoundResultsModal({ results, onClose }: RoundResultsModalProps) {
  const totalPoints = results.pointsEarned + results.timeBonus;

  const getAnswerLabel = (answer: 'A' | 'B' | 'C' | 'D') => {
    return answer;
  };

  const getResultEmoji = () => {
    if (results.isCorrect) {
      return '🎉';
    }
    return '😔';
  };

  const getResultMessage = () => {
    if (results.isCorrect) {
      return 'Correct! 🎯';
    }
    return 'Incorrect! ❌';
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getResultEmoji()}</div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            {getResultMessage()}
          </h2>
          <p className="text-xl text-muted-foreground">
            Round {results.round} Complete 🏁
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Answer Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">📝 Your Answer</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Selected:</span>
                <span className={`font-bold text-lg ${
                  results.selectedAnswer ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {results.selectedAnswer ? getAnswerLabel(results.selectedAnswer) : 'None'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                <span className="text-sm text-green-700">✅ Correct:</span>
                <span className="font-bold text-lg text-green-700">
                  {getAnswerLabel(results.correctAnswer)}
                </span>
              </div>
            </div>
          </div>

          {/* Points Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">🏆 Points Earned</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm text-muted-foreground">Battle Points:</span>
                </div>
                <span className={`font-bold text-lg ${results.pointsEarned > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.pointsEarned > 0 ? '+' : ''}{results.pointsEarned}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⏰</span>
                  <span className="text-sm text-blue-700">Time Bonus:</span>
                </div>
                <span className="font-bold text-lg text-blue-700">
                  +{results.timeBonus}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-primary/30">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span className="text-lg font-semibold text-primary">Total:</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent/30 rounded-full">
            <span className="text-sm font-medium text-accent-foreground">
              {results.isCorrect ? '🚀 Great job!' : '💪 Keep practicing!'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            🚀 Continue to Next Round
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground">
            <span>🎯 Accuracy: {results.isCorrect ? '100%' : '0%'}</span>
            <span>•</span>
            <span>⏰ Time Bonus: {results.timeBonus}s</span>
            <span>•</span>
            <span>🏆 Total Points: {totalPoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
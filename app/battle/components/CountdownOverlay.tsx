'use client';

import { useState, useEffect } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
  initialCount?: number;
}

export default function CountdownOverlay({ 
  onComplete, 
  initialCount = 5 
}: CountdownOverlayProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  const getCountdownText = () => {
    if (count > 3) return 'Get Ready!';
    if (count > 1) return 'Get Set!';
    if (count === 1) return 'Go!';
    return '';
  };

  const getCountdownColor = () => {
    if (count > 3) return 'text-blue-500';
    if (count > 1) return 'text-yellow-500';
    if (count === 1) return 'text-green-500';
    return 'text-primary';
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Countdown Number */}
        <div className={`text-9xl font-bold ${getCountdownColor()} animate-pulse`}>
          {count}
        </div>
        
        {/* Countdown Text */}
        <div className="space-y-4">
          <h2 className={`text-4xl font-bold ${getCountdownColor()}`}>
            {getCountdownText()}
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Round starting in {count} second{count !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className={`${getCountdownColor()} transition-all duration-1000 ease-out`}
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - count / initialCount)}`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round((count / initialCount) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Battle Instructions */}
        <div className="max-w-md mx-auto p-4 bg-card border border-border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Battle Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li>• Read questions carefully</li>
            <li>• Use power-ups strategically</li>
            <li>• Chat with other players</li>
            <li>• Watch the leaderboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
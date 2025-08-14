'use client';

import { useState, useEffect } from 'react';

interface BanCountdownProps {
  bannedUntil: string;
  onExpire?: () => void;
}

export default function BanCountdown({ bannedUntil, onExpire }: BanCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const banEnd = new Date(bannedUntil).getTime();
      const difference = banEnd - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [bannedUntil, onExpire, mounted]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1 py-0.5 rounded">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-xs">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
            {timeLeft.days}d
          </span>
          <span className="text-gray-400">:</span>
        </>
      )}
      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
        {formatTime(timeLeft.hours)}h
      </span>
      <span className="text-gray-400">:</span>
      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
        {formatTime(timeLeft.minutes)}m
      </span>
      <span className="text-gray-400">:</span>
      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 py-0.5 rounded">
        {formatTime(timeLeft.seconds)}s
      </span>
    </div>
  );
} 
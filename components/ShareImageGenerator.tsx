
'use client';

interface ShareImageProps {
  name: string;
  rank: number;
  score: number;
  grade: string;
  subject?: string;
  isChampion?: boolean;
}

export function generateShareImage({ name, rank, score, grade, subject, isChampion }: ShareImageProps): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size
  canvas.width = 800;
  canvas.height = 650;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#8B5CF6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // White content area
  ctx.fillStyle = 'white';
  ctx.roundRect(50, 50, canvas.width - 100, canvas.height - 100, 20);
  ctx.fill();
  
  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QuizMaster', canvas.width / 2, 150);
  
  // Champion badge
  if (isChampion) {
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🏆 CHAMPION! 🏆', canvas.width / 2, 190);
  }
  
  // Name
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(name, canvas.width / 2, 250);
  
  // Rank
  ctx.fillStyle = '#3B82F6';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(`#${rank}`, canvas.width / 2, 350);
  
  // Grade and Subject
  ctx.fillStyle = '#6B7280';
  ctx.font = '28px Arial';
  const gradeText = subject ? `${grade} - ${subject}` : grade;
  ctx.fillText(gradeText, canvas.width / 2, 390);
  
  // Score
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 42px Arial';
  ctx.fillText(`${score} Points`, canvas.width / 2, 450);
  
  // App link
  ctx.fillStyle = '#8B5CF6';
  ctx.font = '22px Arial';
  ctx.fillText('Join at: ' + window.location.origin, canvas.width / 2, 500);
  
  // Footer
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '20px Arial';
  ctx.fillText('Join the quiz competition!', canvas.width / 2, 540);
  
  return canvas.toDataURL('image/png');
}

// Helper function to add rounded rectangle
declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
  }
}

if (typeof window !== 'undefined' && CanvasRenderingContext2D.prototype.roundRect === undefined) {
  CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
  };
}

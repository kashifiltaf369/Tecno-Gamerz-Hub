'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { LevelInfo } from '@tecno-gamerz/types';
import { formatXp } from '@tecno-gamerz/utils';
import { Star, Zap } from 'lucide-react';

interface XpProgressBarProps {
  levelInfo: LevelInfo;
  totalXp: number;
  showDetails?: boolean;
  className?: string;
}

export default function XpProgressBar({ 
  levelInfo, 
  totalXp, 
  showDetails = true, 
  className = '' 
}: XpProgressBarProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Level and XP Display */}
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gaming-neon" />
            <span className="font-semibold text-lg">
              Level {levelInfo.currentLevel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-gaming-electric" />
            <span>{formatXp(totalXp)} XP</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={levelInfo.progressPercentage} 
          className="h-3 bg-background/50"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatXp(levelInfo.currentXp)} XP</span>
          <span>
            {levelInfo.xpToNextLevel > 0 
              ? `${formatXp(levelInfo.xpToNextLevel)} to Level ${levelInfo.currentLevel + 1}`
              : 'Max Level'
            }
          </span>
        </div>
      </div>

      {/* Level Progress Stats */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gaming-neon/10 rounded-lg border border-gaming-neon/20">
            <p className="text-gaming-neon font-semibold">{levelInfo.progressPercentage}%</p>
            <p className="text-muted-foreground text-xs">Progress</p>
          </div>
          <div className="text-center p-2 bg-gaming-electric/10 rounded-lg border border-gaming-electric/20">
            <p className="text-gaming-electric font-semibold">
              {levelInfo.xpToNextLevel > 0 ? formatXp(levelInfo.xpToNextLevel) : 'MAX'}
            </p>
            <p className="text-muted-foreground text-xs">To Next Level</p>
          </div>
        </div>
      )}
    </div>
  );
}
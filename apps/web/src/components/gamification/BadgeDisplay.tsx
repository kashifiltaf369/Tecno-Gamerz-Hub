'use client';

import React from 'react';
import { Badge as BadgeData, BadgeType } from '@tecno-gamerz/types';
import { BADGE_DEFINITIONS, getBadgeRarity } from '@tecno-gamerz/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeDisplayProps {
  badges: BadgeData[];
  showAllBadges?: boolean;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BadgeDisplay({ 
  badges, 
  showAllBadges = false, 
  maxDisplay = 3,
  size = 'md',
  className = '' 
}: BadgeDisplayProps) {
  const displayBadges = showAllBadges ? badges : badges.slice(0, maxDisplay);
  const hiddenCount = badges.length - maxDisplay;

  const getBadgeStyle = (badgeType: BadgeType) => {
    const rarity = getBadgeRarity(badgeType);
    
    switch (rarity) {
      case 'common':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'rare':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gaming-neon/20 text-gaming-neon border-gaming-neon/30';
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  if (badges.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-muted-foreground text-sm">
          🎮 No badges earned yet
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Participate in tournaments to earn badges!
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {displayBadges.map((badge, index) => (
          <Tooltip key={`${badge.type}-${index}`}>
            <TooltipTrigger>
              <Badge 
                className={`${getBadgeStyle(badge.type)} ${getBadgeSize()} flex items-center gap-1 cursor-help`}
              >
                <span className="text-base" role="img" aria-label={badge.name}>
                  {badge.icon}
                </span>
                <span>{badge.name}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground">
                  Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {!showAllBadges && hiddenCount > 0 && (
          <Badge variant="outline" className={getBadgeSize()}>
            +{hiddenCount} more
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}

// Component for displaying all available badges (including unearned ones)
interface AllBadgesGridProps {
  earnedBadges: BadgeData[];
  className?: string;
}

export function AllBadgesGrid({ earnedBadges, className = '' }: AllBadgesGridProps) {
  const earnedBadgeTypes = earnedBadges.map(badge => badge.type);
  const allBadgeTypes: BadgeType[] = ['rookie', 'contender', 'champion', 'tecno-fan'];

  const getBadgeStyle = (badgeType: BadgeType, isEarned: boolean) => {
    if (!isEarned) {
      return 'bg-muted/20 text-muted-foreground border-muted/30 opacity-50';
    }
    
    const rarity = getBadgeRarity(badgeType);
    
    switch (rarity) {
      case 'common':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'rare':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gaming-neon/20 text-gaming-neon border-gaming-neon/30';
    }
  };

  return (
    <TooltipProvider>
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
        {allBadgeTypes.map((badgeType) => {
          const isEarned = earnedBadgeTypes.includes(badgeType);
          const badgeDefinition = BADGE_DEFINITIONS[badgeType];
          const earnedBadge = earnedBadges.find(b => b.type === badgeType);
          
          return (
            <Tooltip key={badgeType}>
              <TooltipTrigger>
                <div className={`
                  p-4 rounded-lg border text-center space-y-2 cursor-help transition-all
                  ${getBadgeStyle(badgeType, isEarned)}
                  ${isEarned ? 'hover:scale-105' : 'hover:opacity-75'}
                `}>
                  <div className="text-3xl" role="img" aria-label={badgeDefinition.name}>
                    {badgeDefinition.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{badgeDefinition.name}</p>
                    {isEarned && earnedBadge && (
                      <p className="text-xs opacity-75">
                        {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{badgeDefinition.name}</p>
                  <p className="text-sm text-muted-foreground">{badgeDefinition.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Criteria: {badgeDefinition.criteria}
                  </p>
                  {isEarned && earnedBadge && (
                    <p className="text-xs text-gaming-neon">
                      ✅ Earned on {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-xs text-muted-foreground">
                      🔒 Not earned yet
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
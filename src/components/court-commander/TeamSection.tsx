"use client";

import { useMemo } from 'react';
import { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayerCard } from './PlayerCard';
import { Swords, Trophy, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamSectionProps {
  team: Team;
  onRemovePlayer: (playerId: string) => void;
  onEditPlayer: (playerId: string) => void;
  isChampion?: boolean;
  className?: string;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  draggedPlayerId?: string | null;
  dragOverPlayerId?: string | null;
}

export function TeamSection({ 
  team, 
  onRemovePlayer, 
  onEditPlayer, 
  isChampion, 
  className,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  draggedPlayerId,
  dragOverPlayerId
}: TeamSectionProps) {
  const avgWinRate = useMemo(() => {
    if (team.players.length === 0) return 0;
    const totalWinRate = team.players.reduce((sum, p) => sum + p.winRate, 0);
    return totalWinRate / team.players.length;
  }, [team.players]);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500 glass",
      isChampion ? "border-accent/30 bg-accent/5 shadow-[0_0_30px_rgba(245,158,11,0.2)]" : "border-white/5",
      className
    )}>
      <CardHeader className="relative pb-2 z-10">
        {isChampion && <Crown className="absolute top-4 right-4 h-6 w-6 text-accent animate-bounce" />}
        <CardTitle className={cn(
          "flex items-center gap-2 text-2xl font-black tracking-tighter",
          isChampion ? "text-accent" : "text-primary"
        )}>
          {isChampion ? "CAMPEONES" : team.name}
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground flex items-center gap-2">
          Promedio Winrate: <span className="text-foreground font-bold">{(avgWinRate * 100).toFixed(0)}%</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        {team.players.length > 0 ? (
          team.players.map(p => (
            <PlayerCard 
              key={p.id} 
              player={p} 
              onRemove={onRemovePlayer} 
              onEdit={onEditPlayer}
              isChampion={isChampion}
              draggable={true}
              onDragStart={(e) => onDragStart?.(e, p.id)}
              onDragEnter={(e) => onDragEnter?.(e, p.id)}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop?.(e, p.id)}
              isDragging={draggedPlayerId === p.id}
              isDraggingOver={dragOverPlayerId === p.id && draggedPlayerId !== p.id}
            />
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl opacity-40">
            <p className="text-sm italic">Esperando jugadores...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

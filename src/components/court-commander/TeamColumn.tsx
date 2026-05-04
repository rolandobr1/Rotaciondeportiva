"use client";

import React, { useMemo } from 'react';
import type { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Swords } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { cn } from '@/lib/utils';

interface TeamColumnProps {
  team: Team;
  swapTeam: 'A' | 'B';
  onRemovePlayer: (playerId: string) => void;
  onEditPlayer: (playerId: string) => void;
  onSwapPlayer?: (playerId: string, team: 'A' | 'B') => void;
  teamType: 'A' | 'B';
}

export const TeamColumn = React.memo(({ team, swapTeam, onRemovePlayer, onEditPlayer, onSwapPlayer, teamType }: TeamColumnProps) => {
  const avgWinRate = useMemo(() => {
    if (team.players.length === 0) return 0;
    const totalWinRate = team.players.reduce((sum, p) => sum + p.winRate, 0);
    return totalWinRate / team.players.length;
  }, [team.players]);

  return (
    <Card className={cn(
      "flex-1 min-w-0 bg-slate-800/90 border border-slate-700/70 shadow-xl shadow-black/10 backdrop-blur-sm",
      teamType === 'A' ? "border-sky-500/50" : "border-orange-500/50"
    )}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className={cn(
            "flex items-center gap-2 text-2xl",
            teamType === 'A' ? "text-sky-300" : "text-orange-300"
          )}>
            <Swords /> {team.name}
          </CardTitle>
          <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs uppercase tracking-[0.15em] text-slate-300">
            {team.players.length}/5
          </span>
        </div>
        <CardDescription className="text-slate-400">Tasa de Vic. Prom.: {(avgWinRate * 100).toFixed(0)}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {team.players.length > 0 ? (
          team.players.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              onRemove={() => onRemovePlayer(p.id)}
              onEdit={onEditPlayer}
              onSwap={onSwapPlayer ? () => onSwapPlayer(p.id, swapTeam) : undefined}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 py-8">Añade jugadores a este equipo</div>
        )}
      </CardContent>
    </Card>
  );
});
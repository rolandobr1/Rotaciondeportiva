"use client";

import React, { useMemo } from 'react';
import type { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Swords } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

interface TeamColumnProps {
  team: Team;
  onRemovePlayer: (playerId: string) => void;
  onEditPlayer: (playerId: string) => void;
}

export const TeamColumn = React.memo(({ team, onRemovePlayer, onEditPlayer }: TeamColumnProps) => {
  const avgWinRate = useMemo(() => {
    if (team.players.length === 0) return 0;
    const totalWinRate = team.players.reduce((sum, p) => sum + p.winRate, 0);
    return totalWinRate / team.players.length;
  }, [team.players]);

  return (
    <Card className="flex-1 min-w-0 bg-slate-800/80 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-sky-400">
          <div className="flex items-center gap-3">
            <Swords /> {team.name}
          </div>
        </CardTitle>
        <CardDescription className="text-slate-400">Tasa de Vic. Prom.: {(avgWinRate * 100).toFixed(0)}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {team.players.length > 0 ? (
          team.players.map(p => <PlayerCard key={p.id} player={p} onRemove={() => onRemovePlayer(p.id)} onEdit={onEditPlayer} />)
        ) : (
          <div className="text-center text-slate-500 py-8">Añade jugadores a este equipo</div>
        )}
      </CardContent>
    </Card>
  );
});
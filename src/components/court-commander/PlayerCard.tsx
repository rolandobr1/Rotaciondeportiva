"use client";

import { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Pencil, ChevronUp, ChevronDown, MoreVertical, ChevronsUp, ChevronsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  onAssign?: (id: string, team: 'A' | 'B') => void;
  isChampion?: boolean;
  turn?: number;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  isDraggingOver?: boolean;
  onEdit?: (id: string) => void;
  onMoveInWaitingList?: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  isFirstInList?: boolean;
  isLastInList?: boolean;
  justMoved?: boolean;
}

export function PlayerCard({
  player,
  onRemove,
  onAssign,
  isChampion,
  turn,
  draggable,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDraggingOver,
  onEdit,
  onMoveInWaitingList,
  isFirstInList,
  isLastInList,
  justMoved
}: PlayerCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 glass",
        isChampion ? "border-accent/40 bg-accent/10 neon-glow-accent" : "hover:bg-white/5",
        justMoved && "ring-2 ring-primary/50",
        isDragging && "opacity-40",
        isDraggingOver && "translate-y-1 scale-[1.02] border-primary"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {draggable && <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />}
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <p className={cn("font-bold truncate text-lg", isChampion ? "text-accent" : "text-foreground")}>
              {turn && <span className="mr-2 text-muted-foreground font-normal text-sm">{turn}.</span>}
              {player.name}
            </p>
            {onEdit && (
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEdit(player.id)}>
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{player.wins}</span>V / 
              <span className="text-rose-400 font-bold">{player.losses}</span>D
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{(player.winRate * 100).toFixed(0)}% Winrate</span>
            {player.consecutiveWins > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-accent font-bold">Racha: {player.consecutiveWins}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        {onAssign && (
          <div className="flex items-center glass rounded-lg overflow-hidden border-white/5">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 font-bold text-primary hover:bg-primary hover:text-primary-foreground" 
              onClick={() => onAssign(player.id, 'A')}
            >
              A
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 font-bold text-accent hover:bg-accent hover:text-accent-foreground" 
              onClick={() => onAssign(player.id, 'B')}
            >
              B
            </Button>
          </div>
        )}

        {onMoveInWaitingList && (
          <div className="flex items-center">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onMoveInWaitingList(player.id, 'up')} disabled={isFirstInList}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onMoveInWaitingList(player.id, 'down')} disabled={isLastInList}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/10">
                <DropdownMenuItem onClick={() => onMoveInWaitingList(player.id, 'top')} className="focus:bg-primary/20">
                  <ChevronsUp className="mr-2 h-4 w-4" />
                  <span>Subir al principio</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveInWaitingList(player.id, 'bottom')} className="focus:bg-primary/20">
                  <ChevronsDown className="mr-2 h-4 w-4" />
                  <span>Bajar al final</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {onRemove && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={() => onRemove(player.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

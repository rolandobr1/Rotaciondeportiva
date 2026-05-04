"use client";

import React from 'react';
import { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2, ChevronUp, ChevronDown, MoreVertical, ChevronsUp, ChevronsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  onAssign?: (id: string, team: 'A' | 'B') => void;
  onSwap?: (id: string) => void;
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

export const PlayerCard = React.memo(({
  player,
  onRemove,
  onAssign,
  onSwap,
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
}: PlayerCardProps) => (
  <div
    role="group"
    aria-roledescription="player card"
    draggable={draggable}
    onDragStart={onDragStart}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
    className={cn(
      "relative min-w-0 flex items-center justify-between gap-3 rounded-2xl border border-slate-700/40 bg-slate-800/95 p-4 shadow-xl shadow-black/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl focus-within:ring-2 focus-within:ring-sky-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-950",
      isChampion ? "bg-amber-500/95 text-slate-950" : justMoved ? "bg-sky-600/95" : "bg-slate-700/95",
      draggable && "cursor-grab",
      isDragging && "opacity-50",
      isDraggingOver && "ring-2 ring-sky-400"
    )}
    aria-label={`Jugador ${player.name}, victorias ${player.wins}, derrotas ${player.losses}, racha ${player.consecutiveWins}`}
  >
    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
      {draggable && <GripVertical className="h-5 w-5 text-slate-400 shrink-0" />}
      <div className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-semibold text-lg sm:truncate", isChampion ? "text-slate-950" : "text-sky-300")}>
            {turn && <span className="mr-2 text-slate-400 font-normal">{turn}.</span>}
            {player.name}
          </p>
          {isChampion && (
            <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-100">
              Campeón
            </span>
          )}
          {onEdit && (
            <Button size="icon" variant="ghost" className={cn("h-6 w-6 shrink-0 p-0", isChampion ? "text-black hover:text-slate-700" : "text-slate-400 hover:text-white")} onClick={() => onEdit(player.id)} aria-label={`Editar ${player.name}`}>
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className={cn("text-xs flex gap-2", isChampion ? "text-slate-800" : "text-slate-400")}>
          <span className="bg-slate-700 px-2 py-1 rounded text-xs">V: {player.wins}</span>
          <span className="bg-slate-700 px-2 py-1 rounded text-xs">D: {player.losses}</span>
          <span className={cn("px-2 py-1 rounded text-xs font-bold", player.consecutiveWins > 0 ? (isChampion ? 'bg-white text-slate-950' : 'bg-amber-500 text-slate-950') : 'bg-slate-700')}>R: {player.consecutiveWins}</span>
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      {onAssign && (
        <div className="flex items-center">
          <Button size="icon" variant="ghost" className="h-7 w-7 font-bold text-sky-400 hover:bg-sky-600 hover:text-white" onClick={() => onAssign(player.id, 'A')} aria-label={`Asignar ${player.name} al Equipo A`}>A</Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 font-bold text-amber-400 hover:bg-amber-500 hover:text-white" onClick={() => onAssign(player.id, 'B')} aria-label={`Asignar ${player.name} al Equipo B`}>B</Button>
        </div>
      )}
      {onSwap && (
        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white" onClick={() => onSwap(player.id)} aria-label={`Intercambiar ${player.name}`}>
          <span className="text-base">↔</span>
        </Button>
      )}
      {onMoveInWaitingList && (
        <div className="flex items-center">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMoveInWaitingList(player.id, 'up')} disabled={isFirstInList} aria-label={`Mover ${player.name} arriba`}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMoveInWaitingList(player.id, 'down')} disabled={isLastInList} aria-label={`Mover ${player.name} abajo`}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Opciones de movimiento para ${player.name}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem onClick={() => onMoveInWaitingList(player.id, 'top')} className="focus:bg-slate-700 focus:text-white">
                <ChevronsUp className="mr-2 h-4 w-4" />
                <span>Enviar al principio</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoveInWaitingList(player.id, 'bottom')} className="focus:bg-slate-700 focus:text-white">
                <ChevronsDown className="mr-2 h-4 w-4" />
                <span>Enviar al final</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {onRemove && (
        <Button size="icon" variant="ghost" className={cn("h-7 w-7", isChampion ? "text-black hover:text-red-900" : "text-slate-400 hover:text-red-500")} onClick={() => onRemove(player.id)} aria-label={`Eliminar ${player.name}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
));
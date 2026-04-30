"use client";

import { Button } from '@/components/ui/button';
import { Trophy, Undo2, Newspaper, RefreshCw } from 'lucide-react';
import { Team, Player } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

interface GameControlsProps {
  teamA: Team;
  teamB: Team;
  onRecordWin: (winner: 'A' | 'B') => void;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
  players: Player[];
}

export function GameControls({ teamA, teamB, onRecordWin, onUndo, canUndo, onReset, players }: GameControlsProps) {
  const sortedPlayers = [...players].sort((a, b) => b.wins - a.wins);
  const isMatchReady = teamA.players.length === 5 && teamB.players.length === 5;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h3 className="text-xl font-bold tracking-widest uppercase text-muted-foreground">Registrar Resultado</h3>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          size="lg" 
          disabled={!isMatchReady}
          onClick={() => onRecordWin('A')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-16 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Ganó {teamA.name}
        </Button>

        <Button 
          size="lg" 
          disabled={!isMatchReady}
          onClick={() => onRecordWin('B')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-16 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Ganó {teamB.name}
        </Button>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          disabled={!canUndo}
          onClick={onUndo}
          className="border-white/10 glass hover:bg-white/5 font-bold"
        >
          <Undo2 className="mr-2 h-4 w-4" /> Deshacer
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/10 glass hover:bg-white/5 font-bold">
              <Newspaper className="mr-2 h-4 w-4" /> Resumen del Día
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Trophy /> Estadísticas de Hoy
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Resumen de desempeño de todos los jugadores.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-2">
                {sortedPlayers.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-bold w-4">{idx + 1}.</span>
                      <div>
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.wins + p.losses} partidos jugados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{p.wins}V</span>
                        <span className="text-rose-400 font-bold">{p.losses}D</span>
                      </div>
                      <p className="text-xs font-bold text-primary">{(p.winRate * 100).toFixed(0)}% WR</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="sm:justify-between flex-row items-center gap-4 mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="font-bold">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reiniciar Todo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-accent font-bold">¿Reiniciar la jornada?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Se borrarán todos los jugadores, equipos y estadísticas actuales. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset} className="bg-destructive text-white hover:bg-destructive/80">Confirmar Reinicio</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="glass border-white/10">Cerrar</Button>
              </DialogTrigger>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

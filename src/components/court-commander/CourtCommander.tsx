
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRotationEngine } from '@/hooks/use-rotation-engine';
import { TeamSection } from './TeamSection';
import { WaitingList } from './WaitingList';
import { GameControls } from './GameControls';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Share2, Users } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RotacionDeportiva() {
  const {
    isLoaded,
    players,
    waitingListIds,
    teamA,
    teamB,
    championsTeam,
    winsToChampion,
    championRule,
    history,
    setWinsToChampion,
    setChampionRule,
    addPlayers,
    removePlayer,
    recordWin,
    undo,
    resetDay,
    saveSnapshot,
    restoreSnapshot,
    swapPlayers,
    setTeamA,
    setTeamB,
    setWaitingListIds,
    setChampionsTeam,
    setPlayers
  } = useRotationEngine();

  const { toast } = useToast();
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasSuggestedRule, setHasSuggestedRule] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null);
  const lastChampionsRef = useRef<string | null>(null);

  useEffect(() => {
    // Solo celebrar si es un equipo nuevo y completo
    if (championsTeam && championsTeam.players.length === 5) {
      const teamId = championsTeam.players.map(p => p.id).sort().join('');
      if (teamId !== lastChampionsRef.current) {
        setShowCelebration(true);
        lastChampionsRef.current = teamId;
        const timer = setTimeout(() => setShowCelebration(false), 5000);
        return () => clearTimeout(timer);
      }
    } else if (!championsTeam) {
      lastChampionsRef.current = null;
    }
  }, [championsTeam]);

  useEffect(() => {
    if (waitingListIds.length >= 10 && !championRule && !hasSuggestedRule) {
      toast({
        title: "¡Mucha gente en espera!",
        description: "¿Quieres activar la Regla de Campeón para una rotación más rápida?",
        action: (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-accent text-accent-foreground font-bold"
            onClick={() => {
              setChampionRule(true);
              setHasSuggestedRule(true);
            }}
          >
            Activar
          </Button>
        ),
      });
      setHasSuggestedRule(true);
    } else if (waitingListIds.length < 10) {
      setHasSuggestedRule(false);
    }
  }, [waitingListIds.length, championRule, hasSuggestedRule, setChampionRule, toast]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string, location: 'A' | 'B' | 'W') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('sourceId', id);
    e.dataTransfer.setData('sourceLocation', location);
    setDraggedPlayerId(id);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (draggedPlayerId && draggedPlayerId !== id) {
      setDragOverPlayerId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string, targetLocation: 'A' | 'B' | 'W') => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('sourceId');
    const sourceLocation = e.dataTransfer.getData('sourceLocation') as 'A' | 'B' | 'W';

    if (!sourceId || sourceId === targetId) {
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
      return;
    }

    if (sourceLocation === 'W' && targetLocation === 'W') {
      // Reorder waiting list
      setWaitingListIds(prev => {
        const newIds = [...prev];
        const draggedIdx = newIds.indexOf(sourceId);
        const targetIdx = newIds.indexOf(targetId);
        const [item] = newIds.splice(draggedIdx, 1);
        newIds.splice(targetIdx, 0, item);
        return newIds;
      });
    } else {
      // Swap players between teams or team/list
      swapPlayers(sourceId, targetId, sourceLocation, targetLocation);
    }

    setDraggedPlayerId(null);
    setDragOverPlayerId(null);
  };

  const handleEditPlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player) {
      setEditingPlayerId(id);
      setEditedName(player.name);
    }
  };

  const saveEdit = () => {
    if (!editingPlayerId || !editedName.trim()) return;
    setPlayers(prev => prev.map(p => p.id === editingPlayerId ? { ...p, name: editedName.trim() } : p));
    setEditingPlayerId(null);
    toast({ title: "Nombre actualizado" });
  };

  const shareAlignment = () => {
    const text = `
🏆 *ROTACIÓN DEPORTIVA* 🏆

🎮 *Partida Actual:*
🅰️ ${teamA.name}
${teamA.players.map(p => `• ${p.name}`).join('\n')}

🅱️ ${teamB.name}
${teamB.players.map(p => `• ${p.name}`).join('\n')}

⏳ *En espera (${waitingListIds.length}):*
${waitingListIds.map((id, i) => `${i + 1}. ${players.find(p => p.id === id)?.name}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({ title: "¡Copiado al portapapeles!", description: "Listo para compartir en WhatsApp." });
  };

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold tracking-widest text-primary animate-pulse">CARGANDO NEBULA COURT...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="p-8 flex flex-col items-center gap-2">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img src="/bluerotationicon.png" alt="Logo" className="relative h-16 w-16 drop-shadow-2xl" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl mt-4">
          ROTACIÓN <span className="text-primary">DEPORTIVA</span>
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-xs">Nebula Court v2.0</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: List & Settings */}
        <div className="lg:col-span-4 space-y-6">
          <WaitingList 
            players={players}
            waitingListIds={waitingListIds}
            onAddPlayers={addPlayers}
            onRemovePlayer={setPlayerToRemove}
            onAssignToTeam={(id, team) => {
              const player = players.find(p => p.id === id);
              if (!player) return;
              
              let targetTeam = team;
              // Auto-routing if team is full
              if (team === 'A' && teamA.players.length >= 5) targetTeam = 'B';
              if (team === 'B' && teamB.players.length >= 5) targetTeam = 'A';

              if (targetTeam === 'A') {
                if (teamA.players.length >= 5) {
                  toast({ variant: 'destructive', title: "Equipos llenos", description: "No hay espacio en la cancha." });
                  return;
                }
                setTeamA(prev => ({ ...prev, players: [...prev.players, player] }));
              } else {
                if (teamB.players.length >= 5) {
                  toast({ variant: 'destructive', title: "Equipos llenos", description: "No hay espacio en la cancha." });
                  return;
                }
                setTeamB(prev => ({ ...prev, players: [...prev.players, player] }));
              }
              setWaitingListIds(prev => prev.filter(pid => pid !== id));
            }}
            onMoveInList={(id, dir) => {
              setWaitingListIds(prev => {
                const idx = prev.indexOf(id);
                if (idx === -1) return prev;
                const newIds = [...prev];
                if (dir === 'up' && idx > 0) [newIds[idx-1], newIds[idx]] = [newIds[idx], newIds[idx-1]];
                if (dir === 'down' && idx < prev.length-1) [newIds[idx+1], newIds[idx]] = [newIds[idx], newIds[idx+1]];
                if (dir === 'top') return [id, ...prev.filter(i => i !== id)];
                if (dir === 'bottom') return [...prev.filter(i => i !== id), id];
                return newIds;
              });
            }}
            onEditPlayer={handleEditPlayer}
            onDragStart={(e, id) => handleDragStart(e, id, 'W')}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e, id) => handleDrop(e, id, 'W')}
            draggedPlayerId={draggedPlayerId}
            dragOverPlayerId={dragOverPlayerId}
            teamsAreFull={teamA.players.length >= 5 && teamB.players.length >= 5}
            onSaveSnapshot={saveSnapshot}
            onRestoreSnapshot={restoreSnapshot}
          />

          <SettingsSection 
            championRule={championRule}
            onToggleRule={setChampionRule}
            winsToChampion={winsToChampion}
            onUpdateWins={setWinsToChampion}
            waitingListCount={waitingListIds.length}
          />
        </div>

        {/* Right Column: Court & Controls */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamSection 
              team={teamA} 
              onRemovePlayer={setPlayerToRemove}
              onEditPlayer={handleEditPlayer}
              onDragStart={(e, id) => handleDragStart(e, id, 'A')}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e, id) => handleDrop(e, id, 'A')}
              draggedPlayerId={draggedPlayerId}
              dragOverPlayerId={dragOverPlayerId}
            />
            <TeamSection 
              team={teamB} 
              onRemovePlayer={setPlayerToRemove}
              onEditPlayer={handleEditPlayer}
              onDragStart={(e, id) => handleDragStart(e, id, 'B')}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e, id) => handleDrop(e, id, 'B')}
              draggedPlayerId={draggedPlayerId}
              dragOverPlayerId={dragOverPlayerId}
            />
          </div>

          {championsTeam && (
            <div className="animate-in fade-in zoom-in duration-500">
              <TeamSection 
                team={championsTeam} 
                isChampion 
                onRemovePlayer={(id) => {
                  setChampionsTeam(prev => {
                    if (!prev) return null;
                    const filtered = prev.players.filter(p => p.id !== id);
                    return filtered.length > 0 ? { ...prev, players: filtered } : null;
                  });
                  setWaitingListIds(prev => [...prev, id]);
                }}
                onEditPlayer={handleEditPlayer}
              />
            </div>
          )}

          <GameControls 
            teamA={teamA}
            teamB={teamB}
            onRecordWin={recordWin}
            onUndo={undo}
            canUndo={history.length > 0}
            onReset={resetDay}
            players={players}
          />

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="glass border-white/5 hover:bg-white/10 text-muted-foreground"
              onClick={shareAlignment}
            >
              <Share2 className="mr-2 h-4 w-4" /> Compartir en WhatsApp
            </Button>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlayerId} onOpenChange={() => setEditingPlayerId(null)}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Editar Jugador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input 
                id="edit-name" 
                value={editedName} 
                onChange={(e) => setEditedName(e.target.value)} 
                className="bg-background/40 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPlayerId(null)}>Cancelar</Button>
            <Button onClick={saveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!playerToRemove} onOpenChange={(open) => !open && setPlayerToRemove(null)}>
        <AlertDialogContent className="glass border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-accent">¿Eliminar jugador?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción quitará al jugador de la lista o equipo actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (playerToRemove) {
                  removePlayer(playerToRemove);
                  setPlayerToRemove(null);
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/80"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Celebration Overlay */}
      {showCelebration && championsTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-500" />
          <div className="relative flex flex-col items-center animate-in zoom-in spin-in-1 duration-1000 ease-out">
            <div className="relative">
              <div className="absolute -inset-8 bg-accent rounded-full blur-3xl opacity-20 animate-pulse" />
              <img src="/bluerotationicon.png" alt="Trophy" className="h-32 w-32 relative animate-bounce" />
            </div>
            <h2 className="text-6xl font-black text-accent tracking-tighter mt-8 drop-shadow-2xl">
              ¡NUEVOS CAMPEONES!
            </h2>
            <p className="text-4xl font-bold text-white mt-4 tracking-widest uppercase">
              {championsTeam.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

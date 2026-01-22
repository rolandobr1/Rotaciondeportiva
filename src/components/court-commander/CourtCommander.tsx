
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Player, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Users, Crown, Plus, Trash2, Swords, Trophy, GripVertical, Newspaper, RefreshCw, Pencil, X as CloseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const PlayerCard = ({ player, onRemove, onAssign, showAssign, isChampion, turn, isTeamAFull, isTeamBFull, draggable, onDragStart, onDragEnter, onDragLeave, onDragOver, onDrop, onDragEnd, isDragging, isDraggingOver, onEdit }: { player: Player, onRemove?: (id: string) => void, onAssign?: (id: string, team: 'A' | 'B') => void, showAssign?: boolean, isChampion?: boolean, turn?: number, isTeamAFull?: boolean, isTeamBFull?: boolean, draggable?: boolean, onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void, onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void, onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void, onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void, onDrop?: (e: React.DragEvent<HTMLDivElement>) => void, onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void, isDragging?: boolean, isDraggingOver?: boolean, onEdit?: (id: string) => void }) => (
  <div 
    draggable={draggable}
    onDragStart={onDragStart}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
    className={cn(
    "relative flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
    isChampion ? "bg-amber-500" : "bg-slate-700",
    draggable && "cursor-move",
    isDragging && "opacity-50",
    isDraggingOver && "ring-2 ring-sky-400"
  )}>
    <div className="flex items-center gap-3 overflow-hidden">
        {draggable && <GripVertical className="h-5 w-5 text-slate-400 shrink-0" />}
        <div className="overflow-hidden">
            <div className="flex items-center gap-2">
                <p className={cn("font-bold truncate", isChampion ? "text-black" : "text-sky-400")}>
                    {turn && <span className="mr-2 text-slate-400 font-normal">{turn}.</span>}
                    {player.name}
                </p>
                {onEdit && (
                    <Button size="icon" variant="ghost" className={cn("h-6 w-6 shrink-0 p-0", isChampion ? "text-black hover:text-slate-700" : "text-slate-400 hover:text-white")} onClick={() => onEdit(player.id)}>
                        <Pencil className="h-3 w-3" />
                    </Button>
                )}
            </div>
            <p className={cn("text-xs truncate", isChampion ? "text-slate-800" : "text-slate-400")}>
                V/D: {player.wins}/{player.losses} | Tasa de Victorias: {(player.winRate * 100).toFixed(0)}% | Racha: <span className={cn("font-bold", player.consecutiveWins > 0 ? (isChampion ? 'text-white' : 'text-amber-400') : '')}>{player.consecutiveWins}</span>
            </p>
        </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {showAssign && onAssign && (
        <>
          <Button size="sm" onClick={() => onAssign(player.id, 'A')} className="h-7 w-7 p-0 bg-sky-700 hover:bg-sky-600 text-white border-none disabled:bg-slate-600 disabled:opacity-50" disabled={isTeamAFull}>A</Button>
          <Button size="sm" onClick={() => onAssign(player.id, 'B')} className="h-7 w-7 p-0 bg-teal-700 hover:bg-teal-600 text-white border-none disabled:bg-slate-600 disabled:opacity-50" disabled={isTeamBFull}>B</Button>
        </>
      )}
      {onRemove && (
        <Button size="icon" variant="ghost" className={cn("h-7 w-7", isChampion ? "text-black hover:text-red-900" : "text-slate-400 hover:text-red-500")} onClick={() => onRemove(player.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

const TeamColumn = ({ team, onRemovePlayer, onEditPlayer }: { team: Team, onRemovePlayer: (playerId: string) => void, onEditPlayer: (playerId: string) => void }) => {
    const avgWinRate = useMemo(() => {
        if (team.players.length === 0) return 0;
        const totalWinRate = team.players.reduce((sum, p) => sum + p.winRate, 0);
        return totalWinRate / team.players.length;
    }, [team.players]);

    return (
        <Card className="flex-1 min-w-[280px] bg-slate-800/80 border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-sky-400">
                    <Swords /> {team.name}
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
};

// Helper function to update player stats after a match
const updatePlayerStats = (players: Player[], winningTeam: Team, losingTeam: Team, championsTeam?: Team | null): Player[] => {
  return players.map(p => {
    const wasChampion = championsTeam?.players.some(cp => cp.id === p.id);
    
    if (winningTeam.players.some(wp => wp.id === p.id)) {
      const newWins = p.wins + 1;
      return {
        ...p,
        wins: newWins,
        consecutiveWins: wasChampion ? (p.consecutiveWins || 0) + 1 : (p.consecutiveWins || 0) + 1,
        winRate: newWins / (newWins + p.losses),
      };
    }
    if (losingTeam.players.some(lp => lp.id === p.id)) {
      const newLosses = p.losses + 1;
      return {
        ...p,
        losses: newLosses,
        consecutiveWins: 0,
        winRate: p.wins / (p.wins + newLosses),
      };
    }
    // Reset consecutive wins for resting champions if they didn't play (losing challenger)
    if (wasChampion) {
        return { ...p, consecutiveWins: 0 };
    }
    return p;
  });
};


export function RotacionDeportiva() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [waitingListIds, setWaitingListIds] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<Team>({ name: 'Equipo A', players: [] });
  const [teamB, setTeamB] = useState<Team>({ name: 'Equipo B', players: [] });
  const [championsTeam, setChampionsTeam] = useState<Team | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const [championRule, setChampionRule] = useState(false);
  const [winsToChampion, setWinsToChampion] = useState<number | string>(2);
  const [isConfirmDisableChampionsOpen, setIsConfirmDisableChampionsOpen] = useState(false);

  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');

  const [savedWaitingList, setSavedWaitingList] = useState<string[] | null>(null);
  const [savedPlayers, setSavedPlayers] = useState<Player[] | null>(null);

  const { toast } = useToast();

  const STORAGE_KEYS = useMemo(() => ({
    PLAYERS: 'rotacionDeportiva.players_v2',
    WAITING_LIST: 'rotacionDeportiva.waitingListIds_v2',
    TEAM_A: 'rotacionDeportiva.teamA_v2',
    TEAM_B: 'rotacionDeportiva.teamB_v2',
    CHAMPIONS: 'rotacionDeportiva.championsTeam_v2',
    WINS_TO_CHAMPION: 'rotacionDeportiva.winsToChampion_v2',
    SAVED_WAITING_LIST: 'rotacionDeportiva.savedWaitingList_v2',
    SAVED_PLAYERS: 'rotacionDeportiva.savedPlayers_v2',
  }), []);
  
  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (storedPlayers) setPlayers(JSON.parse(storedPlayers));

      const storedWaitingList = localStorage.getItem(STORAGE_KEYS.WAITING_LIST);
      if (storedWaitingList) setWaitingListIds(JSON.parse(storedWaitingList));

      const storedTeamA = localStorage.getItem(STORAGE_KEYS.TEAM_A);
      if (storedTeamA) setTeamA(JSON.parse(storedTeamA));

      const storedTeamB = localStorage.getItem(STORAGE_KEYS.TEAM_B);
      if (storedTeamB) setTeamB(JSON.parse(storedTeamB));

      const storedChampions = localStorage.getItem(STORAGE_KEYS.CHAMPIONS);
      if (storedChampions && storedChampions !== 'null') setChampionsTeam(JSON.parse(storedChampions));
      
      const storedWins = localStorage.getItem(STORAGE_KEYS.WINS_TO_CHAMPION);
      if (storedWins) setWinsToChampion(JSON.parse(storedWins));

      const storedSavedList = localStorage.getItem(STORAGE_KEYS.SAVED_WAITING_LIST);
      if (storedSavedList) setSavedWaitingList(JSON.parse(storedSavedList));

      const storedSavedPlayers = localStorage.getItem(STORAGE_KEYS.SAVED_PLAYERS);
      if (storedSavedPlayers) setSavedPlayers(JSON.parse(storedSavedPlayers));

    } catch (error) {
      console.error("Error al cargar datos desde localStorage", error);
      toast({
        variant: 'destructive',
        title: "Error al cargar datos",
        description: "No se pudieron cargar los datos guardados. Se empezará de cero."
      });
    }
    setIsLoaded(true);
  }, [STORAGE_KEYS, toast]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEYS.WAITING_LIST, JSON.stringify(waitingListIds));
      localStorage.setItem(STORAGE_KEYS.TEAM_A, JSON.stringify(teamA));
      localStorage.setItem(STORAGE_KEYS.TEAM_B, JSON.stringify(teamB));
      localStorage.setItem(STORAGE_KEYS.CHAMPIONS, JSON.stringify(championsTeam));
      localStorage.setItem(STORAGE_KEYS.WINS_TO_CHAMPION, JSON.stringify(winsToChampion));
      localStorage.setItem(STORAGE_KEYS.SAVED_WAITING_LIST, JSON.stringify(savedWaitingList));
      localStorage.setItem(STORAGE_KEYS.SAVED_PLAYERS, JSON.stringify(savedPlayers));
    } catch (error) {
      console.error("Error al guardar datos en localStorage", error);
    }
  }, [players, waitingListIds, teamA, teamB, championsTeam, winsToChampion, savedWaitingList, savedPlayers, isLoaded, STORAGE_KEYS]);


  const waitingPlayers = useMemo(() => {
      const playerMap = new Map(players.map(p => [p.id, p]));
      return waitingListIds
          .map(id => playerMap.get(id))
          .filter((p): p is Player => !!p);
  }, [players, waitingListIds]);

  const sortedPlayersByWins = useMemo(() => {
    return [...players].sort((a, b) => b.wins - a.wins);
  }, [players]);

    useEffect(() => {
        setChampionRule(waitingPlayers.length >= 10);
    }, [waitingPlayers.length]);


  const handleChampionRuleToggle = (checked: boolean) => {
    if (checked) {
      if (waitingPlayers.length < 10) {
        toast({
          variant: 'destructive',
          title: "No se puede activar",
          description: "Se necesitan al menos 10 jugadores en espera para activar la Regla del Campeón.",
        });
        return;
      }
      setChampionRule(true);
      toast({ title: "Regla del Campeón Activada" });
    } else {
      if (championsTeam) {
        setIsConfirmDisableChampionsOpen(true);
      } else {
        setChampionRule(false);
        toast({ title: "Regla del Campeón Desactivada" });
      }
    }
  };

  const handleConfirmDisableChampionRule = () => {
    setChampionRule(false);
    if (championsTeam) {
      const playerMap = new Map(players.map(p => [p.id, p]));
      const sortedChampions = championsTeam.players
        .map(p => playerMap.get(p.id)!)
        .filter(Boolean)
        .sort((a, b) => a.createdAt - b.createdAt);

      setWaitingListIds(prev => [...prev, ...sortedChampions.map(p => p.id)]);
      setChampionsTeam(null);
      toast({
        title: "Regla Desactivada",
        description: "El equipo campeón ha sido disuelto y sus jugadores están en la lista de espera.",
      });
    } else {
      toast({ title: "Regla del Campeón Desactivada" });
    }
    setIsConfirmDisableChampionsOpen(false);
  };

  const handleResetDay = () => {
    setPlayers([]);
    setWaitingListIds([]);
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);
    setNewPlayerName('');
    setSavedPlayers(null);
    setSavedWaitingList(null);
    
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    
    setIsSummaryOpen(false); 
    
    toast({
        title: "Día Finalizado",
        description: "Todos los datos han sido reiniciados. ¡Hasta la próxima!",
    });
  };

  const handleAddPlayer = () => {
    let playerName = newPlayerName.trim();
    
    if (playerName === '') {
        let playerNumber = 1;
        let proposedName = `Jugador ${playerNumber}`;
        while (players.some(p => p.name === proposedName)) {
            playerNumber++;
            proposedName = `Jugador ${playerNumber}`;
        }
        playerName = proposedName;
    } else {
        if (players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
            toast({
                variant: 'destructive',
                title: "Nombre duplicado",
                description: `Ya existe un jugador con el nombre "${playerName}".`
            });
            return;
        }
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: playerName,
      wins: 0,
      losses: 0,
      winRate: 0,
      consecutiveWins: 0,
      createdAt: Date.now()
    };
    setPlayers(prev => [...prev, newPlayer]);
    setWaitingListIds(prev => [...prev, newPlayer.id]);
    setNewPlayerName('');
    toast({ title: "Jugador Añadido", description: `${newPlayer.name} está ahora en la lista de espera.` });
  };

  const handleRemovePlayer = (id: string) => {
    const playerToRemove = players.find(p => p.id === id);
    if (!playerToRemove) return;
    
    const confirmAndRemove = () => {
        setPlayers(p => p.filter(player => player.id !== id));
        setWaitingListIds(ids => ids.filter(playerId => playerId !== id));
        
        const removePlayerFromTeam = (team: Team) => {
            const newPlayers = team.players.filter(p => p.id !== id);
            return { ...team, players: newPlayers };
        };

        setTeamA(removePlayerFromTeam);
        setTeamB(removePlayerFromTeam);
        setChampionsTeam(ct => {
            if (!ct) return null;
            const newPlayers = ct.players.filter(p => p.id !== id);
            return newPlayers.length > 0 ? { ...ct, players: newPlayers } : null;
        });

        toast({ title: 'Jugador Eliminado', description: `${playerToRemove.name} ha sido eliminado de la aplicación.` });
    };

    confirmAndRemove();
  };
  
  const handleAssignPlayer = (playerId: string, team: 'A' | 'B') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const targetTeam = team === 'A' ? teamA : teamB;
    const setTargetTeam = team === 'A' ? setTeamA : setTeamB;
    const otherTeam = team === 'A' ? teamB : teamA;
    const setOtherTeam = team === 'A' ? setTeamB : setTeamA;
    const otherTeamAutoFill = team === 'A' ? 'B' : 'A';

    if (targetTeam.players.length >= 5) {
        toast({ variant: 'destructive', title: `Equipo ${team} ya está lleno.` });
        return;
    }

    const newTeamPlayers = [...targetTeam.players, player];
    setTargetTeam({ players: newTeamPlayers, name: team === 'A' ? 'Equipo A' : 'Equipo B' });
    let updatedWaitingIds = waitingListIds.filter(id => id !== playerId);

    if (newTeamPlayers.length === 5 && otherTeam.players.length === 0 && updatedWaitingIds.length >= 5) {
        const playerMap = new Map(players.map(p => [p.id, p]));
        const playersForOtherTeam = updatedWaitingIds.slice(0, 5).map(id => playerMap.get(id)!).filter(Boolean);
        setOtherTeam({ players: playersForOtherTeam, name: otherTeamAutoFill === 'A' ? 'Equipo A' : 'Equipo B' });
        setWaitingListIds(updatedWaitingIds.slice(5));
        toast({
            title: `Equipo ${otherTeamAutoFill} auto-completado`,
            description: "Los 5 siguientes jugadores han formado el equipo.",
        });
    } else {
        setWaitingListIds(updatedWaitingIds);
    }
  };

  const handleRemoveFromTeam = (playerId: string) => {
    const playerToRemove = players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    let wasInTeamA = teamA.players.some(p => p.id === playerId);
    let wasInTeamB = teamB.players.some(p => p.id === playerId);

    if (!wasInTeamA && !wasInTeamB) return;

    if (wasInTeamA) {
      setTeamA(t => ({...t, players: t.players.filter(p => p.id !== playerId)}));
    }
    if (wasInTeamB) {
      setTeamB(t => ({...t, players: t.players.filter(p => p.id !== playerId)}));
    }

    setWaitingListIds(currentIds => {
      const newIds = [...currentIds, playerId];
      const playerMap = new Map(players.map(p => [p.id, p]));
      newIds.sort((a,b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt);
      return newIds;
    });

    toast({ title: "Jugador en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera.` });
  };

  const handleRemoveFromChampionTeam = (playerId: string) => {
    if (!championsTeam) return;

    const playerToRemove = championsTeam.players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    let newChampionPlayers = championsTeam.players.filter(p => p.id !== playerId);
    
    setWaitingListIds(currentIds => {
        const newIds = [...currentIds, playerId];
        const playerMap = new Map(players.map(p => [p.id, p]));
        newIds.sort((a,b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt);
        return newIds;
    });

    if (newChampionPlayers.length === 0) {
        setChampionsTeam(null);
        toast({ title: "Equipo Campeón Disuelto", description: "No quedan jugadores en el equipo campeón."});
    } else {
        setChampionsTeam({
            ...championsTeam,
            players: newChampionPlayers,
        });
        toast({ title: "Campeón en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera.` });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, playerId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedPlayerId(playerId);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetPlayerId: string) => {
      e.preventDefault();
      if (draggedPlayerId && draggedPlayerId !== targetPlayerId) {
          setDragOverPlayerId(targetPlayerId);
      }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOverPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPlayerId: string) => {
      e.preventDefault();
      if (!draggedPlayerId || draggedPlayerId === targetPlayerId) {
          handleDragEnd();
          return;
      }

      setWaitingListIds(prevIds => {
          const newIds = [...prevIds];
          const draggedIndex = newIds.indexOf(draggedPlayerId);
          const targetIndex = newIds.indexOf(targetPlayerId);

          if (draggedIndex === -1 || targetIndex === -1) {
              return prevIds;
          }

          const [draggedItem] = newIds.splice(draggedIndex, 1);
          newIds.splice(targetIndex, 0, draggedItem);
          
          return newIds;
      });

      handleDragEnd();
  };

  const handleDragEnd = () => {
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
  };
  
  const handleRecordWin = (winner: 'A' | 'B') => {
      const winsNeeded = Number(winsToChampion);
      if (isNaN(winsNeeded) || winsNeeded < 1) {
          toast({ variant: "destructive", title: "Número inválido", description: "Las victorias para ser campeón deben ser un número mayor a 0." });
          return;
      }
  
      const winningTeamData = winner === 'A' ? teamA : teamB;
      const losingTeamData = winner === 'A' ? teamB : teamA;
  
      if (winningTeamData.players.length < 5 || losingTeamData.players.length < 5) {
          toast({ variant: 'destructive', title: "Equipos incompletos", description: "Ambos equipos deben tener 5 jugadores." });
          return;
      }
  
      const wasChampionMatch = !!championsTeam;
      const allPlayersAfterStats = updatePlayerStats(players, winningTeamData, losingTeamData, wasChampionMatch ? championsTeam : null);
      const playerMap = new Map(allPlayersAfterStats.map(p => [p.id, p]));
  
      const winningTeamWithStats = winningTeamData.players.map(p => playerMap.get(p.id)!);
  
      if (wasChampionMatch) {
          // A challenger was decided. Now they face the champion.
          const championPlayersWithStats = championsTeam!.players.map(p => playerMap.get(p.id)!);
          
          const isValidChampionTeam = championPlayersWithStats.every(Boolean) && championPlayersWithStats.length === 5;
          
          if (!isValidChampionTeam) {
              toast({ variant: "destructive", title: "Equipo Campeón Inválido", description: "El equipo campeón se disolvió. Volviendo a la rotación normal." });
              setChampionsTeam(null);
              // Fall through to standard rotation logic
          } else {
              setTeamA({ name: championsTeam!.name, players: championPlayersWithStats });
              setTeamB({ name: winningTeamData.name, players: winningTeamWithStats });
              setChampionsTeam(null);
              const loserIds = losingTeamData.players.map(p => p.id);
              setWaitingListIds(currentIds => [...currentIds, ...loserIds].sort((a,b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt));
              setPlayers(allPlayersAfterStats);
              toast({ title: "¡Duelo de Campeones!", description: `${championsTeam!.name} vs. ${winningTeamData.name}` });
              return;
          }
      }
      
      const winningTeamConsecutiveWins = winningTeamWithStats.map(p => p.consecutiveWins);
      const teamHasReachedChampionStatus = championRule && winningTeamConsecutiveWins.every(w => w >= winsNeeded);
  
      if (teamHasReachedChampionStatus) {
          // New champions crowned
          toast({ title: "¡Nuevos Campeones!", description: `${winningTeamData.name} ahora son campeones y descansarán.` });
          setChampionsTeam({ name: winningTeamData.name, players: winningTeamWithStats });
          
          const loserIds = losingTeamData.players.map(p => p.id);
          const newWaitingList = [...waitingListIds, ...loserIds].sort((a, b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt);
  
          if (newWaitingList.length < 10) {
              toast({ variant: 'destructive', title: "No hay suficientes retadores", description: "Los equipos se han vaciado. No hay suficientes jugadores para un partido interino." });
              setTeamA({ name: 'Equipo A', players: [] });
              setTeamB({ name: 'Equipo B', players: [] });
              setWaitingListIds(newWaitingList);
          } else {
              const interimA = newWaitingList.slice(0, 5).map(id => playerMap.get(id)!);
              const interimB = newWaitingList.slice(5, 10).map(id => playerMap.get(id)!);
              setTeamA({ name: 'Equipo A', players: interimA });
              setTeamB({ name: 'Equipo B', players: interimB });
              setWaitingListIds(newWaitingList.slice(10));
              toast({ title: "Partido Interino", description: "Se ha formado un nuevo partido para decidir el próximo retador." });
          }
      } else {
          // Standard rotation
          const loserIds = losingTeamData.players.map(p => p.id);
          const newWaitingList = [...waitingListIds, ...loserIds].sort((a, b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt);
          
          if (newWaitingList.length < 5) {
              toast({ variant: 'destructive', title: "No hay suficientes retadores", description: "El equipo ganador se queda en la cancha, pero no hay suficientes jugadores para formar un equipo retador." });
              const winnerTeamData = { name: winningTeamData.name, players: winningTeamWithStats };
              if (winner === 'A') {
                  setTeamA(winnerTeamData);
                  setTeamB({ name: 'Equipo B', players: [] });
              } else {
                  setTeamA({ name: 'Equipo A', players: [] });
                  setTeamB(winnerTeamData);
              }
              setWaitingListIds(newWaitingList);
          } else {
              const newChallengers = newWaitingList.slice(0, 5).map(id => playerMap.get(id)!);
              if (winner === 'A') {
                  setTeamA({ name: teamA.name, players: winningTeamWithStats });
                  setTeamB({ name: 'Equipo B', players: newChallengers });
              } else {
                  setTeamA({ name: 'Equipo A', players: newChallengers });
                  setTeamB({ name: teamB.name, players: winningTeamWithStats });
              }
              setWaitingListIds(newWaitingList.slice(5));
          }
      }
      setPlayers(allPlayersAfterStats);
  };
  

  const handleReturnChampionToWaitingList = () => {
    if (!championsTeam) return;

    const playerMap = new Map(players.map(p => [p.id, p]));
    const championIds = championsTeam.players.map(p => p.id);
    
    setWaitingListIds(prev => [...prev, ...championIds].sort((a,b) => playerMap.get(a)!.createdAt - playerMap.get(b)!.createdAt));
    setChampionsTeam(null);
  };

  const handleSaveWaitingList = () => {
    setSavedPlayers([...players]);
    setSavedWaitingList([...waitingListIds]);
    toast({
        title: "Lista de Espera Guardada",
        description: "Se ha guardado una instantánea del estado actual de los jugadores.",
    });
  };

  const handleRestoreWaitingList = () => {
    if (!savedPlayers || !savedWaitingList) {
        toast({
            variant: "destructive",
            title: "No hay nada que restaurar",
            description: "Primero debes guardar una instantánea de la lista de espera.",
        });
        return;
    }

    const savedPlayerMap = new Map(savedPlayers.map(p => [p.id, p]));

    const allPlayerIds = [...new Set([...savedPlayers.map(p => p.id), ...players.map(p => p.id)])];
    const restoredPlayers = allPlayerIds.map(id => savedPlayerMap.get(id) || players.find(p => p.id === id)!);
    
    const restoredWaitingListIds = [...savedWaitingList];
    restoredPlayers.forEach(p => {
        if (!restoredWaitingListIds.includes(p.id)) {
            restoredWaitingListIds.push(p.id);
        }
    });

    const finalWaitingList = restoredWaitingListIds.sort((a, b) => {
        const playerA = savedPlayerMap.get(a);
        const playerB = savedPlayerMap.get(b);
        if (playerA && playerB) return playerA.createdAt - playerB.createdAt;
        return 0;
    });

    setPlayers(restoredPlayers);
    setWaitingListIds(finalWaitingList);
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);

    toast({
        title: "Lista de Espera Restaurada",
        description: "Se ha restaurado la instantánea guardada. Todos los jugadores están en espera.",
    });
  };

  const handleOpenEditPlayer = (playerId: string) => {
    const playerToEdit = players.find(p => p.id === playerId);
    if (playerToEdit) {
        setEditingPlayer(playerToEdit);
        setEditedPlayerName(playerToEdit.name);
    }
  };

  const handleUpdatePlayerName = () => {
      if (!editingPlayer || !editedPlayerName.trim()) return;

      const newName = editedPlayerName.trim();

      if (players.some(p => p.name.toLowerCase() === newName.toLowerCase() && p.id !== editingPlayer.id)) {
          toast({
              variant: 'destructive',
              title: "Nombre duplicado",
              description: `Ya existe otro jugador con el nombre "${newName}".`
          });
          return;
      }

      const applyUpdate = (playerList: Player[]) => 
          playerList.map(p => p.id === editingPlayer.id ? { ...p, name: newName } : p);

      setPlayers(prev => applyUpdate(prev));
      setTeamA(prev => ({ ...prev, players: applyUpdate(prev.players) }));
      setTeamB(prev => ({ ...prev, players: applyUpdate(prev.players) }));
      if (championsTeam) {
          setChampionsTeam(prev => prev ? { ...prev, players: applyUpdate(prev.players) } : null);
      }
      
      toast({ title: "Jugador Actualizado", description: `El nombre se ha cambiado a ${newName}.` });
      setEditingPlayer(null);
      setEditedPlayerName('');
  };

  
  if (!isLoaded) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-2 sm:p-4 flex items-center justify-center">
              <div className="text-center">
                  <h1 className="font-bold text-5xl text-sky-400">Cargando...</h1>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-2 sm:p-4">
      <main className="w-full max-w-7xl mx-auto">
        <AlertDialog open={isConfirmDisableChampionsOpen} onOpenChange={setIsConfirmDisableChampionsOpen}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-amber-400">¿Desactivar Regla del Campeón?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        Esta acción disolverá el equipo campeón actual y devolverá a sus jugadores a la lista de espera. ¿Estás seguro?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => setIsConfirmDisableChampionsOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDisableChampionRule} className="bg-destructive hover:bg-red-700">Sí, desactivar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!editingPlayer} onOpenChange={(isOpen) => !isOpen && setEditingPlayer(null)}>
            <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-sky-400">Editar Nombre del Jugador</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-slate-300">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            value={editedPlayerName}
                            onChange={(e) => setEditedPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdatePlayerName()}
                            className="col-span-3 bg-slate-700 border-slate-600 placeholder:text-slate-500"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingPlayer(null)}>Cancelar</Button>
                    <Button onClick={handleUpdatePlayerName} className="bg-sky-600 hover:bg-sky-700 text-white">Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <header className="text-center mb-8">
            <h1 className="font-bold text-3xl sm:text-4xl text-sky-400 flex items-center justify-center gap-4 whitespace-nowrap">
                <img src="/bluerotationicon.png" alt="Icono de Rotación Deportiva" className="h-8 w-8 sm:h-10 md:h-12"/>
                Rotación Deportiva
            </h1>
            <p className="text-slate-400 mt-2">Gestión de equipos para partidos amistosos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-400"><Plus/> Añadir Nuevo Jugador</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ej., Nombre del Jugador" 
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                      className="bg-slate-700 border-slate-600 placeholder:text-slate-500"
                    />
                    <Button onClick={handleAddPlayer} className="bg-sky-600 hover:bg-sky-700 text-white">Añadir</Button>
                  </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <div className="flex flex-col items-start w-full">
                               <CardTitle className="flex items-center gap-2 text-sky-400"><Users/> Lista de Espera ({waitingPlayers.length})</CardTitle>
                               <CardDescription className="text-slate-400 pt-2">Los jugadores se añaden a los equipos desde aquí.</CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <CardContent className="px-6 pb-6 pt-0 space-y-2 max-h-[400px] overflow-y-auto">
                                {waitingPlayers.length > 0 ? (
                                    waitingPlayers.map((p, index) => (
                                        <PlayerCard 
                                            key={p.id} 
                                            player={p}
                                            turn={index + 1}
                                            onRemove={handleRemovePlayer} 
                                            onAssign={handleAssignPlayer}
                                            showAssign={index === 0}
                                            draggable={true}
                                            onDragStart={(e) => handleDragStart(e, p.id)}
                                            onDragEnter={(e) => handleDragEnter(e, p.id)}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, p.id)}
                                            onDragEnd={handleDragEnd}
                                            isDragging={draggedPlayerId === p.id}
                                            isDraggingOver={dragOverPlayerId === p.id && draggedPlayerId !== p.id}
                                            isTeamAFull={teamA.players.length >= 5}
                                            isTeamBFull={teamB.players.length >= 5}
                                            onEdit={handleOpenEditPlayer}
                                        />
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center py-4">No hay jugadores en espera.</p>
                                )}
                            </CardContent>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <Card className={cn(
                        "border-slate-700 transition-all",
                        championsTeam ? "bg-gradient-to-br from-amber-500 to-yellow-400" : "bg-slate-800"
                    )}>
                        <AccordionTrigger className="p-6 hover:no-underline">
                             {championsTeam ? (
                                <div className="text-white text-left w-full">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Trophy className="h-6 w-6" /> Campeón Descansando
                                    </CardTitle>
                                    <CardDescription className="text-amber-100 pt-2">
                                        Racha Actual: {championsTeam.players[0]?.consecutiveWins} victorias. Esperando retador.
                                    </CardDescription>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start w-full">
                                    <CardTitle className="flex items-center gap-2 text-sky-400">
                                        <Crown /> Regla del Campeón
                                    </CardTitle>
                                     <CardDescription className="text-slate-400 pt-2">
                                        Configura las reglas para coronar a un equipo campeón.
                                    </CardDescription>
                                </div>
                            )}
                        </AccordionTrigger>
                        <AccordionContent>
                            {championsTeam ? (
                                <CardContent className="px-6 pb-6 pt-0 text-white">
                                    <div className="space-y-2">
                                      {championsTeam.players.map(p => (
                                          <PlayerCard 
                                              key={p.id} 
                                              player={p} 
                                              onRemove={handleRemoveFromChampionTeam}
                                              onEdit={handleOpenEditPlayer}
                                              isChampion 
                                          />
                                      ))}
                                    </div>
                                    <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none" onClick={handleReturnChampionToWaitingList}>Devolver a la Lista de Espera</Button>
                                </CardContent>
                            ) : (
                                <CardContent className="px-6 pb-6 pt-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Switch
                                            id="champion-rule"
                                            checked={championRule}
                                            disabled={!championRule && waitingPlayers.length < 10}
                                            onCheckedChange={handleChampionRuleToggle}
                                        />
                                        <Label htmlFor="champion-rule">
                                            {championRule ? 'Regla activada' : 'Regla desactivada'}
                                        </Label>
                                    </div>
                                    <p className="text-xs mb-4 text-slate-400">
                                        { championRule ? 'El equipo campeón descansará.' : 'Se activa con 10 o más jugadores en espera.'}
                                    </p>
                                    <div className="flex items-center gap-2 my-4">
                                        <Label htmlFor="wins-to-champion">Victorias para ser campeón:</Label>
                                        <Input
                                            id="wins-to-champion"
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={winsToChampion}
                                            onChange={(e) => setWinsToChampion(e.target.value.replace(/[^0-9]/g, ""))}
                                            onBlur={(e) => {
                                              const num = parseInt(e.target.value, 10);
                                              if (isNaN(num) || num < 1) {
                                                setWinsToChampion(1);
                                              }
                                            }}
                                            className="w-20 bg-slate-700 border-slate-600 text-white"
                                            min="1"
                                        />
                                    </div>
                                    <Separator className='bg-slate-700' />
                                    <p className="text-center py-4 text-slate-500 mt-2">No hay un equipo campeón descansando.</p>
                                </CardContent>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-3xl text-sky-400">{championsTeam ? "Partido Interino" : "Equipos Actuales"}</CardTitle>
                    {championsTeam && <CardDescription className="text-yellow-400">El ganador de este partido se enfrentará al campeón: {championsTeam.name}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="team-a" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="team-a">{teamA.name}</TabsTrigger>
                            <TabsTrigger value="team-b">{teamB.name}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="team-a">
                            <TeamColumn team={teamA} onRemovePlayer={handleRemoveFromTeam} onEditPlayer={handleOpenEditPlayer} />
                        </TabsContent>
                        <TabsContent value="team-b">
                            <TeamColumn team={teamB} onRemovePlayer={handleRemoveFromTeam} onEditPlayer={handleOpenEditPlayer}/>
                        </TabsContent>
                    </Tabs>

                    <Separator className="bg-slate-700"/>

                    <div className="text-center space-y-4">
                        <h3 className="text-2xl text-sky-400">Registrar Resultado del Partido</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => handleRecordWin('A')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                <Trophy className="mr-2 h-4 w-4"/> Ganó {teamA.name}
                            </Button>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => handleRecordWin('B')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                <Trophy className="mr-2 h-4 w-4"/> Ganó {teamB.name}
                            </Button>
                        </div>
                         <div className="pt-4">
                            <Card className="bg-slate-800 border-slate-700 max-w-sm mx-auto">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-sky-400">Acciones del Día</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                                      <DialogTrigger asChild>
                                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                              <Newspaper className="mr-2 h-4 w-4"/>
                                              Finalizar el Día y Ver Resumen
                                          </Button>
                                      </DialogTrigger>
                                       <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-slate-100">
                                          <DialogHeader>
                                              <DialogTitle className="text-sky-400 text-2xl">Resumen del Día</DialogTitle>
                                              <DialogDescription className="text-slate-400">
                                                  Estadísticas de los jugadores de hoy. ¡Buen juego a todos!
                                              </DialogDescription>
                                          </DialogHeader>
                                          <ScrollArea className="h-[60vh]">
                                            <div className="space-y-3 pr-4">
                                                {sortedPlayersByWins.length > 0 ? sortedPlayersByWins.map((player) => (
                                                    <div key={player.id} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                                                        <div>
                                                            <p className="font-bold text-sky-400">{player.name}</p>
                                                            <p className="text-sm text-slate-300">
                                                                Juegos Jugados: {player.wins + player.losses}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-emerald-400">Victorias: {player.wins}</p>
                                                            <p className="text-sm text-slate-400">Derrotas: {player.losses}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                <p className="text-slate-500 text-center py-8">No se han registrado jugadores hoy.</p>
                                                )}
                                            </div>
                                          </ScrollArea>
                                          <DialogFooter id="summary-dialog-footer" className="sm:justify-between gap-2 mt-4 flex-col-reverse sm:flex-row">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" className="w-full sm:w-auto">
                                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                                        Reiniciar Todo
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-800 border-slate-700">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-amber-400">¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-300">
                                                            Esta acción es irreversible. Se borrarán todos los jugadores, equipos y estadísticas guardadas.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="border-slate-600 hover:bg-slate-700">Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleResetDay} className="bg-destructive hover:bg-red-700">Sí, reiniciar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <div className="flex flex-col-reverse sm:flex-row gap-2">
                                              <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700" onClick={handleSaveWaitingList}>
                                                  Guardar Lista
                                              </Button>
                                              <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700" onClick={handleRestoreWaitingList}>
                                                  Restaurar Lista
                                              </Button>
                                              <Button type="button" variant="secondary" onClick={() => setIsSummaryOpen(false)}>
                                                  Cerrar
                                              </Button>
                                            </div>
                                          </DialogFooter>
                                      </DialogContent>
                                  </Dialog>
                                </div>
                              </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

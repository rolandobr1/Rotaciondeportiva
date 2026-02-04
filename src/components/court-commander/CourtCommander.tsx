
"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Player, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Users, Crown, Plus, Trash2, Swords, Trophy, GripVertical, Newspaper, RefreshCw, Pencil, X as CloseIcon, MoreVertical, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Save, History, ListChecks } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};


const PlayerCard = ({ player, onRemove, onAssign, isChampion, turn, draggable, onDragStart, onDragEnter, onDragLeave, onDragOver, onDrop, onDragEnd, isDragging, isDraggingOver, onEdit, onMoveInWaitingList, isFirstInList, isLastInList, justMoved }: { player: Player, onRemove?: (id: string) => void, onAssign?: (id: string, team: 'A' | 'B') => void, isChampion?: boolean, turn?: number, draggable?: boolean, onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void, onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void, onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void, onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void, onDrop?: (e: React.DragEvent<HTMLDivElement>) => void, onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void, isDragging?: boolean, isDraggingOver?: boolean, onEdit?: (id: string) => void, onMoveInWaitingList?: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void, isFirstInList?: boolean, isLastInList?: boolean, justMoved?: boolean }) => (
  <div 
    draggable={draggable}
    onDragStart={onDragStart}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
    className={cn(
    "relative flex items-center justify-between p-3 rounded-lg shadow-sm transition-colors duration-1000 ease-out hover:shadow-md",
    isChampion ? "bg-amber-500" : justMoved ? "bg-sky-600" : "bg-slate-700",
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
    <div className="flex items-center gap-1 flex-shrink-0">
      {onAssign && (
        <div className="flex items-center">
          <Button size="icon" variant="ghost" className="h-7 w-7 font-bold text-sky-400 hover:bg-sky-600 hover:text-white" onClick={() => onAssign(player.id, 'A')}>A</Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 font-bold text-amber-400 hover:bg-amber-500 hover:text-white" onClick={() => onAssign(player.id, 'B')}>B</Button>
        </div>
      )}
      {onMoveInWaitingList && (
        <div className="flex items-center">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMoveInWaitingList(player.id, 'up')} disabled={isFirstInList}>
                <ChevronUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMoveInWaitingList(player.id, 'down')} disabled={isLastInList}>
                <ChevronDown className="h-4 w-4" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
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
    if (wasChampion && !winningTeam.players.some(wp => wp.id === p.id)) {
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

  const [justMovedPlayerIds, setJustMovedPlayerIds] = useState<Set<string>>(new Set());
  const prevWaitingListIds = usePrevious(waitingListIds);
  const prevWaitingListLength = usePrevious(waitingListIds.length);

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
  
  const deriveTeamName = (players: Player[], defaultName: string): string => {
      if (players.length > 0) {
          // The first player in the array dictates the name.
          return `Equipo ${players[0].name}`;
      }
      return defaultName;
  };

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


  useEffect(() => {
    if (prevWaitingListIds) {
        const movedIds = new Set<string>();

        const prevOrderMap = new Map(prevWaitingListIds.map((id, index) => [id, index]));

        waitingListIds.forEach((id, newIndex) => {
            const oldIndex = prevOrderMap.get(id);
            // Highlight if the index is different, and it's not a new player
            if (oldIndex !== undefined && oldIndex !== newIndex) {
                movedIds.add(id);
            }
        });
        
        if (movedIds.size > 0) {
            setJustMovedPlayerIds(movedIds);
            const timer = setTimeout(() => {
                setJustMovedPlayerIds(new Set());
            }, 1500); // Highlight for 1.5 seconds
            return () => clearTimeout(timer);
        }
    }
  }, [waitingListIds, prevWaitingListIds]);
  
  const handleSaveWaitingList = useCallback((silent: boolean = false) => {
    setSavedPlayers([...players]);
    setSavedWaitingList([...waitingListIds]);
    if (!silent) {
      toast({
          title: "Lista de Espera Guardada",
          description: "Se ha guardado una instantánea del estado actual de los jugadores.",
      });
    }
  }, [players, waitingListIds, toast]);

  useEffect(() => {
    if (isLoaded && prevWaitingListLength !== undefined && waitingListIds.length > prevWaitingListLength) {
      if (waitingListIds.length > 10) {
        handleSaveWaitingList(true); // Auto-save silently
      }
    }
  }, [isLoaded, waitingListIds.length, prevWaitingListLength, handleSaveWaitingList]);


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
      const championIds = championsTeam.players.map(p => p.id);
      setWaitingListIds(prev => [...prev, ...championIds]);
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
    // Split by newline, trim, and remove empty strings.
    const names = newPlayerName.split('\n').map(name => name.trim()).filter(Boolean);

    // If after all that, there are no names, and the original input was also empty,
    // we create a default player.
    if (names.length === 0 && newPlayerName.trim() === '') {
        let playerNumber = 1;
        let proposedName = `Jugador ${playerNumber}`;
        while (players.some(p => p.name.toLowerCase() === proposedName.toLowerCase())) {
            playerNumber++;
            proposedName = `Jugador ${playerNumber}`;
        }
        names.push(proposedName);
    }
    
    if (names.length === 0) {
        setNewPlayerName('');
        return;
    }

    const newPlayers: Player[] = [];
    const addedNames: string[] = [];
    const duplicatedNames: string[] = [];
    // Use a Set for efficient duplicate checking within the new batch
    const newNamesLC = new Set<string>();

    for (const name of names) {
        const nameLC = name.toLowerCase();
        // Check against existing players AND players in this batch
        if (players.some(p => p.name.toLowerCase() === nameLC) || newNamesLC.has(nameLC)) {
            duplicatedNames.push(name);
        } else {
            const newPlayer: Player = {
              id: crypto.randomUUID(),
              name: name,
              wins: 0,
              losses: 0,
              winRate: 0,
              consecutiveWins: 0,
              createdAt: Date.now() + newPlayers.length, // Stagger for sort stability
            };
            newPlayers.push(newPlayer);
            addedNames.push(name);
            newNamesLC.add(nameLC);
        }
    }

    if (newPlayers.length > 0) {
        const newPlayerIds = newPlayers.map(p => p.id);
        setPlayers(prev => [...prev, ...newPlayers]);
        setWaitingListIds(prev => [...prev, ...newPlayerIds]);
        toast({
            title: `${newPlayers.length > 1 ? 'Jugadores Añadidos' : 'Jugador Añadido'}`,
            description: `${addedNames.join(', ')} está(n) en la lista de espera.`
        });
    }

    if (duplicatedNames.length > 0) {
        toast({
            variant: 'destructive',
            title: "Nombres duplicados",
            description: `Ya existen y no fueron añadidos: ${duplicatedNames.join(', ')}.`
        });
    }

    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    const playerToRemove = players.find(p => p.id === id);
    if (!playerToRemove) return;
    
    const confirmAndRemove = () => {
        setPlayers(p => p.filter(player => player.id !== id));
        setWaitingListIds(ids => ids.filter(playerId => playerId !== id));
        
        const removePlayerFromTeam = (team: Team, defaultName: string) => {
            const newPlayers = team.players.filter(p => p.id !== id);
            return { ...team, players: newPlayers, name: deriveTeamName(newPlayers, defaultName) };
        };

        setTeamA(t => removePlayerFromTeam(t, 'Equipo A'));
        setTeamB(t => removePlayerFromTeam(t, 'Equipo B'));

        setChampionsTeam(ct => {
            if (!ct) return null;
            const newPlayers = ct.players.filter(p => p.id !== id);
            return newPlayers.length > 0 ? { ...ct, players: newPlayers } : null;
        });

        toast({ title: 'Jugador Eliminado', description: `${playerToRemove.name} ha sido eliminado de la aplicación.` });
    };

    confirmAndRemove();
  };
  
    const handleAssignPlayerToTeam = (playerId: string, team: 'A' | 'B') => {
        const player = players.find(p => p.id === playerId);
        if (!player) return;

        const isTeamA = team === 'A';
        const targetTeam = isTeamA ? teamA : teamB;
        const setTargetTeam = isTeamA ? setTeamA : setTeamB;
        const defaultName = isTeamA ? 'Equipo A' : 'Equipo B';

        if (targetTeam.players.length >= 5) {
          toast({
            variant: "destructive",
            title: "Equipo Lleno",
            description: `${targetTeam.name} ya tiene 5 jugadores.`
          });
          return;
        }
        
        if (teamA.players.some(p => p.id === playerId) || teamB.players.some(p => p.id === playerId)) {
            return;
        }

        setWaitingListIds(ids => ids.filter(id => id !== playerId));
        
        setTargetTeam(currentTeam => {
            const newPlayers = [...currentTeam.players, player];
            return {
                ...currentTeam,
                players: newPlayers,
                name: deriveTeamName(newPlayers, defaultName)
            };
        });

        toast({
          title: "Jugador Asignado",
          description: `${player.name} ha sido añadido al Equipo ${team}.`
        });
    };

  const handleRemoveFromTeam = (playerId: string) => {
    const playerToRemove = players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    let wasInTeamA = teamA.players.some(p => p.id === playerId);
    let wasInTeamB = teamB.players.some(p => p.id === playerId);

    if (!wasInTeamA && !wasInTeamB) return;

    if (wasInTeamA) {
      setTeamA(t => {
          const newPlayers = t.players.filter(p => p.id !== playerId);
          return { ...t, players: newPlayers, name: deriveTeamName(newPlayers, 'Equipo A') };
      });
    }
    if (wasInTeamB) {
      setTeamB(t => {
          const newPlayers = t.players.filter(p => p.id !== playerId);
          return { ...t, players: newPlayers, name: deriveTeamName(newPlayers, 'Equipo B') };
      });
    }
    
    setWaitingListIds(currentIds => [...currentIds, playerId]);

    toast({ title: "Jugador en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera.` });
  };

  const handleRemoveFromChampionTeam = (playerId: string) => {
    if (!championsTeam) return;

    const playerToRemove = championsTeam.players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    // Check if there is a replacement available in the waiting list
    if (waitingPlayers.length > 0) {
      const replacementPlayer = waitingPlayers[0]; // The next player in line

      // The list of champion players with the replacement swapped in
      const newChampionPlayers = championsTeam.players.map(p => 
        p.id === playerId ? replacementPlayer : p
      );
      
      // Update waiting list: remove the replacement from the top, add the removed champion to the bottom
      const newWaitingListIds = [...waitingListIds.slice(1), playerId];

      setChampionsTeam({
        ...championsTeam,
        players: newChampionPlayers,
        name: deriveTeamName(newChampionPlayers, championsTeam.name) // Update name in case first player changed
      });
      setWaitingListIds(newWaitingListIds);

      toast({
        title: "Sustitución de Campeón",
        description: `${replacementPlayer.name} reemplaza a ${playerToRemove.name} en el equipo campeón.`
      });

    } else {
      // No replacement available. Just remove the player from the champions and add to waiting list.
      const newChampionPlayers = championsTeam.players.filter(p => p.id !== playerId);
      
      setWaitingListIds(currentIds => [...currentIds, playerId]);

      if (newChampionPlayers.length === 0) {
          setChampionsTeam(null);
          toast({ title: "Equipo Campeón Disuelto", description: "No quedan jugadores en el equipo campeón."});
      } else {
          setChampionsTeam({
              ...championsTeam,
              players: newChampionPlayers,
              name: deriveTeamName(newChampionPlayers, championsTeam.name) // Update name in case first player changed
          });
          toast({ title: "Campeón en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera (no hay sustitutos).` });
      }
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
          const championPlayersWithStats = championsTeam!.players.map(p => playerMap.get(p.id)!).filter(Boolean);
          
          const isValidChampionTeam = championPlayersWithStats.length === 5;
          
          if (!isValidChampionTeam) {
              toast({ variant: "destructive", title: "Equipo Campeón Inválido", description: "El equipo campeón se disolvió. Volviendo a la rotación normal." });
              setChampionsTeam(null);
              // Fall through to standard rotation logic by setting wasChampionMatch to false
          } else {
              setTeamA({ name: deriveTeamName(championPlayersWithStats, championsTeam!.name), players: championPlayersWithStats });
              setTeamB({ name: deriveTeamName(winningTeamWithStats, winningTeamData.name), players: winningTeamWithStats });
              setChampionsTeam(null);
              const loserIds = losingTeamData.players.map(p => p.id);
              setWaitingListIds(currentIds => [...currentIds, ...loserIds]);
              setPlayers(allPlayersAfterStats);
              toast({ title: "¡Duelo de Campeones!", description: `${championsTeam!.name} vs. ${winningTeamData.name}` });
              return;
          }
      }
      
      const teamHasReachedChampionStatus = championRule && winningTeamWithStats.every(p => p.consecutiveWins >= winsNeeded);
  
      if (teamHasReachedChampionStatus) {
          // New champions crowned
          toast({ title: "¡Nuevos Campeones!", description: `${winningTeamData.name} ahora son campeones y descansarán.` });
          setChampionsTeam({ name: winningTeamData.name, players: winningTeamWithStats });
          
          const loserIds = losingTeamData.players.map(p => p.id);
          const newWaitingList = [...waitingListIds, ...loserIds];
  
          if (newWaitingList.length < 10) {
              toast({ variant: 'destructive', title: "No hay suficientes retadores", description: "Los equipos se han vaciado. No hay suficientes jugadores para un partido interino." });
              setTeamA({ name: 'Equipo A', players: [] });
              setTeamB({ name: 'Equipo B', players: [] });
              setWaitingListIds(newWaitingList);
          } else {
              const interimA = newWaitingList.slice(0, 5).map(id => playerMap.get(id)!);
              const interimB = newWaitingList.slice(5, 10).map(id => playerMap.get(id)!);
              setTeamA({ name: deriveTeamName(interimA, 'Equipo A'), players: interimA });
              setTeamB({ name: deriveTeamName(interimB, 'Equipo B'), players: interimB });
              setWaitingListIds(newWaitingList.slice(10));
              toast({ title: "Partido Interino", description: "Se ha formado un nuevo partido para decidir el próximo retador." });
          }
      } else {
          // Standard rotation
          const loserIds = losingTeamData.players.map(p => p.id);
          const newWaitingList = [...waitingListIds, ...loserIds];
          
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
                  setTeamB({ name: deriveTeamName(newChallengers, 'Equipo B'), players: newChallengers });
              } else {
                  setTeamA({ name: deriveTeamName(newChallengers, 'Equipo A'), players: newChallengers });
                  setTeamB({ name: teamB.name, players: winningTeamWithStats });
              }
              setWaitingListIds(newWaitingList.slice(5));
          }
      }
      setPlayers(allPlayersAfterStats);
  };
  
  const handleMoveInWaitingList = (playerId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setWaitingListIds(currentIds => {
        const index = currentIds.indexOf(playerId);
        if (index === -1) return currentIds;

        if (direction === 'up') {
            if (index === 0) return currentIds;
            const newIds = [...currentIds];
            [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
            return newIds;
        }
        if (direction === 'down') {
            if (index === currentIds.length - 1) return currentIds;
            const newIds = [...currentIds];
            [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
            return newIds;
        }
        if (direction === 'top') {
            return [playerId, ...currentIds.filter(id => id !== playerId)];
        }
        if (direction === 'bottom') {
            return [...currentIds.filter(id => id !== playerId), playerId];
        }
        return currentIds;
    });
  };

  const handleReturnChampionToWaitingList = () => {
    if (!championsTeam) return;

    const championIds = championsTeam.players.map(p => p.id);
    setWaitingListIds(prev => [...prev, ...championIds]);
    setChampionsTeam(null);
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

    const allCurrentPlayerIds = new Set(players.map(p => p.id));
    const restoredPlayers = [...savedPlayers];
    
    // Add players that exist in current state but not in saved state
    players.forEach(p => {
        if (!restoredPlayers.some(sp => sp.id === p.id)) {
            restoredPlayers.push(p);
        }
    });

    const restoredWaitingListIds = [...savedWaitingList];
    
    // Add any player that is not in any team and not in the waiting list
    restoredPlayers.forEach(p => {
        const isInTeam = teamA.players.some(ap => ap.id === p.id) || teamB.players.some(bp => bp.id === p.id) || (championsTeam && championsTeam.players.some(cp => cp.id === p.id));
        if (!isInTeam && !restoredWaitingListIds.includes(p.id)) {
            restoredWaitingListIds.push(p.id);
        }
    });

    setPlayers(restoredPlayers);
    setWaitingListIds(restoredWaitingListIds);
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

      const updateTeam = (team: Team, defaultName: string) => {
          const updatedPlayers = applyUpdate(team.players);
          return {
              ...team,
              players: updatedPlayers,
              name: deriveTeamName(updatedPlayers, defaultName),
          };
      };
      
      setTeamA(prev => updateTeam(prev, 'Equipo A'));
      setTeamB(prev => updateTeam(prev, 'Equipo B'));

      if (championsTeam) {
          setChampionsTeam(prev => {
              if (!prev) return null;
              const updatedPlayers = applyUpdate(prev.players);
              return {
                  ...prev,
                  players: updatedPlayers,
                  name: deriveTeamName(updatedPlayers, prev.name),
              };
          });
      }
      
      toast({ title: "Jugador Actualizado", description: `El nombre se ha cambiado a ${newName}.` });
      setEditingPlayer(null);
      setEditedPlayerName('');
  };

  const teamsAreFull = teamA.players.length >= 5 && teamB.players.length >= 5;

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
                  <div className="flex flex-col gap-2">
                    <Textarea 
                      placeholder="Añadir un jugador por línea o pegar una lista." 
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="bg-slate-700 border-slate-600 placeholder:text-slate-500"
                    />
                    <Button onClick={handleAddPlayer} className="bg-sky-600 hover:bg-sky-700 text-white">Añadir</Button>
                  </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sky-400"><ListChecks /> Acciones de Lista</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700" onClick={() => handleSaveWaitingList(false)}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Lista
                        </Button>
                        <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700" onClick={handleRestoreWaitingList}>
                            <History className="mr-2 h-4 w-4" />
                            Restaurar Lista
                        </Button>
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
                                            onAssign={index === 0 && !teamsAreFull ? handleAssignPlayerToTeam : undefined}
                                            onRemove={handleRemovePlayer}
                                            draggable={true}
                                            onDragStart={(e) => handleDragStart(e, p.id)}
                                            onDragEnter={(e) => handleDragEnter(e, p.id)}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, p.id)}
                                            onDragEnd={handleDragEnd}
                                            isDragging={draggedPlayerId === p.id}
                                            isDraggingOver={dragOverPlayerId === p.id && draggedPlayerId !== p.id}
                                            onEdit={handleOpenEditPlayer}
                                            onMoveInWaitingList={handleMoveInWaitingList}
                                            isFirstInList={index === 0}
                                            isLastInList={index === waitingPlayers.length - 1}
                                            justMoved={justMovedPlayerIds.has(p.id)}
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
                                            <Button type="button" variant="secondary" onClick={() => setIsSummaryOpen(false)}>
                                                Cerrar
                                            </Button>
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




    

    

    

    

    

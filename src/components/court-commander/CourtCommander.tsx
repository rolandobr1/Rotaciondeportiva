
"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Player, Team } from '@/lib/types';
import { PlayerCard } from './PlayerCard';
import { TeamColumn } from './TeamColumn';

type AppState = {
  players: Player[];
  waitingListIds: string[];
  teamA: Team;
  teamB: Team;
  championsTeam: Team | null;
  winsToChampion: number | string;
  savedWaitingList: string[] | null;
  savedPlayers: Player[] | null;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Users, Crown, Plus, Trash2, Swords, Trophy, GripVertical, Newspaper, RefreshCw, Pencil, X as CloseIcon, MoreVertical, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Save, History, ListChecks, Maximize2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import BasketballScoreboard from './BasketballScoreboard';
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


// Helper function to update player stats after a match
const updatePlayerStats = (players: Player[], winningTeam: Team, losingTeam: Team, championsTeam?: Team | null): Player[] => {
  return players.map(p => {
    const wasChampion = championsTeam?.players.some(cp => cp.id === p.id);
    
    if (winningTeam.players.some(wp => wp.id === p.id)) {
      const newWins = p.wins + 1;
      return {
        ...p,
        wins: newWins,
        consecutiveWins: p.consecutiveWins + 1,
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
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [playerToMove, setPlayerToMove] = useState<{ player: Player; direction: 'top' | 'bottom' } | null>(null);
  const [isConfirmMoveOpen, setIsConfirmMoveOpen] = useState(false);

  const [pendingSwapTarget, setPendingSwapTarget] = useState<Player | null>(null);
  const [isConfirmSwapOpen, setIsConfirmSwapOpen] = useState(false);
  const [isConfirmResetListOpen, setIsConfirmResetListOpen] = useState(false);

  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);
  const draggedPlayerIdRef = useRef<string | null>(null);
  const dragOverPlayerIdRef = useRef<string | null>(null);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');
  const [swapSource, setSwapSource] = useState<{ playerId: string; team: 'A' | 'B'; name: string } | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

  const [savedWaitingList, setSavedWaitingList] = useState<string[] | null>(null);
  const [savedPlayers, setSavedPlayers] = useState<Player[] | null>(null);

  const [isInitialSelectionOpen, setIsInitialSelectionOpen] = useState(false);
  const [tempTeamAIds, setTempTeamAIds] = useState<string[]>([]);
  const [tempTeamBIds, setTempTeamBIds] = useState<string[]>([]);

  const [justMovedPlayerIds, setJustMovedPlayerIds] = useState<Set<string>>(new Set());
  const prevWaitingListIds = usePrevious(waitingListIds);
  const prevWaitingListLength = usePrevious(waitingListIds.length);

  const [undoStack, setUndoStack] = useState<AppState[]>([]);
  const [matchStatus, setMatchStatus] = useState<{ type: 'win' | 'champion' | 'duel' | 'rest' | 'none'; teamName: string; message: string } | null>(null);
  const [lastWinner, setLastWinner] = useState<'A' | 'B' | null>(null);
  const [consecutiveWinCount, setConsecutiveWinCount] = useState(0);
  const [winOverlay, setWinOverlay] = useState<{ teamName: string; type: 'win' | 'streak' | 'champion' } | null>(null);
  const winOverlayTimerRef = useRef<number | null>(null);

  const [useScoreboard, setUseScoreboard] = useState(false);
  const [scoreboardResult, setScoreboardResult] = useState<null | {
      puntosA: number; puntosB: number; faltasA: number; faltasB: number; tiempoTranscurridoMs: number;
  }>(null);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [scoreboardMinimized, setScoreboardMinimized] = useState(false);

  useEffect(() => {
    if (!matchStatus) return;
    const timer = setTimeout(() => setMatchStatus(null), 8000);
    return () => clearTimeout(timer);
  }, [matchStatus]);

  useEffect(() => {
    return () => {
      if (winOverlayTimerRef.current !== null) {
        window.clearTimeout(winOverlayTimerRef.current);
      }
    };
  }, []);

  const saveStateForUndo = useCallback(() => {
    const currentState: AppState = {
      players,
      waitingListIds,
      teamA,
      teamB,
      championsTeam,
      winsToChampion,
      savedWaitingList,
      savedPlayers,
    };
    setUndoStack(prev => [...prev.slice(-9), currentState]); // Mantener máximo 10 estados
  }, [players, waitingListIds, teamA, teamB, championsTeam, winsToChampion, savedWaitingList, savedPlayers]);

  const updateFromState = useCallback((state: AppState) => {
    setPlayers(state.players);
    setWaitingListIds(state.waitingListIds);
    setTeamA(state.teamA);
    setTeamB(state.teamB);
    setChampionsTeam(state.championsTeam);
    setWinsToChampion(state.winsToChampion);
    setSavedWaitingList(state.savedWaitingList);
    setSavedPlayers(state.savedPlayers);
  }, []);

  const { toast } = useToast();

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      updateFromState(lastState);
      setUndoStack(prev => prev.slice(0, -1));
      toast({ title: "Acción Deshecha", description: "Se ha revertido la última acción." });
    } else {
      toast({ variant: 'destructive', title: "No hay acciones para deshacer" });
    }
  }, [undoStack, updateFromState, toast]);

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
    setIsConfirmResetOpen(true);
  };

  const handleConfirmResetDay = () => {
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
    setIsConfirmResetOpen(false);
    
    toast({
        title: "Día Finalizado",
        description: "Todos los datos han sido reiniciados. ¡Hasta la próxima!",
    });
  };

  const handleAddPlayer = () => {
    saveStateForUndo();
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
        const updatedPlayers = [...players, ...newPlayers];
        const updatedWaitingList = [...waitingListIds, ...newPlayerIds];
        setPlayers(updatedPlayers);
        setWaitingListIds(updatedWaitingList);
        setSavedPlayers(updatedPlayers);
        setSavedWaitingList(updatedWaitingList);
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
    setPlayerToRemove(playerToRemove);
    setIsConfirmRemoveOpen(true);
  };

  const handleConfirmRemovePlayer = () => {
    if (!playerToRemove) return;
    saveStateForUndo();
    
    const wasInTeamA = teamA.players.some(p => p.id === playerToRemove.id);
    const wasInTeamB = teamB.players.some(p => p.id === playerToRemove.id);

    const updatedPlayers = players.filter(player => player.id !== playerToRemove.id);
    const updatedWaitingListIds = waitingListIds.filter(playerId => playerId !== playerToRemove.id);

    const replacementId = updatedWaitingListIds.length > 0 ? updatedWaitingListIds[0] : null;
    const replacementPlayer = replacementId ? updatedPlayers.find(p => p.id === replacementId) : null;

    const fillTeam = (team: Team, defaultName: string, wasInThisTeam: boolean) => {
        const remainingPlayers = team.players.filter(p => p.id !== playerToRemove.id);
        if (wasInThisTeam && replacementPlayer && remainingPlayers.length < 5) {
            const newPlayers = [...remainingPlayers, replacementPlayer];
            return { ...team, players: newPlayers, name: deriveTeamName(newPlayers, defaultName) };
        }
        return { ...team, players: remainingPlayers, name: deriveTeamName(remainingPlayers, defaultName) };
    };

    setPlayers(updatedPlayers);
    setTeamA(t => fillTeam(t, 'Equipo A', wasInTeamA));
    setTeamB(t => fillTeam(t, 'Equipo B', wasInTeamB));
    
    if (replacementId && (wasInTeamA || wasInTeamB)) {
        setWaitingListIds(updatedWaitingListIds.filter(id => id !== replacementId));
        toast({ title: 'Jugador Reemplazado', description: `${replacementPlayer?.name} entra a jugar tras la eliminación de ${playerToRemove.name}.` });
    } else {
        setWaitingListIds(updatedWaitingListIds);
        toast({ title: 'Jugador Eliminado', description: `${playerToRemove.name} ha sido eliminado de la aplicación.` });
    }

    setChampionsTeam(ct => {
        if (!ct) return null;
        const newPlayers = ct.players.filter(p => p.id !== playerToRemove.id);
        return newPlayers.length > 0 ? { ...ct, players: newPlayers } : null;
    });

    setIsConfirmRemoveOpen(false);
    setPlayerToRemove(null);
  };


  const handleRemoveFromTeam = (playerId: string) => {
    saveStateForUndo();
    const playerToRemove = players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    let wasInTeamA = teamA.players.some(p => p.id === playerId);
    let wasInTeamB = teamB.players.some(p => p.id === playerId);

    if (!wasInTeamA && !wasInTeamB) return;

    const replacementId = waitingListIds.length > 0 ? waitingListIds[0] : null;
    const replacementPlayer = replacementId ? players.find(p => p.id === replacementId) : null;

    if (wasInTeamA) {
      setTeamA(t => {
        const remainingPlayers = t.players.filter(p => p.id !== playerId);
        if (replacementPlayer && remainingPlayers.length < 5) {
          const newPlayers = [...remainingPlayers, replacementPlayer];
          return { ...t, players: newPlayers, name: deriveTeamName(newPlayers, 'Equipo A') };
        }
        return { ...t, players: remainingPlayers, name: deriveTeamName(remainingPlayers, 'Equipo A') };
      });
    }

    if (wasInTeamB) {
      setTeamB(t => {
        const remainingPlayers = t.players.filter(p => p.id !== playerId);
        if (replacementPlayer && remainingPlayers.length < 5) {
          const newPlayers = [...remainingPlayers, replacementPlayer];
          return { ...t, players: newPlayers, name: deriveTeamName(newPlayers, 'Equipo B') };
        }
        return { ...t, players: remainingPlayers, name: deriveTeamName(remainingPlayers, 'Equipo B') };
      });
    }
    
    if (replacementId) {
      setWaitingListIds(currentIds => [...currentIds.filter(id => id !== replacementId), playerId]);
      toast({ 
        title: "Rotación Automática", 
        description: `${replacementPlayer?.name} entra a jugar por ${playerToRemove.name}.` 
      });
    } else {
      setWaitingListIds(currentIds => [...currentIds, playerId]);
      toast({ title: "Jugador en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera.` });
    }
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
      e.dataTransfer.setData('text/plain', playerId);
      draggedPlayerIdRef.current = playerId;
      setDraggedPlayerId(playerId);
      setDragOverPlayerId(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetPlayerId: string) => {
      e.preventDefault();
      const currentDraggedId = draggedPlayerIdRef.current;
      if (currentDraggedId && currentDraggedId !== targetPlayerId) {
          dragOverPlayerIdRef.current = targetPlayerId;
          setDragOverPlayerId(targetPlayerId);
      }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const related = e.relatedTarget as Node | null;
      if (related && e.currentTarget.contains(related)) {
          return;
      }
      dragOverPlayerIdRef.current = null;
      setDragOverPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPlayerId: string) => {
      e.preventDefault();
      const currentDraggedId = draggedPlayerIdRef.current || e.dataTransfer.getData('text/plain');
      if (!currentDraggedId || currentDraggedId === targetPlayerId) {
          handleDragEnd();
          return;
      }

      setWaitingListIds(prevIds => {
          const newIds = [...prevIds];
          const draggedIndex = newIds.indexOf(currentDraggedId);
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
      draggedPlayerIdRef.current = null;
      dragOverPlayerIdRef.current = null;
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
  };
  
  const handleRecordWin = (winner: 'A' | 'B') => {
    saveStateForUndo();
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
      const statusPrefix = winningTeamData.name;
      const nextConsecutiveCount = lastWinner === winner ? consecutiveWinCount + 1 : 1;
      const isStreak = nextConsecutiveCount >= 2;
      setLastWinner(winner);
      setConsecutiveWinCount(nextConsecutiveCount);

      const showWinOverlay = (type: 'win' | 'streak' | 'champion') => {
        if (winOverlayTimerRef.current !== null) {
          window.clearTimeout(winOverlayTimerRef.current);
        }
        setWinOverlay({ teamName: winningTeamData.name, type });
        winOverlayTimerRef.current = window.setTimeout(() => setWinOverlay(null), 1000);
      };

      if (wasChampionMatch) {
          const championPlayersWithStats = championsTeam!.players.map(p => playerMap.get(p.id)!).filter(Boolean);
          const isValidChampionTeam = championPlayersWithStats.length === 5;
          
          if (!isValidChampionTeam) {
              toast({ variant: "destructive", title: "Equipo Campeón Inválido", description: "El equipo campeón se disolvió. Volviendo a la rotación normal." });
              setChampionsTeam(null);
          } else {
              setTeamA({ name: deriveTeamName(championPlayersWithStats, championsTeam!.name), players: championPlayersWithStats });
              setTeamB({ name: deriveTeamName(winningTeamWithStats, winningTeamData.name), players: winningTeamWithStats });
              setChampionsTeam(null);
              const loserIds = losingTeamData.players.map(p => p.id);
              setWaitingListIds(currentIds => [...currentIds, ...loserIds]);
              setPlayers(allPlayersAfterStats);
              setMatchStatus({ type: 'duel', teamName: winningTeamData.name, message: `${statusPrefix} ganó el duelo y ahora reta al campeón.` });
              toast({ title: "¡Duelo de Campeones!", description: `${championsTeam!.name} vs. ${winningTeamData.name}` });
              return;
          }
      }
      
      const teamHasReachedChampionStatus = championRule && winningTeamWithStats.every(p => p.consecutiveWins >= winsNeeded);
  
      if (teamHasReachedChampionStatus) {
          toast({ title: "¡Nuevos Campeones!", description: `${winningTeamData.name} ahora son campeones y descansarán.` });
          setChampionsTeam({ name: winningTeamData.name, players: winningTeamWithStats });
          setMatchStatus({ type: 'champion', teamName: winningTeamData.name, message: `${statusPrefix} se ha convertido en campeón y pasa a modo descanso.` });
          showWinOverlay('champion');
          
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
          const loserIds = losingTeamData.players.map(p => p.id);
          const newWaitingList = [...waitingListIds, ...loserIds];
          
          setMatchStatus({ type: 'win', teamName: winningTeamData.name, message: `${statusPrefix} ganó y avanza en la rotación.` });
          showWinOverlay(isStreak ? 'streak' : 'win');
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
  
  const decideWinnerFromScore = (result: { puntosA: number; puntosB: number; faltasA: number; faltasB: number; tiempoTranscurridoMs: number }) => {
  if (result.puntosA > result.puntosB) return 'A';
  if (result.puntosB > result.puntosA) return 'B';
  // tie on points -> fewer fouls wins
  if (result.faltasA < result.faltasB) return 'A';
  if (result.faltasB < result.faltasA) return 'B';
  // tie on fouls -> default to A
  return 'A';
};

const handleRecordWinWithScoreboard = () => {
  if (!scoreboardResult) return;
  const winner = decideWinnerFromScore(scoreboardResult);
  handleRecordWin(winner as 'A' | 'B');
  setScoreboardResult(null); // Reset for next match
};

const handleMoveInWaitingList = (playerId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (direction === 'top' || direction === 'bottom') {
      const player = players.find(p => p.id === playerId);
      if (player) {
        setPlayerToMove({ player, direction });
        setIsConfirmMoveOpen(true);
      }
    } else {
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
          return currentIds;
      });
    }
  };

  const handleConfirmMoveInWaitingList = () => {
    if (!playerToMove) return;
    const { player, direction } = playerToMove;
    setWaitingListIds(currentIds => {
      if (direction === 'top') {
        return [player.id, ...currentIds.filter(id => id !== player.id)];
      }
      if (direction === 'bottom') {
        return [...currentIds.filter(id => id !== player.id), player.id];
      }
      return currentIds;
    });
    toast({ title: "Jugador Movido", description: `${player.name} movido al ${direction === 'top' ? 'principio' : 'final'} de la lista.` });
    setIsConfirmMoveOpen(false);
    setPlayerToMove(null);
  };

  const handleReturnChampionToWaitingList = () => {
    if (!championsTeam) return;

    const championIds = championsTeam.players.map(p => p.id);
    setWaitingListIds(prev => [...prev, ...championIds]);
    setChampionsTeam(null);
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

  const handleResetList = () => {
    const sortedByCreatedAt = [...players].sort((a, b) => a.createdAt - b.createdAt).map(p => p.id);
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);
    setWaitingListIds(sortedByCreatedAt);
    setIsConfirmResetListOpen(false);

    toast({
      title: "Lista reiniciada",
      description: "Todos los jugadores regresan a la lista de espera en el orden en que fueron agregados.",
    });
  };

  const handleOpenInitialSelection = () => {
    setTempTeamAIds([]);
    setTempTeamBIds([]);
    setIsInitialSelectionOpen(true);
  };

  const handleToggleSelectPlayer = (playerId: string, team: 'A' | 'B') => {
    const isTeamA = team === 'A';
    const currentTeam = isTeamA ? tempTeamAIds : tempTeamBIds;
    const otherTeam = isTeamA ? tempTeamBIds : tempTeamAIds;

    if (currentTeam.includes(playerId)) {
      // Remove from current team
      if (isTeamA) setTempTeamAIds(prev => prev.filter(id => id !== playerId));
      else setTempTeamBIds(prev => prev.filter(id => id !== playerId));
    } else {
      // Add to current team if not in other team and team not full
      if (otherTeam.includes(playerId)) {
        toast({ variant: 'destructive', title: "Jugador ya asignado", description: "Este jugador ya está en el otro equipo." });
        return;
      }
      if (currentTeam.length >= 5) {
        toast({ variant: 'destructive', title: "Equipo lleno", description: "No puedes seleccionar más de 5 jugadores por equipo." });
        return;
      }
      if (isTeamA) setTempTeamAIds(prev => [...prev, playerId]);
      else setTempTeamBIds(prev => [...prev, playerId]);
    }
  };

  const handleFinalizeInitialSelection = () => {
    if (tempTeamAIds.length !== 5 || tempTeamBIds.length !== 5) return;

    saveStateForUndo();
    
    const playersA = tempTeamAIds.map(id => players.find(p => p.id === id)!);
    const playersB = tempTeamBIds.map(id => players.find(p => p.id === id)!);

    setTeamA({ name: deriveTeamName(playersA, 'Equipo A'), players: playersA });
    setTeamB({ name: deriveTeamName(playersB, 'Equipo B'), players: playersB });

    const allSelectedIds = [...tempTeamAIds, ...tempTeamBIds];
    setWaitingListIds(prev => prev.filter(id => !allSelectedIds.includes(id)));

    setIsInitialSelectionOpen(false);
    toast({ title: "Equipos formados", description: "Los equipos iniciales han sido creados correctamente." });
  };

  const handleStartSwap = (playerId: string, team: 'A' | 'B') => {
      const sourcePlayers = team === 'A' ? teamA.players : teamB.players;
      const targetPlayers = team === 'A' ? teamB.players : teamA.players;
      const sourcePlayer = sourcePlayers.find(p => p.id === playerId);

      if (!sourcePlayer) return;
      if (targetPlayers.length === 0) {
          toast({
              variant: 'destructive',
              title: 'No hay jugadores disponibles',
              description: `No hay jugadores en el equipo contrario para intercambiar con ${sourcePlayer.name}.`
          });
          return;
      }

      setSwapSource({ playerId, team, name: sourcePlayer.name });
      setIsSwapDialogOpen(true);
  };

  const handleConfirmSwap = (targetPlayerId: string) => {
      if (!swapSource) return;
      const targetTeam = swapSource.team === 'A' ? teamB : teamA;
      const targetPlayer = targetTeam.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer) return;
      setPendingSwapTarget(targetPlayer);
      setIsConfirmSwapOpen(true);
      setIsSwapDialogOpen(false);
  };

  const handleFinalizeSwap = () => {
      if (!swapSource || !pendingSwapTarget) return;
      const sourceTeam = swapSource.team === 'A' ? teamA : teamB;
      const targetTeam = swapSource.team === 'A' ? teamB : teamA;
      const sourcePlayer = sourceTeam.players.find(p => p.id === swapSource.playerId);
      const targetPlayer = pendingSwapTarget;

      if (!sourcePlayer) {
          setSwapSource(null);
          setPendingSwapTarget(null);
          setIsConfirmSwapOpen(false);
          return;
      }

      saveStateForUndo();
      const newSourcePlayers = sourceTeam.players.map(p => p.id === sourcePlayer.id ? targetPlayer : p);
      const newTargetPlayers = targetTeam.players.map(p => p.id === targetPlayer.id ? sourcePlayer : p);

      if (swapSource.team === 'A') {
          setTeamA({ name: deriveTeamName(newSourcePlayers, teamA.name), players: newSourcePlayers });
          setTeamB({ name: deriveTeamName(newTargetPlayers, teamB.name), players: newTargetPlayers });
      } else {
          setTeamA({ name: deriveTeamName(newTargetPlayers, teamA.name), players: newTargetPlayers });
          setTeamB({ name: deriveTeamName(newSourcePlayers, teamB.name), players: newSourcePlayers });
      }

      toast({
          title: 'Intercambio realizado',
          description: `${sourcePlayer.name} y ${targetPlayer.name} han cambiado de equipo.`
      });

      setSwapSource(null);
      setPendingSwapTarget(null);
      setIsConfirmSwapOpen(false);
  };

  const handleCancelSwap = () => {
      setSwapSource(null);
      setIsSwapDialogOpen(false);
  };

  const teamsAreFull = teamA.players.length >= 5 && teamB.players.length >= 5;

  if (!isLoaded) {
      return (
          <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 px-3 py-4 sm:px-5 sm:py-6 flex items-center justify-center">
              <div className="text-center">
                  <h1 className="font-bold text-5xl text-sky-400">Cargando...</h1>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 px-3 py-4 sm:px-5 sm:py-6">
      <main className="w-full max-w-[1800px] min-w-0 mx-auto pb-28">
        {winOverlay && (
          <div className={cn(
            "fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6 text-center transition-opacity duration-300",
            winOverlay.type === 'champion' || winOverlay.type === 'streak' ? "bg-amber-950/90" : "bg-slate-950/90"
          )}>
            <div className={cn(
              "rounded-[2rem] border p-8 shadow-2xl shadow-black/40 max-w-xl w-full transform-gpu transition-all duration-500 ease-out",
              winOverlay.type === 'champion'
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-amber-300 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.45)] scale-[1.03]"
                : winOverlay.type === 'streak'
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-amber-300 text-slate-950 shadow-[0_0_32px_rgba(245,158,11,0.35)] scale-[1.02]"
                : "bg-slate-900/95 border-slate-700 text-white backdrop-blur-sm"
            )}>
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "rounded-full p-4 shadow-2xl shadow-black/30",
                  winOverlay.type === 'champion'
                    ? "bg-amber-500 text-slate-950 animate-pulse"
                    : winOverlay.type === 'streak'
                    ? "bg-amber-500 text-slate-950 animate-pulse"
                    : "bg-slate-950 text-amber-400 animate-bounce"
                )}>
                  <Trophy className={cn("h-10 w-10", winOverlay.type === 'champion' ? "text-amber-900" : "text-amber-400")} />
                </div>
                <p className={cn("text-4xl font-black tracking-tight", winOverlay.type === 'champion' ? "text-amber-950" : "text-white")}>¡{winOverlay.teamName} {winOverlay.type === 'champion' ? 'es campeón' : 'ganó'}!</p>
                {winOverlay.type === 'streak' && (
                  <p className="mt-2 text-sm uppercase tracking-[0.3em] text-amber-900">Racha de victorias</p>
                )}
                {winOverlay.type === 'champion' && (
                  <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate-950">Coronados con estilo</p>
                )}
              </div>
            </div>
          </div>
        )}
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

        <AlertDialog open={isConfirmResetOpen} onOpenChange={setIsConfirmResetOpen}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">¿Reiniciar Día?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        Esta acción borrará todos los jugadores, estadísticas y datos guardados. No se puede deshacer. ¿Estás seguro?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => setIsConfirmResetOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmResetDay} className="bg-destructive hover:bg-red-700">Sí, reiniciar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">¿Eliminar Jugador?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        ¿Estás seguro de que quieres eliminar a {playerToRemove?.name}? Se perderán todas sus estadísticas y no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => { setIsConfirmRemoveOpen(false); setPlayerToRemove(null); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmRemovePlayer} className="bg-destructive hover:bg-red-700">Sí, eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmMoveOpen} onOpenChange={setIsConfirmMoveOpen}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-amber-400">¿Mover Jugador?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        ¿Mover a {playerToMove?.player.name} al {playerToMove?.direction === 'top' ? 'principio' : 'final'} de la lista de espera?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => { setIsConfirmMoveOpen(false); setPlayerToMove(null); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmMoveInWaitingList} className="bg-amber-600 hover:bg-amber-700">Sí, mover</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>


        <AlertDialog open={isConfirmSwapOpen} onOpenChange={(open) => {
            if (!open) {
                setPendingSwapTarget(null);
                setSwapSource(null);
            }
            setIsConfirmSwapOpen(open);
        }}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-sky-400">¿Confirmar Intercambio?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        ¿Intercambiar a {swapSource?.name} con {pendingSwapTarget?.name}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => { setIsConfirmSwapOpen(false); setPendingSwapTarget(null); setSwapSource(null); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalizeSwap} className="bg-sky-600 hover:bg-sky-700">Sí, intercambiar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmResetListOpen} onOpenChange={setIsConfirmResetListOpen}>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-amber-400">¿Reiniciar Lista?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        Esto devolverá a todos los jugadores a la lista de espera y vaciará los equipos actuales. Las estadísticas individuales se mantendrán. ¿Deseas continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 hover:bg-slate-700" onClick={() => setIsConfirmResetListOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetList} className="bg-amber-600 hover:bg-amber-700">Sí, reiniciar</AlertDialogAction>
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

        <Dialog open={isSwapDialogOpen} onOpenChange={(isOpen) => !isOpen && handleCancelSwap()}>
            <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-sky-400">Intercambio entre equipos</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-slate-400">
                        Selecciona un jugador del equipo {swapSource?.team === 'A' ? teamB.name : teamA.name} para intercambiar con <span className="font-semibold text-white">{swapSource?.name}</span>.
                    </p>
                    {(swapSource?.team === 'A' ? teamB.players : teamA.players).map((player) => (
                        <Button key={player.id} variant="outline" className="w-full justify-between" onClick={() => handleConfirmSwap(player.id)}>
                            <span>{player.name}</span>
                            <span className="text-slate-400">↔</span>
                        </Button>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancelSwap}>Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <header className="mb-6">
            <div className="flex items-center justify-start gap-3 rounded-[1.75rem] border border-slate-700/50 bg-slate-950/80 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-6">
              <img src="/bluerotationicon.png" alt="Icono de Rotación Deportiva" className="h-9 w-9 sm:h-10 sm:w-10" />
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)] xl:grid-cols-[minmax(420px,560px)_minmax(0,1fr)] gap-6 xl:gap-8">
          
          <div className="space-y-6">
            <Card className="bg-slate-800/95 border border-slate-700/60 shadow-xl shadow-black/10 backdrop-blur-sm">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-300"><Plus/> Añadir Nuevo Jugador</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col gap-2">
                    <Textarea 
                      placeholder="Añadir un jugador por línea o pegar una lista." 
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="bg-slate-700 border-slate-600 placeholder:text-slate-500"
                    />
                            <Button size="lg" onClick={handleAddPlayer} className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl">Añadir</Button>
                  </div>
              </CardContent>
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

            <Card className="bg-slate-800/95 border border-slate-700/60 shadow-xl shadow-black/10 backdrop-blur-sm">
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
          </div>

          <div className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl text-sky-400">{championsTeam ? "Partido Interino" : "Equipos Actuales"}</CardTitle>
                        {championsTeam && <CardDescription className="text-yellow-400">El ganador de este partido se enfrentará al campeón: {championsTeam.name}</CardDescription>}
                    </div>
                    {teamA.players.length === 0 && teamB.players.length === 0 && waitingPlayers.length >= 10 && (
                        <Button 
                            onClick={handleOpenInitialSelection}
                            className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg shadow-sky-500/20"
                        >
                            <ListChecks className="mr-2 h-4 w-4" /> Selección Inicial
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="team-a" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="team-a">{teamA.name}</TabsTrigger>
                            <TabsTrigger value="team-b">{teamB.name}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="team-a">
                            <TeamColumn team={teamA} swapTeam="A" onRemovePlayer={handleRemoveFromTeam} onEditPlayer={handleOpenEditPlayer} onSwapPlayer={handleStartSwap} teamType="A" />
                        </TabsContent>
                        <TabsContent value="team-b">
                            <TeamColumn team={teamB} swapTeam="B" onRemovePlayer={handleRemoveFromTeam} onEditPlayer={handleOpenEditPlayer} onSwapPlayer={handleStartSwap} teamType="B" />
                        </TabsContent>
                    </Tabs>

                    <Separator className="bg-slate-700"/>

                    <div className="text-center space-y-4">
                        <h3 className="text-2xl text-sky-400">Registrar Resultado del Partido</h3>
                        <div className="flex flex-col gap-3">
                          {matchStatus && (
                            <div role="status" aria-live="polite" className={cn(
                              "rounded-3xl border px-4 py-3 text-sm font-medium",
                              matchStatus.type === 'champion' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-100' : matchStatus.type === 'duel' ? 'bg-sky-500/10 border-sky-400 text-sky-100' : 'bg-slate-900/80 border-slate-700 text-slate-100'
                            )}>
                              {matchStatus.message}
                            </div>
                          )}
                          <div className="flex flex-col items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                              <Switch 
                                id="use-scoreboard" 
                                checked={useScoreboard} 
                                onCheckedChange={(val) => {
                                  if (!val && (scoreboardOpen || scoreboardMinimized)) {
                                    toast({
                                      variant: 'destructive',
                                      title: "Partido en curso",
                                      description: "Debes finalizar el partido en el marcador interactivo antes de volver al marcador normal."
                                    });
                                    return;
                                  }
                                  setUseScoreboard(val);
                                  if (!val) {
                                    setScoreboardOpen(false);
                                    setScoreboardMinimized(false);
                                    setScoreboardResult(null);
                                  }
                                }} 
                              />
                              <Label htmlFor="use-scoreboard" className="text-slate-300 font-medium cursor-pointer">Usar Marcador Interactivo</Label>
                            </div>

                            {useScoreboard && (
                              <div className="flex flex-col items-center gap-2 w-full">
                                {!scoreboardResult ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full bg-sky-500/10 border-sky-500/50 text-sky-400 hover:bg-sky-500/20"
                                    onClick={() => setScoreboardOpen(true)}
                                  >
                                    <Swords className="mr-2 h-4 w-4" /> Abrir Marcador
                                  </Button>
                                ) : (
                                  <div className="w-full space-y-2">
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-center">
                                      <p className="text-emerald-400 font-bold">Marcador Finalizado</p>
                                      <p className="text-sm text-emerald-300/70">
                                        {teamA.name} {scoreboardResult.puntosA} - {scoreboardResult.puntosB} {teamB.name}
                                      </p>
                                    </div>
                                    <Button 
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                      onClick={handleRecordWinWithScoreboard}
                                    >
                                      Registrar este resultado
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="w-full text-slate-400 text-xs"
                                      onClick={() => setScoreboardResult(null)}
                                    >
                                      Descartar y repetir marcador
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {!useScoreboard && (
                            <div className="flex flex-wrap justify-center gap-4">
                              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none transition-transform duration-200 hover:-translate-y-0.5" onClick={() => handleRecordWin('A')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                  <Trophy className="mr-2 h-4 w-4"/> Ganó {teamA.name}
                              </Button>
                              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none transition-transform duration-200 hover:-translate-y-0.5" onClick={() => handleRecordWin('B')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                  <Trophy className="mr-2 h-4 w-4"/> Ganó {teamB.name}
                              </Button>
                            </div>
                          )}
                        </div>

                        {useScoreboard && (
                          <BasketballScoreboard 
                            isOpen={scoreboardOpen}
                            onClose={() => setScoreboardOpen(false)}
                            onMinimize={() => {
                              setScoreboardOpen(false);
                              setScoreboardMinimized(true);
                            }}
                            teamAName={teamA.name}
                            teamBName={teamB.name}
                            onSubmit={(res) => {
                              setScoreboardResult(res);
                              setScoreboardOpen(false);
                              setScoreboardMinimized(false);
                              toast({
                                title: "Marcador Finalizado",
                                description: `Resultado: ${res.puntosA} - ${res.puntosB}. Pulsa registrar para guardar.`,
                              });
                            }}
                          />
                        )}
                         <div className="pt-4">
                            <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl mx-auto">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-sky-400">Acciones del Día</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                                      <DialogTrigger asChild>
                                          <Button className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
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
                                                            <p className="font-bold text-emerald-400">Victorias: {player.wins}</p>
                                                            <p className="font-semibold text-rose-400">Derrotas: {player.losses}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                <p className="text-slate-500 text-center py-8">No se han registrado jugadores hoy.</p>
                                                )}
                                            </div>
                                          </ScrollArea>
                                          <DialogFooter id="summary-dialog-footer" className="sm:justify-between gap-2 mt-4 flex-col-reverse sm:flex-row">
                                            <Button type="button" variant="secondary" onClick={() => setIsConfirmResetListOpen(true)} className="w-full sm:w-auto">
                                                Reiniciar Lista
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" className="w-full sm:w-auto">
                                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                                        Finalizar Día
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
                                                        <AlertDialogAction onClick={handleResetDay} className="bg-destructive hover:bg-red-700">Sí, finalizar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <Button type="button" variant="secondary" onClick={() => setIsSummaryOpen(false)}>
                                                Cerrar
                                            </Button>
                                          </DialogFooter>
                                      </DialogContent>
                                  </Dialog>
                                  <Button className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleUndo} disabled={undoStack.length === 0}>
                                      <History className="mr-2 h-4 w-4"/>
                                      Deshacer Última Acción
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
        <Dialog open={isInitialSelectionOpen} onOpenChange={setIsInitialSelectionOpen}>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-slate-100 p-0 overflow-hidden rounded-[2rem]">
                <DialogHeader className="p-6 bg-slate-800/50">
                    <DialogTitle className="text-3xl font-black text-sky-400 flex items-center gap-3">
                        <ListChecks className="h-8 w-8" /> Formar Equipos Iniciales
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-lg">
                        Selecciona 5 jugadores para cada equipo de los primeros 10 alistados.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[calc(95dvh-180px)]">
                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Team A Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold text-sky-400">Equipo A</h4>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-sm font-bold",
                                        tempTeamAIds.length === 5 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {tempTeamAIds.length}/5
                                    </span>
                                </div>
                                <div className="space-y-2 min-h-[200px] p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                    {tempTeamAIds.map(id => {
                                        const p = players.find(player => player.id === id);
                                        return p ? (
                                            <div key={id} className="flex items-center justify-between bg-slate-700/80 p-3 rounded-xl border border-slate-600">
                                                <span className="font-bold">{p.name}</span>
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleSelectPlayer(id, 'A')} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400">
                                                    <CloseIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : null;
                                    })}
                                    {tempTeamAIds.length === 0 && (
                                        <p className="text-slate-500 text-center text-sm py-8 italic">Sin jugadores asignados</p>
                                    )}
                                </div>
                            </div>

                            {/* Available Players (First 10) */}
                            <div className="space-y-4">
                                <h4 className="text-xl font-bold text-slate-300 text-center">Jugadores Disponibles</h4>
                                <div className="space-y-2">
                                    {waitingListIds.slice(0, 10).map((id) => {
                                        const p = players.find(player => player.id === id);
                                        if (!p) return null;
                                        const isSelectedA = tempTeamAIds.includes(id);
                                        const isSelectedB = tempTeamBIds.includes(id);
                                        const isSelected = isSelectedA || isSelectedB;

                                        return (
                                            <div key={id} className={cn(
                                                "flex items-center justify-between p-2 rounded-xl transition-all border",
                                                isSelected ? "bg-slate-800/30 border-transparent opacity-50" : "bg-slate-800 border-slate-700 hover:border-sky-500/50"
                                            )}>
                                                <span className="font-medium ml-2">{p.name}</span>
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant={isSelectedA ? "default" : "outline"}
                                                        disabled={isSelectedB || (!isSelectedA && tempTeamAIds.length >= 5)}
                                                        onClick={() => handleToggleSelectPlayer(id, 'A')}
                                                        className={cn(
                                                            "h-8 px-3 rounded-lg text-xs font-bold",
                                                            isSelectedA ? "bg-sky-600 hover:bg-sky-700" : "border-slate-600 hover:bg-sky-600/10"
                                                        )}
                                                    >
                                                        A
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant={isSelectedB ? "default" : "outline"}
                                                        disabled={isSelectedA || (!isSelectedB && tempTeamBIds.length >= 5)}
                                                        onClick={() => handleToggleSelectPlayer(id, 'B')}
                                                        className={cn(
                                                            "h-8 px-3 rounded-lg text-xs font-bold",
                                                            isSelectedB ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-600 hover:bg-emerald-600/10"
                                                        )}
                                                    >
                                                        B
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Team B Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold text-emerald-400">Equipo B</h4>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-sm font-bold",
                                        tempTeamBIds.length === 5 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {tempTeamBIds.length}/5
                                    </span>
                                </div>
                                <div className="space-y-2 min-h-[200px] p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                    {tempTeamBIds.map(id => {
                                        const p = players.find(player => player.id === id);
                                        return p ? (
                                            <div key={id} className="flex items-center justify-between bg-slate-700/80 p-3 rounded-xl border border-slate-600">
                                                <span className="font-bold">{p.name}</span>
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleSelectPlayer(id, 'B')} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400">
                                                    <CloseIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : null;
                                    })}
                                    {tempTeamBIds.length === 0 && (
                                        <p className="text-slate-500 text-center text-sm py-8 italic">Sin jugadores asignados</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 bg-slate-800/50 border-t border-slate-700/50 flex sm:justify-between items-center">
                    <Button variant="outline" onClick={() => setIsInitialSelectionOpen(false)} className="rounded-xl border-slate-600">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleFinalizeInitialSelection} 
                        disabled={tempTeamAIds.length !== 5 || tempTeamBIds.length !== 5}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 rounded-xl disabled:opacity-50 disabled:bg-slate-700"
                    >
                        Confirmar y Empezar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        {scoreboardMinimized && (
          <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button 
              className="h-14 sm:h-16 px-4 sm:px-6 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl shadow-2xl shadow-sky-900/40 border border-sky-500/50 flex items-center gap-3 sm:gap-4 group"
              onClick={() => {
                setScoreboardMinimized(false);
                setScoreboardOpen(true);
              }}
            >
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Timer className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">Marcador</p>
                <p className="font-black text-sm sm:text-lg">En curso</p>
              </div>
              <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2 opacity-50 group-hover:opacity-100" />
            </Button>
          </div>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 block sm:hidden">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-2 border-t border-slate-800/70 bg-slate-950/95 px-4 py-3 shadow-[0_-12px_30px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <Button size="sm" variant="secondary" className="flex-1 rounded-2xl" onClick={() => setIsSummaryOpen(true)}>
            Resumen
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 rounded-2xl" onClick={handleUndo} disabled={undoStack.length === 0}>
            Deshacer
          </Button>
          <Button size="sm" variant="outline" className="flex-1 rounded-2xl" onClick={() => setIsConfirmResetListOpen(true)}>
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  );
}

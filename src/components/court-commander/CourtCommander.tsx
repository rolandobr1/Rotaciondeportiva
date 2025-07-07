
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
import { Users, Crown, Plus, Trash2, Swords, Trophy, ChevronUp, ChevronDown, Newspaper, RefreshCw, X as CloseIcon } from 'lucide-react';
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

const PlayerCard = ({ player, onRemove, onAssign, showAssign, isChampion, turn, onMoveUp, onMoveDown, isFirst, isLast, isTeamAFull, isTeamBFull }: { player: Player, onRemove?: (id: string) => void, onAssign?: (id: string, team: 'A' | 'B') => void, showAssign?: boolean, isChampion?: boolean, turn?: number, onMoveUp?: (id: string) => void, onMoveDown?: (id: string) => void, isFirst?: boolean, isLast?: boolean, isTeamAFull?: boolean, isTeamBFull?: boolean }) => (
  <div className={cn(
    "relative flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
    isChampion ? "bg-amber-500" : "bg-slate-700"
  )}>
    <div className="flex items-center gap-3 overflow-hidden">
        {onMoveUp && onMoveDown && (
            <div className="flex flex-col">
                <Button size="icon" variant="ghost" className="h-5 w-5 p-0 text-slate-400 hover:text-white disabled:opacity-30" onClick={() => onMoveUp(player.id)} disabled={isFirst}>
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-5 w-5 p-0 text-slate-400 hover:text-white disabled:opacity-30" onClick={() => onMoveDown(player.id)} disabled={isLast}>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
        )}
        <div className="overflow-hidden">
            <p className={cn("font-bold truncate", isChampion ? "text-black" : "text-sky-400")}>
                {turn && <span className="mr-2 text-slate-400 font-normal">{turn}.</span>}
                {player.name}
            </p>
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

const TeamColumn = ({ team, onRemovePlayer }: { team: Team, onRemovePlayer: (playerId: string) => void }) => {
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
                    team.players.map(p => <PlayerCard key={p.id} player={p} onRemove={() => onRemovePlayer(p.id)} />)
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
    if (winningTeam.players.some(wp => wp.id === p.id)) {
      const newWins = p.wins + 1;
      return {
        ...p,
        wins: newWins,
        consecutiveWins: (p.consecutiveWins || 0) + 1,
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
    // Reset consecutive wins for resting champions if they didn't play
    if (championsTeam && championsTeam.players.some(cp => cp.id === p.id)) {
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
  const [winsToChampion, setWinsToChampion] = useState(2);
  const [isConfirmDisableChampionsOpen, setIsConfirmDisableChampionsOpen] = useState(false);

  const { toast } = useToast();

  const STORAGE_KEYS = useMemo(() => ({
    PLAYERS: 'rotacionDeportiva.players',
    WAITING_LIST: 'rotacionDeportiva.waitingListIds',
    TEAM_A: 'rotacionDeportiva.teamA',
    TEAM_B: 'rotacionDeportiva.teamB',
    CHAMPIONS: 'rotacionDeportiva.championsTeam',
    WINS_TO_CHAMPION: 'rotacionDeportiva.winsToChampion',
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
    } catch (error) {
      console.error("Error al guardar datos en localStorage", error);
    }
  }, [players, waitingListIds, teamA, teamB, championsTeam, winsToChampion, isLoaded, STORAGE_KEYS]);


  const waitingPlayers = useMemo(() => {
      const waitingPlayersMap = new Map(players.map(p => [p.id, p]));
      return waitingListIds
          .map(id => waitingPlayersMap.get(id))
          .filter(Boolean) as Player[];
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
      setWaitingListIds(prev => [...prev, ...championsTeam.players.map(p => p.id)]);
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
    
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.WAITING_LIST);
    localStorage.removeItem(STORAGE_KEYS.TEAM_A);
    localStorage.removeItem(STORAGE_KEYS.TEAM_B);
    localStorage.removeItem(STORAGE_KEYS.CHAMPIONS);
    
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
    };
    setPlayers(prev => [...prev, newPlayer]);
    setWaitingListIds(prev => [...prev, newPlayer.id]);
    setNewPlayerName('');
    toast({ title: "Jugador Añadido", description: `${newPlayer.name} está ahora en la lista de espera.` });
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(p => p.filter(player => player.id !== id));
    setWaitingListIds(ids => ids.filter(playerId => playerId !== id));
    setTeamA(t => {
      const newPlayers = t.players.filter(p => p.id !== id);
      const newName = newPlayers.length > 0 ? `Equipo ${newPlayers[0].name}` : 'Equipo A';
      return { ...t, players: newPlayers, name: newName };
    });
    setTeamB(t => {
      const newPlayers = t.players.filter(p => p.id !== id);
      const newName = newPlayers.length > 0 ? `Equipo ${newPlayers[0].name}` : 'Equipo B';
      return { ...t, players: newPlayers, name: newName };
    });
    setChampionsTeam(ct => {
        if (!ct) return null;
        const newPlayers = ct.players.filter(p => p.id !== id);
        if (newPlayers.length === 0) return null;
        const newName = newPlayers.length > 0 ? `Equipo ${newPlayers[0].name}` : 'Campeones';
        return { ...ct, players: newPlayers, name: newName };
    });
  };
  
  const handleAssignPlayer = (playerId: string, team: 'A' | 'B') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (team === 'A') {
        if (teamA.players.length >= 5) {
            toast({ variant: 'destructive', title: "Equipo A ya está lleno." });
            return;
        }

        const newTeamAPlayers = [...teamA.players, player];
        const updatedWaitingIds = waitingListIds.filter(id => id !== playerId);

        setTeamA({ players: newTeamAPlayers, name: `Equipo ${newTeamAPlayers[0].name}` });

        if (newTeamAPlayers.length === 5 && teamB.players.length === 0 && updatedWaitingIds.length >= 5) {
            const playersForTeamB = updatedWaitingIds.slice(0, 5).map(id => players.find(p => p.id === id)!);
            setTeamB({ players: playersForTeamB, name: `Equipo ${playersForTeamB[0].name}` });
            setWaitingListIds(updatedWaitingIds.slice(5));
            toast({
                title: "Equipo B auto-completado",
                description: "Los 5 siguientes jugadores han formado el equipo.",
            });
        } else {
            setWaitingListIds(updatedWaitingIds);
        }
    } else { // team === 'B'
        if (teamB.players.length >= 5) {
            toast({ variant: 'destructive', title: "Equipo B ya está lleno." });
            return;
        }

        const newTeamBPlayers = [...teamB.players, player];
        const updatedWaitingIds = waitingListIds.filter(id => id !== playerId);

        setTeamB({ players: newTeamBPlayers, name: `Equipo ${newTeamBPlayers[0].name}` });

        if (newTeamBPlayers.length === 5 && teamA.players.length === 0 && updatedWaitingIds.length >= 5) {
            const playersForTeamA = updatedWaitingIds.slice(0, 5).map(id => players.find(p => p.id === id)!);
            setTeamA({ players: playersForTeamA, name: `Equipo ${playersForTeamA[0].name}` });
            setWaitingListIds(updatedWaitingIds.slice(5));
            toast({
                title: "Equipo A auto-completado",
                description: "Los 5 siguientes jugadores han formado el equipo.",
            });
        } else {
            setWaitingListIds(updatedWaitingIds);
        }
    }
  };

  const handleRemoveFromTeam = (playerId: string) => {
    const playerToRemove = players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const teamId = teamA.players.find(p => p.id === playerId) ? 'A' : teamB.players.find(p => p.id === playerId) ? 'B' : null;
    if (!teamId) return;

    const nextPlayerFromWaitingList = waitingPlayers.length > 0 ? waitingPlayers[0] : null;

    if (teamId === 'A') {
      setTeamA(t => {
        let newPlayers = t.players.filter(p => p.id !== playerId);
        if (nextPlayerFromWaitingList) {
          newPlayers.push(nextPlayerFromWaitingList);
        }
        const newName = newPlayers.length > 0 ? `Equipo ${newPlayers[0].name}` : 'Equipo A';
        return { ...t, players: newPlayers, name: newName };
      });
    } else { // teamId === 'B'
      setTeamB(t => {
        let newPlayers = t.players.filter(p => p.id !== playerId);
        if (nextPlayerFromWaitingList) {
          newPlayers.push(nextPlayerFromWaitingList);
        }
        const newName = newPlayers.length > 0 ? `Equipo ${newPlayers[0].name}` : 'Equipo B';
        return { ...t, players: newPlayers, name: newName };
      });
    }

    setWaitingListIds(currentIds => {
      const idsAfterPromotion = nextPlayerFromWaitingList ? currentIds.slice(1) : currentIds;
      return [...idsAfterPromotion, playerId];
    });

    if (nextPlayerFromWaitingList) {
      toast({ title: "Rotación Automática", description: `${playerToRemove.name} vuelve a la cola. ${nextPlayerFromWaitingList.name} entra al juego.` });
    } else {
      toast({ title: "Jugador en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera.` });
    }
  };

  const handleRemoveFromChampionTeam = (playerId: string) => {
    if (!championsTeam) return;

    const playerToRemove = championsTeam.players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const nextPlayerFromWaitingList = waitingPlayers.length > 0 ? waitingPlayers[0] : null;

    let newChampionPlayers = championsTeam.players.filter(p => p.id !== playerId);
    let newWaitingListIds = waitingListIds;

    if (nextPlayerFromWaitingList) {
        newChampionPlayers.push(nextPlayerFromWaitingList); 
        newWaitingListIds = newWaitingListIds.slice(1); 
        toast({ title: "Rotación de Campeón", description: `${playerToRemove.name} vuelve a la cola. ${nextPlayerFromWaitingList.name} se une a los campeones.` });
    } else {
        toast({ title: "Campeón en Espera", description: `${playerToRemove.name} ha vuelto a la lista de espera. El equipo campeón está incompleto.` });
    }
    
    setWaitingListIds([...newWaitingListIds, playerId]);

    if (newChampionPlayers.length === 0) {
        setChampionsTeam(null);
    } else {
        setChampionsTeam({
            ...championsTeam,
            players: newChampionPlayers,
        });
    }
  };

  const handleMovePlayerUp = (playerId: string) => {
    setWaitingListIds(prevIds => {
      const index = prevIds.indexOf(playerId);
      if (index > 0) {
        const newIds = [...prevIds];
        [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
        return newIds;
      }
      return prevIds;
    });
  };

  const handleMovePlayerDown = (playerId: string) => {
    setWaitingListIds(prevIds => {
      const index = prevIds.indexOf(playerId);
      if (index < prevIds.length - 1 && index !== -1) {
        const newIds = [...prevIds];
        [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
        return newIds;
      }
      return prevIds;
    });
  };

  const handleInterimMatchWin = (winningTeamData: Team, losingTeamData: Team) => {
      toast({ title: "Partido Interino Finalizado", description: `El ${winningTeamData.name} se enfrentará al campeón.` });

      const updatedPlayers = updatePlayerStats(players, winningTeamData, losingTeamData, championsTeam);
      const updatedPlayerMap = new Map(updatedPlayers.map(p => [p.id, p]));

      const newChampionsPlayers = championsTeam!.players.map(p => updatedPlayerMap.get(p.id)!);
      const newChallengers = winningTeamData.players.map(p => updatedPlayerMap.get(p.id)!);
      
      setPlayers(updatedPlayers);
      setTeamA({ name: `Equipo ${newChampionsPlayers[0].name}`, players: newChampionsPlayers });
      setTeamB({ name: `Equipo ${newChallengers[0].name}`, players: newChallengers });
      setWaitingListIds(prev => [...prev, ...losingTeamData.players.map(p => p.id)]);
      setChampionsTeam(null);
  }

  const handleNewChampions = (winningTeamData: Team, losingTeamData: Team, winningTeamPlayers: Player[], updatedPlayers: Player[]) => {
      toast({title: "¡Nuevos Campeones!", description: `${winningTeamData.name} ahora son campeones y descansarán.`});
      
      setChampionsTeam({ name: "Campeones", players: winningTeamPlayers });

      const losersToWaitingList = [...waitingListIds, ...losingTeamData.players.map(p => p.id)];

      if (losersToWaitingList.length < 10) {
          toast({ variant: 'destructive', title: "No hay suficientes jugadores", description: "No hay suficientes jugadores en espera para un partido interino. Los equipos se han vaciado." });
          setTeamA({ name: 'Equipo A', players: [] });
          setTeamB({ name: 'Equipo B', players: [] });
          setWaitingListIds(losersToWaitingList);
      } else {
          const playersForInterim = losersToWaitingList.slice(0, 10).map(id => updatedPlayers.find(p => p.id === id)!);
          setTeamA({ name: `Equipo ${playersForInterim[0].name}`, players: playersForInterim.slice(0, 5) });
          setTeamB({ name: `Equipo ${playersForInterim[5].name}`, players: playersForInterim.slice(5, 10) });
          setWaitingListIds(losersToWaitingList.slice(10));
      }
      setPlayers(updatedPlayers);
  }

  const handleStandardRotation = (winner: 'A'|'B', winningTeamPlayers: Player[], losingTeamData: Team, updatedPlayers: Player[]) => {
      const losersToWaitingList = [...waitingListIds, ...losingTeamData.players.map(p => p.id)];
      
      const playersForNewTeamIds = losersToWaitingList.slice(0, 5);
      
      if (playersForNewTeamIds.length < 5) {
          toast({ variant: 'destructive', title: "No hay suficientes jugadores", description: "No hay suficientes retadores. El equipo ganador se queda solo." });
          const winnerTeamWithStats = { name: `Equipo ${winningTeamPlayers[0].name}`, players: winningTeamPlayers };
          
          if (winner === 'A') {
              setTeamA(winnerTeamWithStats);
              setTeamB({ name: 'Equipo B', players: [] });
          } else {
              setTeamB(winnerTeamWithStats);
              setTeamA({ name: 'Equipo A', players: [] });
          }
          setWaitingListIds(losersToWaitingList);
      } else {
          const remainingWaitingList = losersToWaitingList.slice(5);
          const newChallengerPlayers = playersForNewTeamIds.map(id => updatedPlayers.find(p => p.id === id)!);
          const newChallengers = {
              name: `Equipo ${newChallengerPlayers[0].name}`,
              players: newChallengerPlayers
          };

          const winnerTeamWithStats = {
            name: (winner === 'A' ? teamA : teamB).name,
            players: winningTeamPlayers,
          };
          
          if (winner === 'A') {
              setTeamA(winnerTeamWithStats);
              setTeamB(newChallengers);
          } else {
              setTeamA(newChallengers);
              setTeamB(winnerTeamWithStats);
          }
          setWaitingListIds(remainingWaitingList);
      }
      setPlayers(updatedPlayers);
  }

  const handleRecordWin = (winner: 'A' | 'B') => {
    const winningTeamData = winner === 'A' ? teamA : teamB;
    const losingTeamData = winner === 'A' ? teamB : teamA;

    if (winningTeamData.players.length < 5 || losingTeamData.players.length < 5) {
        toast({variant: 'destructive', title: "Equipos incompletos", description: "Ambos equipos deben tener 5 jugadores."});
        return;
    }
    
    if (championsTeam) {
      handleInterimMatchWin(winningTeamData, losingTeamData);
      return;
    }

    const updatedPlayers = updatePlayerStats(players, winningTeamData, losingTeamData);
    const updatedPlayerMap = new Map(updatedPlayers.map(p => [p.id, p]));
    const winningTeamCurrentPlayers = winningTeamData.players.map(p => updatedPlayerMap.get(p.id)!);
    const finalConsecutiveWins = winningTeamCurrentPlayers.length > 0 ? winningTeamCurrentPlayers[0].consecutiveWins : 0;

    if (championRule && finalConsecutiveWins >= winsToChampion) {
      handleNewChampions(winningTeamData, losingTeamData, winningTeamCurrentPlayers, updatedPlayers);
    } else {
      handleStandardRotation(winner, winningTeamCurrentPlayers, losingTeamData, updatedPlayers);
    }
  };

  const handleReturnChampionToWaitingList = () => {
    if (!championsTeam) return;
    setWaitingListIds(prev => [...prev, ...championsTeam.players.map(c => c.id)]);
    setChampionsTeam(null);
  };

  const handleSendAllToWaitingList = () => {
    const activePlayerIds = new Set([
      ...teamA.players.map(p => p.id),
      ...teamB.players.map(p => p.id),
      ...(championsTeam ? championsTeam.players.map(p => p.id) : []),
    ]);

    const playersToReturn = players
      .filter(p => activePlayerIds.has(p.id))
      .map(p => p.id);
      
    const newWaitingList = [...waitingListIds, ...playersToReturn]
      .filter((id, index, self) => self.indexOf(id) === index);

    setWaitingListIds(newWaitingList);
    
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);

    toast({
      title: "Jugadores en Espera",
      description: "Todos los jugadores en equipos activos han sido movidos a la lista de espera.",
    });
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
        <header className="text-center mb-8">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-sky-400 flex items-center justify-center gap-4 whitespace-nowrap">
                <img src="/bluerotationicon.png" alt="Icono de Rotación Deportiva" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"/>
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
                                            showAssign={true}
                                            onMoveUp={handleMovePlayerUp}
                                            onMoveDown={handleMovePlayerDown}
                                            isFirst={index === 0}
                                            isLast={index === waitingPlayers.length - 1}
                                            isTeamAFull={teamA.players.length >= 5}
                                            isTeamBFull={teamB.players.length >= 5}
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
                                        Racha Actual: {championsTeam.players[0].consecutiveWins} victorias. Esperando retador.
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
                                        <Label htmlFor="wins-to-champion">Victorias para ser campe\xf3n:</Label>
                                        <Input
                                            id="wins-to-champion"
                                            type="number"
                                            value={winsToChampion}
                                            onChange={(e) => setWinsToChampion(Math.max(1, Number(e.target.value)))}
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
                            <TeamColumn team={teamA} onRemovePlayer={handleRemoveFromTeam} />
                        </TabsContent>
                        <TabsContent value="team-b">
                            <TeamColumn team={teamB} onRemovePlayer={handleRemoveFromTeam} />
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
                                                    <Button type="button" variant="secondary" onClick={() => setIsSummaryOpen(false)}>
                                                        Cerrar
                                                    </Button>
                                                </div>
                                          </DialogFooter>
                                      </DialogContent>
                                  </Dialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Enviar todos a espera
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-amber-400">¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-300">
                                            Esta acción moverá a todos los jugadores de los equipos y campeones a la lista de espera.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-slate-600 hover:bg-slate-700">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSendAllToWaitingList} className="bg-destructive hover:bg-red-700">Sí, enviar a todos</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Player, Team } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEYS = {
  PLAYERS: 'rotacionDeportiva.players_v2',
  WAITING_LIST: 'rotacionDeportiva.waitingListIds_v2',
  TEAM_A: 'rotacionDeportiva.teamA_v2',
  TEAM_B: 'rotacionDeportiva.teamB_v2',
  CHAMPIONS: 'rotacionDeportiva.championsTeam_v2',
  WINS_TO_CHAMPION: 'rotacionDeportiva.winsToChampion_v2',
  SAVED_WAITING_LIST: 'rotacionDeportiva.savedWaitingList_v2',
  SAVED_PLAYERS: 'rotacionDeportiva.savedPlayers_v2',
  HISTORY: 'rotacionDeportiva.history_v2',
};

interface GameState {
  players: Player[];
  waitingListIds: string[];
  teamA: Team;
  teamB: Team;
  championsTeam: Team | null;
}

export function useRotationEngine() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [waitingListIds, setWaitingListIds] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<Team>({ name: 'Equipo A', players: [] });
  const [teamB, setTeamB] = useState<Team>({ name: 'Equipo B', players: [] });
  const [championsTeam, setChampionsTeam] = useState<Team | null>(null);
  const [winsToChampion, setWinsToChampion] = useState<number>(2);
  const [championRule, setChampionRule] = useState(false);
  
  const [history, setHistory] = useState<GameState[]>([]);
  const [savedWaitingList, setSavedWaitingList] = useState<string[] | null>(null);
  const [savedPlayers, setSavedPlayers] = useState<Player[] | null>(null);

  const { toast } = useToast();

  const deriveTeamName = useCallback((players: Player[], defaultName: string): string => {
    if (players.length > 0) {
      return `Equipo ${players[0].name}`;
    }
    return defaultName;
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = (key: string) => localStorage.getItem(key);
      if (stored(STORAGE_KEYS.PLAYERS)) setPlayers(JSON.parse(stored(STORAGE_KEYS.PLAYERS)!));
      if (stored(STORAGE_KEYS.WAITING_LIST)) setWaitingListIds(JSON.parse(stored(STORAGE_KEYS.WAITING_LIST)!));
      if (stored(STORAGE_KEYS.TEAM_A)) setTeamA(JSON.parse(stored(STORAGE_KEYS.TEAM_A)!));
      if (stored(STORAGE_KEYS.TEAM_B)) setTeamB(JSON.parse(stored(STORAGE_KEYS.TEAM_B)!));
      if (stored(STORAGE_KEYS.CHAMPIONS)) setChampionsTeam(JSON.parse(stored(STORAGE_KEYS.CHAMPIONS)!));
      if (stored(STORAGE_KEYS.WINS_TO_CHAMPION)) setWinsToChampion(JSON.parse(stored(STORAGE_KEYS.WINS_TO_CHAMPION)!));
      if (stored(STORAGE_KEYS.SAVED_WAITING_LIST)) setSavedWaitingList(JSON.parse(stored(STORAGE_KEYS.SAVED_WAITING_LIST)!));
      if (stored(STORAGE_KEYS.SAVED_PLAYERS)) setSavedPlayers(JSON.parse(stored(STORAGE_KEYS.SAVED_PLAYERS)!));
    } catch (e) {
      console.error("Error loading state", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    localStorage.setItem(STORAGE_KEYS.WAITING_LIST, JSON.stringify(waitingListIds));
    localStorage.setItem(STORAGE_KEYS.TEAM_A, JSON.stringify(teamA));
    localStorage.setItem(STORAGE_KEYS.TEAM_B, JSON.stringify(teamB));
    localStorage.setItem(STORAGE_KEYS.CHAMPIONS, JSON.stringify(championsTeam));
    localStorage.setItem(STORAGE_KEYS.WINS_TO_CHAMPION, JSON.stringify(winsToChampion));
    localStorage.setItem(STORAGE_KEYS.SAVED_WAITING_LIST, JSON.stringify(savedWaitingList));
    localStorage.setItem(STORAGE_KEYS.SAVED_PLAYERS, JSON.stringify(savedPlayers));
  }, [players, waitingListIds, teamA, teamB, championsTeam, winsToChampion, savedWaitingList, savedPlayers, isLoaded]);

  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev, { players, waitingListIds, teamA, teamB, championsTeam }];
      return newHistory.slice(-10); // Keep last 10 steps
    });
  }, [players, waitingListIds, teamA, teamB, championsTeam]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setPlayers(lastState.players);
    setWaitingListIds(lastState.waitingListIds);
    setTeamA(lastState.teamA);
    setTeamB(lastState.teamB);
    setChampionsTeam(lastState.championsTeam);
    setHistory(prev => prev.slice(0, -1));
    toast({ title: "Acción deshecha" });
  }, [history, toast]);

  const addPlayers = useCallback((namesInput: string) => {
    const names = namesInput.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return;

    const newPlayers: Player[] = [];
    const duplicated: string[] = [];

    names.forEach(name => {
      if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        duplicated.push(name);
      } else {
        newPlayers.push({
          id: crypto.randomUUID(),
          name,
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          createdAt: Date.now() + newPlayers.length
        });
      }
    });

    if (newPlayers.length > 0) {
      saveHistory();
      setPlayers(prev => [...prev, ...newPlayers]);
      setWaitingListIds(prev => [...prev, ...newPlayers.map(p => p.id)]);
      toast({ title: `${newPlayers.length} jugadores añadidos` });
    }
    if (duplicated.length > 0) {
      toast({ variant: 'destructive', title: "Duplicados ignorados", description: duplicated.join(', ') });
    }
  }, [players, saveHistory, toast]);

  const removePlayer = useCallback((id: string) => {
    saveHistory();
    
    // We need to track if we need to pull someone from the waiting list
    let pulledPlayerId: string | null = null;

    setWaitingListIds(prev => {
      const filtered = prev.filter(pid => pid !== id);
      // We don't pull yet, we just check if we NEED to later
      return filtered;
    });

    setPlayers(prev => prev.filter(p => p.id !== id));

    const availableWaitingIds = waitingListIds.filter(pid => pid !== id);

    setTeamA(prev => {
      const wasInTeam = prev.players.some(p => p.id === id);
      const filtered = prev.players.filter(p => p.id !== id);
      if (wasInTeam && availableWaitingIds.length > 0) {
        const nextId = availableWaitingIds[0];
        const nextPlayer = players.find(p => p.id === nextId);
        if (nextPlayer) {
          pulledPlayerId = nextId;
          const newList = [...filtered, nextPlayer];
          return { ...prev, players: newList, name: deriveTeamName(newList, 'Equipo A') };
        }
      }
      return { ...prev, players: filtered, name: deriveTeamName(filtered, 'Equipo A') };
    });

    setTeamB(prev => {
      const wasInTeam = prev.players.some(p => p.id === id);
      const filtered = prev.players.filter(p => p.id !== id);
      if (wasInTeam && !pulledPlayerId && availableWaitingIds.length > 0) {
        const nextId = availableWaitingIds[0];
        const nextPlayer = players.find(p => p.id === nextId);
        if (nextPlayer) {
          pulledPlayerId = nextId;
          const newList = [...filtered, nextPlayer];
          return { ...prev, players: newList, name: deriveTeamName(newList, 'Equipo B') };
        }
      }
      return { ...prev, players: filtered, name: deriveTeamName(filtered, 'Equipo B') };
    });

    setChampionsTeam(prev => {
      if (!prev) return null;
      const wasInTeam = prev.players.some(p => p.id === id);
      const filtered = prev.players.filter(p => p.id !== id);
      if (wasInTeam && !pulledPlayerId && availableWaitingIds.length > 0) {
        const nextId = availableWaitingIds[0];
        const nextPlayer = players.find(p => p.id === nextId);
        if (nextPlayer) {
          pulledPlayerId = nextId;
          return { ...prev, players: [...filtered, nextPlayer] };
        }
      }
      return filtered.length > 0 ? { ...prev, players: filtered } : null;
    });

    // Finally, if we pulled someone, remove them from the waiting list
    if (pulledPlayerId) {
      setWaitingListIds(prev => prev.filter(pid => pid !== pulledPlayerId));
    }

    toast({ title: "Jugador eliminado", description: pulledPlayerId ? "Se subió al siguiente en espera." : undefined });
  }, [saveHistory, waitingListIds, players, deriveTeamName, toast]);

  const recordWin = useCallback((winner: 'A' | 'B') => {
    saveHistory();
    const winningTeam = winner === 'A' ? teamA : teamB;
    const losingTeam = winner === 'A' ? teamB : teamA;

    if (winningTeam.players.length < 5 || losingTeam.players.length < 5) {
      toast({ variant: 'destructive', title: "Equipos incompletos" });
      return;
    }

    // Logic for updating stats and rotating players
    const updatedPlayers = players.map(p => {
      if (winningTeam.players.some(wp => wp.id === p.id)) {
        const wins = p.wins + 1;
        return { ...p, wins, consecutiveWins: p.consecutiveWins + 1, winRate: wins / (wins + p.losses) };
      }
      if (losingTeam.players.some(lp => lp.id === p.id)) {
        const losses = p.losses + 1;
        return { ...p, losses, consecutiveWins: 0, winRate: p.wins / (p.wins + losses) };
      }
      return p;
    });

    const playerMap = new Map(updatedPlayers.map(p => [p.id, p]));
    const winnersWithStats = winningTeam.players.map(p => playerMap.get(p.id)!);
    const losersIds = [...losingTeam.players]
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .map(p => p.id);

    // Rotation Logic (Standard + Champion Rule)
    if (championsTeam) {
      // Challenger vs Champion match
      setTeamA({ name: deriveTeamName(championsTeam.players.map(p => playerMap.get(p.id)!), 'Campeones'), players: championsTeam.players.map(p => playerMap.get(p.id)!) });
      setTeamB({ name: deriveTeamName(winnersWithStats, 'Retadores'), players: winnersWithStats });
      setChampionsTeam(null);
      setWaitingListIds(prev => [...prev, ...losersIds]);
    } else if (championRule && winnersWithStats.every(p => p.consecutiveWins >= winsToChampion)) {
      // New Champions crowned
      setChampionsTeam({ name: winningTeam.name, players: winnersWithStats });
      const nextWaiting = [...waitingListIds, ...losersIds];
      if (nextWaiting.length >= 10) {
        const nextA = nextWaiting.slice(0, 5).map(id => playerMap.get(id)!);
        const nextB = nextWaiting.slice(5, 10).map(id => playerMap.get(id)!);
        setTeamA({ name: deriveTeamName(nextA, 'Equipo A'), players: nextA });
        setTeamB({ name: deriveTeamName(nextB, 'Equipo B'), players: nextB });
        setWaitingListIds(nextWaiting.slice(10));
      } else {
        setTeamA({ name: 'Equipo A', players: [] });
        setTeamB({ name: 'Equipo B', players: [] });
        setWaitingListIds(nextWaiting);
      }
      toast({ title: "¡Nuevos Campeones!", description: "El equipo descansará hasta el próximo reto." });
    } else {
      // Standard rotation
      const nextWaiting = [...waitingListIds, ...losersIds];
      if (nextWaiting.length >= 5) {
        const newChallengers = nextWaiting.slice(0, 5).map(id => playerMap.get(id)!);
        if (winner === 'A') {
          setTeamB({ name: deriveTeamName(newChallengers, 'Equipo B'), players: newChallengers });
        } else {
          setTeamA({ name: deriveTeamName(newChallengers, 'Equipo A'), players: newChallengers });
        }
        setWaitingListIds(nextWaiting.slice(5));
      } else {
        toast({ title: "Esperando más jugadores" });
        if (winner === 'A') setTeamB({ name: 'Equipo B', players: [] });
        else setTeamA({ name: 'Equipo A', players: [] });
        setWaitingListIds(nextWaiting);
      }
    }

    setPlayers(updatedPlayers);
  }, [players, teamA, teamB, championsTeam, championRule, winsToChampion, waitingListIds, saveHistory, deriveTeamName, toast]);

  const resetDay = useCallback(() => {
    setPlayers([]);
    setWaitingListIds([]);
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);
    setHistory([]);
    toast({ title: "Día reiniciado" });
  }, [toast]);

  const saveSnapshot = useCallback(() => {
    setSavedPlayers([...players]);
    setSavedWaitingList([...waitingListIds]);
    toast({ title: "Snapshot guardado", description: "Se ha guardado el estado de la lista." });
  }, [players, waitingListIds, toast]);

  const swapPlayers = useCallback((player1Id: string, player2Id: string, location1: 'A' | 'B' | 'W', location2: 'A' | 'B' | 'W') => {
    saveHistory();
    let p1: Player | undefined;
    let p2: Player | undefined;

    // Find players
    const findIn = (loc: 'A' | 'B' | 'W', id: string) => {
      if (loc === 'A') return teamA.players.find(p => p.id === id);
      if (loc === 'B') return teamB.players.find(p => p.id === id);
      return players.find(p => p.id === id);
    };

    p1 = findIn(location1, player1Id);
    p2 = findIn(location2, player2Id);

    if (!p1 || !p2) return;

    // Helper to replace or remove/add
    const updateLoc = (loc: 'A' | 'B' | 'W', oldId: string, newPlayer: Player) => {
      if (loc === 'A') setTeamA(prev => ({ ...prev, players: prev.players.map(p => p.id === oldId ? newPlayer : p) }));
      if (loc === 'B') setTeamB(prev => ({ ...prev, players: prev.players.map(p => p.id === oldId ? newPlayer : p) }));
      if (loc === 'W') setWaitingListIds(prev => prev.map(id => id === oldId ? newPlayer.id : id));
    };

    updateLoc(location1, player1Id, p2);
    updateLoc(location2, player2Id, p1);
    
    toast({ title: "Intercambio realizado" });
  }, [teamA, teamB, players, saveHistory, toast]);

  const restoreSnapshot = useCallback(() => {
    if (!savedPlayers || !savedWaitingList) {
      toast({ variant: "destructive", title: "No hay snapshot", description: "Guarda uno primero." });
      return;
    }
    setPlayers([...savedPlayers]);
    setWaitingListIds([...savedWaitingList]);
    setTeamA({ name: 'Equipo A', players: [] });
    setTeamB({ name: 'Equipo B', players: [] });
    setChampionsTeam(null);
    toast({ title: "Snapshot restaurado" });
  }, [savedPlayers, savedWaitingList, toast]);

  return {
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
  };
}

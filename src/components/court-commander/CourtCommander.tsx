"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Player, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Flame, Users, Crown, Plus, Trash2, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialPlayers: Player[] = [];

const PlayerCard = ({ player, onRemove, onAssign, showAssign, isChampion }: { player: Player, onRemove?: (id: string) => void, onAssign?: (id: string, team: 'A' | 'B') => void, showAssign?: boolean, isChampion?: boolean }) => (
  <div className={cn(
    "relative flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
    isChampion ? "bg-amber-500" : "bg-slate-700"
  )}>
    <div>
      <p className={cn("font-bold", isChampion ? "text-black" : "text-sky-400")}>{player.name}</p>
      <p className={cn("text-xs", isChampion ? "text-slate-800" : "text-slate-400")}>
        V/D: {player.wins}/{player.losses} | Tasa de Victorias: {(player.winRate * 100).toFixed(0)}% | Racha: <span className={cn("font-bold", player.consecutiveWins > 0 ? (isChampion ? 'text-white' : 'text-amber-400') : '')}>{player.consecutiveWins}</span>
      </p>
    </div>
    <div className="flex items-center gap-2">
      {showAssign && onAssign && (
        <>
          <Button size="sm" onClick={() => onAssign(player.id, 'A')} className="h-7 w-7 p-0 bg-sky-700 hover:bg-sky-600 text-white border-none">A</Button>
          <Button size="sm" onClick={() => onAssign(player.id, 'B')} className="h-7 w-7 p-0 bg-teal-700 hover:bg-teal-600 text-white border-none">B</Button>
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
                <CardTitle className="flex items-center gap-2 font-headline text-2xl text-sky-400">
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

export function RotacionDeportiva() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [waitingListIds, setWaitingListIds] = useState<string[]>(initialPlayers.map(p => p.id));
  const [teamA, setTeamA] = useState<Team>({ name: 'Equipo A', players: [] });
  const [teamB, setTeamB] = useState<Team>({ name: 'Equipo B', players: [] });
  const [championsTeam, setChampionsTeam] = useState<Team | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const [championRule, setChampionRule] = useState(false);
  const [winsToChampion, setWinsToChampion] = useState(2);

  const { toast } = useToast();

  const waitingPlayers = useMemo(() => {
      const waitingPlayersMap = new Map(players.map(p => [p.id, p]));
      return waitingListIds.map(id => waitingPlayersMap.get(id)).filter(Boolean) as Player[];
  }, [players, waitingListIds]);

  useEffect(() => {
    setChampionRule(waitingPlayers.length >= 10);
  }, [waitingPlayers.length]);

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
    setTeamA(t => ({ ...t, players: t.players.filter(p => p.id !== id) }));
    setTeamB(t => ({ ...t, players: t.players.filter(p => p.id !== id) }));
    setChampionsTeam(ct => {
        if (!ct) return null;
        const newPlayers = ct.players.filter(p => p.id !== id);
        if (newPlayers.length === 0) return null;
        return { ...ct, players: newPlayers };
    });
  };
  
  const handleAssignPlayer = (playerId: string, team: 'A' | 'B') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setWaitingListIds(ids => ids.filter(id => id !== playerId));
    if (team === 'A') {
      if(teamA.players.length >= 5) {
        toast({variant: 'destructive', title: "Equipo A lleno"});
        setWaitingListIds(ids => [...ids, playerId]);
        return;
      }
      setTeamA(t => ({...t, players: [...t.players, player]}));
    } else {
      if(teamB.players.length >= 5) {
        toast({variant: 'destructive', title: "Equipo B lleno"});
        setWaitingListIds(ids => [...ids, playerId]);
        return;
      }
      setTeamB(t => ({...t, players: [...t.players, player]}));
    }
  };

  const handleRemoveFromTeam = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if(!player) return;

    setTeamA(t => ({ ...t, players: t.players.filter(p => p.id !== playerId)}));
    setTeamB(t => ({ ...t, players: t.players.filter(p => p.id !== playerId)}));
    setWaitingListIds(ids => [playerId, ...ids]);
  };

  const handleRecordWin = (winner: 'A' | 'B') => {
    const winningTeamData = winner === 'A' ? teamA : teamB;
    const losingTeamData = winner === 'A' ? teamB : teamA;
    
    if (winningTeamData.players.length < 5 || losingTeamData.players.length < 5) {
        toast({variant: 'destructive', title: "Equipos incompletos", description: "Ambos equipos deben tener 5 jugadores."});
        return;
    }

    // --- Flujo de Partido Interino ---
    if (championsTeam) {
        toast({ title: "Partido Interino Finalizado", description: `El ${winningTeamData.name} se enfrentará al campeón.` });

        const interimLosers = losingTeamData.players.map(p => p.id);
        const newWaitingList = [...waitingListIds, ...interimLosers];

        const returningChampions = {
            ...championsTeam,
            players: championsTeam.players.map(p => ({ ...p, consecutiveWins: 0 }))
        };

        const updatedPlayers = players.map(p => {
            if (losingTeamData.players.some(lp => lp.id === p.id)) {
                const newLosses = p.losses + 1;
                return { ...p, losses: newLosses, consecutiveWins: 0, winRate: p.wins / (p.wins + newLosses) };
            }
            if (winningTeamData.players.some(wp => wp.id === p.id)) {
                const newWins = p.wins + 1;
                return { ...p, wins: newWins, consecutiveWins: 1, winRate: newWins / (newWins + p.losses) };
            }
            return p;
        });

        const interimWinners = updatedPlayers.filter(p => winningTeamData.players.some(wp => wp.id === p.id));
        
        setPlayers(updatedPlayers);
        setTeamA(returningChampions);
        setTeamB({ ...winningTeamData, players: interimWinners });
        setWaitingListIds(newWaitingList);
        setChampionsTeam(null);
        return;
    }

    // --- Flujo Normal / Básico ---
    const winnerNewConsecutiveWins = (winningTeamData.players[0]?.consecutiveWins || 0) + 1;
    let masterPlayerList = players.map(p => {
        if (winningTeamData.players.some(wp => wp.id === p.id)) {
            const newWins = p.wins + 1;
            return { ...p, wins: newWins, consecutiveWins: winnerNewConsecutiveWins, winRate: newWins / (newWins + p.losses) };
        }
        if (losingTeamData.players.some(lp => lp.id === p.id)) {
            const newLosses = p.losses + 1;
            return { ...p, losses: newLosses, consecutiveWins: 0, winRate: p.wins / (p.wins + newLosses) };
        }
        return p;
    });

    const losersToWaitingList = [...waitingListIds, ...losingTeamData.players.map(p => p.id)];

    // --- Flujo Avanzado: Se corona un nuevo campeón ---
    if (championRule && winnerNewConsecutiveWins >= winsToChampion) {
        toast({title: "¡Nuevos Campeones!", description: `${winningTeamData.name} ahora son campeones y descansarán.`});
        
        const newChampionPlayers = masterPlayerList
            .filter(p => winningTeamData.players.some(wp => wp.id === p.id))
            .map(p => ({ ...p, consecutiveWins: 0 }));

        setChampionsTeam({ name: winningTeamData.name, players: newChampionPlayers });
        masterPlayerList = masterPlayerList.map(p => newChampionPlayers.find(cp => cp.id === p.id) || p);

        if (losersToWaitingList.length < 10) {
            toast({ variant: 'destructive', title: "No hay suficientes jugadores", description: "No hay suficientes jugadores en espera para un partido interino. Los equipos se han vaciado." });
            setTeamA({ name: 'Equipo A', players: [] });
            setTeamB({ name: 'Equipo B', players: [] });
            setWaitingListIds(losersToWaitingList);
        } else {
            const playersForInterim = losersToWaitingList.slice(0, 10).map(id => masterPlayerList.find(p => p.id === id)!);
            setTeamA({ name: 'Equipo A', players: playersForInterim.slice(0, 5) });
            setTeamB({ name: 'Equipo B', players: playersForInterim.slice(5, 10) });
            setWaitingListIds(losersToWaitingList.slice(10));
        }
        setPlayers(masterPlayerList);
        return;
    }

    // --- Flujo Básico: Ganador se queda, perdedor a la cola, entran nuevos retadores ---
    const playersForNewTeamIds = losersToWaitingList.slice(0, 5);
    if (playersForNewTeamIds.length < 5) {
        toast({ variant: 'destructive', title: "No hay suficientes jugadores", description: "No hay suficientes retadores. El equipo ganador se queda solo." });
        const winnerTeamWithStats = { ...winningTeamData, players: masterPlayerList.filter(p => winningTeamData.players.some(wp => wp.id === p.id))};
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
        const newChallengers = {
            name: winner === 'A' ? 'Equipo B' : 'Equipo A',
            players: playersForNewTeamIds.map(id => masterPlayerList.find(p => p.id === id)!)
        };
        const winnerTeamWithStats = { ...winningTeamData, players: masterPlayerList.filter(p => winningTeamData.players.some(wp => wp.id === p.id))};
        
        if (winner === 'A') {
            setTeamA(winnerTeamWithStats);
            setTeamB(newChallengers);
        } else {
            setTeamA(newChallengers);
            setTeamB(winnerTeamWithStats);
        }
        setWaitingListIds(remainingWaitingList);
    }
    setPlayers(masterPlayerList);
  };

  const handleReturnChampionToWaitingList = () => {
    if (!championsTeam) return;
    setWaitingListIds(prev => [...prev, ...championsTeam.players.map(c => c.id)]);
    setChampionsTeam(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8">
      <main className="container mx-auto">
        <header className="text-center mb-8">
            <h1 className="font-headline text-5xl md:text-6xl text-sky-400 flex items-center justify-center gap-4"><Flame /> Rotación Deportiva</h1>
            <p className="text-slate-400 mt-2">Gestión de equipos para partidos amistosos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-sky-400"><Plus/> Añadir Nuevo Jugador</CardTitle>
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
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-sky-400"><Users/> Lista de Espera ({waitingPlayers.length})</CardTitle>
                  <CardDescription className="text-slate-400">Los jugadores se añaden a los equipos desde aquí.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {waitingPlayers.length > 0 ? (
                    waitingPlayers.map(p => (
                        <PlayerCard 
                            key={p.id} 
                            player={p}
                            onRemove={handleRemovePlayer} 
                            onAssign={handleAssignPlayer}
                            showAssign={true}
                        />
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">No hay jugadores en espera.</p>
                )}
              </CardContent>
            </Card>

            <Card className={cn("border-slate-700 transition-all", championsTeam ? "bg-gradient-to-br from-amber-500 to-yellow-400" : "bg-slate-800")}>
                <CardHeader>
                    <CardTitle className={cn("font-headline flex items-center gap-2", championsTeam ? "text-black" : "text-sky-400")}>
                        <Crown/> Campeón en Descanso ({championsTeam ? championsTeam.players.length : 0})
                    </CardTitle>
                    {championsTeam && <CardDescription className="text-amber-900">{championsTeam.name}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                        <Switch 
                            id="champion-rule" 
                            checked={championRule} 
                            disabled
                        />
                        <Label htmlFor="champion-rule" className={cn(championsTeam && "text-black")}>
                            Regla del Campeón
                        </Label>
                    </div>
                    <p className={cn("text-xs mb-4", championsTeam ? "text-amber-800" : "text-slate-400")}>
                        Se activa automáticamente con 10 o más jugadores en espera.
                    </p>
                    {championRule && (
                        <div className="flex items-center gap-2 my-4">
                            <Label htmlFor="wins-to-champion" className={cn(championsTeam && "text-black")}>Victorias para ser campeón:</Label>
                            <Input 
                                id="wins-to-champion"
                                type="number" 
                                value={winsToChampion}
                                onChange={(e) => setWinsToChampion(Math.max(1, Number(e.target.value)))}
                                className="w-20 bg-slate-700 border-slate-600 text-white"
                                min="1"
                            />
                        </div>
                    )}
                    <Separator className={cn(championsTeam ? 'bg-amber-600' : 'bg-slate-700')}/>
                    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                    {championsTeam && championsTeam.players.length > 0 ? (
                        championsTeam.players.map(p => <PlayerCard key={p.id} player={p} onRemove={handleRemovePlayer} isChampion={true}/>)
                    ) : (
                        <p className={cn("text-center py-4", championsTeam ? "text-black" : "text-slate-500")}>No hay un equipo campeón descansando.</p>
                    )}
                    </div>
                    {championsTeam && <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-none" onClick={handleReturnChampionToWaitingList}>Devolver Campeón a la Lista de Espera</Button>}
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-sky-400">{championsTeam ? "Partido Interino" : "Equipos Actuales"}</CardTitle>
                    {championsTeam && <CardDescription className="text-yellow-400">El ganador de este partido se enfrentará al campeón: {championsTeam.name}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <TeamColumn team={teamA} onRemovePlayer={handleRemoveFromTeam} />
                        <TeamColumn team={teamB} onRemovePlayer={handleRemoveFromTeam} />
                    </div>

                    <Separator className="bg-slate-700"/>

                    <div className="text-center space-y-4">
                        <h3 className="font-headline text-2xl text-sky-400">Registrar Resultado del Partido</h3>
                        <div className="flex justify-center gap-4">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => handleRecordWin('A')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                <Trophy className="mr-2 h-4 w-4"/> Ganó Equipo A
                            </Button>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => handleRecordWin('B')} disabled={teamA.players.length < 5 || teamB.players.length < 5}>
                                <Trophy className="mr-2 h-4 w-4"/> Ganó Equipo B
                            </Button>
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

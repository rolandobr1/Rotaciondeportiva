"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Player, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { runBalanceTeams, runGetTeamRecommendation } from '@/app/actions';
import { Dribbble, Users, Crown, Plus, Trash2, Swords, Trophy, Sparkles, Loader2, Info } from 'lucide-react';

const initialPlayers: Player[] = [
  { id: '1', name: 'LeBron', wins: 10, losses: 5, winRate: 0.66, consecutiveWins: 2 },
  { id: '2', name: 'Steph', wins: 12, losses: 3, winRate: 0.8, consecutiveWins: 3 },
  { id: '3', name: 'KD', wins: 8, losses: 8, winRate: 0.5, consecutiveWins: 0 },
  { id: '4', name: 'Giannis', wins: 9, losses: 4, winRate: 0.69, consecutiveWins: 1 },
  { id: '5', name: 'Joker', wins: 15, losses: 2, winRate: 0.88, consecutiveWins: 5 },
  { id: '6', name: 'Luka', wins: 7, losses: 6, winRate: 0.53, consecutiveWins: 0 },
];

const PlayerCard = ({ player, onRemove, onAssign, showAssign, isWaiting }: { player: Player, onRemove?: (id: string) => void, onAssign?: (id: string, team: 'A' | 'B') => void, showAssign?: boolean, isWaiting?: boolean }) => (
  <div className="relative flex items-center justify-between p-3 bg-secondary/50 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
    <div>
      <p className="font-bold text-primary">{player.name}</p>
      <p className="text-xs text-muted-foreground">
        W/L: {player.wins}/{player.losses} | Win Rate: {(player.winRate * 100).toFixed(0)}%
      </p>
    </div>
    <div className="flex items-center gap-2">
      {showAssign && onAssign && (
        <>
          <Button size="sm" variant="outline" onClick={() => onAssign(player.id, 'A')} className="h-7 w-7 p-0">A</Button>
          <Button size="sm" variant="outline" onClick={() => onAssign(player.id, 'B')} className="h-7 w-7 p-0">B</Button>
        </>
      )}
      {onRemove && (
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemove(player.id)}>
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
        <Card className="flex-1 min-w-[280px] bg-background/70">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Swords className="text-primary" /> {team.name}
                </CardTitle>
                <CardDescription>Avg. Win Rate: {(avgWinRate * 100).toFixed(0)}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {team.players.length > 0 ? (
                    team.players.map(p => <PlayerCard key={p.id} player={p} onRemove={() => onRemovePlayer(p.id)} />)
                ) : (
                    <div className="text-center text-muted-foreground py-8">Add players to this team</div>
                )}
            </CardContent>
        </Card>
    );
};

export function CourtCommander() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [waitingListIds, setWaitingListIds] = useState<string[]>(initialPlayers.map(p => p.id));
  const [teamA, setTeamA] = useState<Team>({ name: 'Team A', players: [] });
  const [teamB, setTeamB] = useState<Team>({ name: 'Team B', players: [] });
  const [champions, setChampions] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const [championRule, setChampionRule] = useState(true);
  const [winsToChampion, setWinsToChampion] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const { toast } = useToast();

  const waitingPlayers = useMemo(() => players.filter(p => waitingListIds.includes(p.id)), [players, waitingListIds]);

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') {
      toast({ variant: 'destructive', title: "Error", description: "Player name cannot be empty." });
      return;
    }
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName,
      wins: 0,
      losses: 0,
      winRate: 0,
      consecutiveWins: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
    setWaitingListIds(prev => [...prev, newPlayer.id]);
    setNewPlayerName('');
    toast({ title: "Player Added", description: `${newPlayer.name} is now on the waiting list.` });
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(p => p.filter(player => player.id !== id));
    setWaitingListIds(ids => ids.filter(playerId => playerId !== id));
    setTeamA(t => ({ ...t, players: t.players.filter(p => p.id !== id) }));
    setTeamB(t => ({ ...t, players: t.players.filter(p => p.id !== id) }));
    setChampions(c => c.filter(p => p.id !== id));
  };
  
  const handleAssignPlayer = (playerId: string, team: 'A' | 'B') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setWaitingListIds(ids => ids.filter(id => id !== playerId));
    if (team === 'A') {
      setTeamA(t => ({...t, players: [...t.players, player]}));
    } else {
      setTeamB(t => ({...t, players: [...t.players, player]}));
    }
    setAiRecommendation(null);
  };

  const handleRemoveFromTeam = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if(!player) return;

    setTeamA(t => ({ ...t, players: t.players.filter(p => p.id !== playerId)}));
    setTeamB(t => ({ ...t, players: t.players.filter(p => p.id !== playerId)}));
    setWaitingListIds(ids => [...ids, playerId]);
    setAiRecommendation(null);
  };

  const handleAutoBalance = async () => {
    if (waitingPlayers.length < 2) {
        toast({ variant: 'destructive', title: "Not enough players", description: "Need at least 2 players in the waiting list to balance teams." });
        return;
    }
    setIsLoading(true);
    setAiExplanation(null);
    setAiRecommendation(null);

    const result = await runBalanceTeams({ 
        players: waitingPlayers.map(p => ({ id: p.id, name: p.name, winRate: p.winRate })), 
        teamCount: 2 
    });
    
    if(result && result.teams) {
        const balancedTeamA = result.teams[0];
        const balancedTeamB = result.teams[1];
        
        const teamAPlayers = players.filter(p => balancedTeamA.playerIds.includes(p.id));
        const teamBPlayers = players.filter(p => balancedTeamB.playerIds.includes(p.id));
        
        setTeamA({ name: 'Team A', players: teamAPlayers });
        setTeamB({ name: 'Team B', players: teamBPlayers });
        setWaitingListIds(ids => ids.filter(id => !balancedTeamA.playerIds.includes(id) && !balancedTeamB.playerIds.includes(id)));
        setAiExplanation(result.explanation);
    } else {
        toast({ variant: 'destructive', title: "Balancing Failed", description: "Could not balance teams. Please try again." });
    }

    setIsLoading(false);
  };

  const handleGetRecommendation = async () => {
    if (teamA.players.length === 0 || teamB.players.length === 0) {
        toast({ variant: 'destructive', title: "Not enough players", description: "Both teams must have at least one player." });
        return;
    }
    setIsLoading(true);
    setAiRecommendation(null);
    
    const result = await runGetTeamRecommendation({
        team1Players: teamA.players.map(p => ({name: p.name, winRate: p.winRate})),
        team2Players: teamB.players.map(p => ({name: p.name, winRate: p.winRate})),
    });

    if(result && result.recommendation) {
        setAiRecommendation(result.recommendation);
    } else {
        toast({ variant: 'destructive', title: "Recommendation Failed", description: "Could not get a recommendation. Please try again." });
    }
    setIsLoading(false);
  };

  const handleRecordWin = (winner: 'A' | 'B') => {
    const winningTeam = winner === 'A' ? teamA : teamB;
    const losingTeam = winner === 'A' ? teamB : teamA;
    
    if(winningTeam.players.length === 0 || losingTeam.players.length === 0) {
        toast({variant: 'destructive', title: "Cannot record match", description: "Teams cannot be empty."});
        return;
    }

    let newChampions: Player[] = [];
    
    const updatedPlayers = players.map(p => {
        const winner = winningTeam.players.find(wp => wp.id === p.id);
        const loser = losingTeam.players.find(lp => lp.id === p.id);
        
        if (winner) {
            const newWins = p.wins + 1;
            const newConsecutiveWins = p.consecutiveWins + 1;
            const updatedPlayer = { ...p, wins: newWins, consecutiveWins: newConsecutiveWins, winRate: newWins / (newWins + p.losses) };
            if(championRule && newConsecutiveWins >= winsToChampion) {
                newChampions.push({...updatedPlayer, consecutiveWins: 0});
            }
            return updatedPlayer;
        }
        if (loser) {
            const newLosses = p.losses + 1;
            return { ...p, losses: newLosses, consecutiveWins: 0, winRate: p.wins / (p.wins + newLosses) };
        }
        return p;
    });

    setPlayers(updatedPlayers);
    
    const championIds = new Set(newChampions.map(c => c.id));
    
    if (championRule && newChampions.length > 0) {
        setChampions(prev => [...prev, ...newChampions]);
        toast({title: "New Champions!", description: `${winningTeam.name} are now champions and will rest.`});
    }

    const playersToWaitingList = [...teamA.players, ...teamB.players].filter(p => !championIds.has(p.id));
    setWaitingListIds(prev => [...new Set([...prev, ...playersToWaitingList.map(p => p.id)])]);
    
    setTeamA({ name: 'Team A', players: [] });
    setTeamB({ name: 'Team B', players: [] });
    setAiRecommendation(null);
    setAiExplanation(null);
  };

  const resetChampions = () => {
    setWaitingListIds(prev => [...new Set([...prev, ...champions.map(c => c.id)])]);
    setChampions([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <main className="container mx-auto">
        <header className="text-center mb-8">
            <h1 className="font-headline text-5xl md:text-6xl text-primary flex items-center justify-center gap-4"><Dribbble /> Court Commander</h1>
            <p className="text-muted-foreground mt-2">AI-Powered Team Balancing for Your Next Game</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Plus/> Add New Player</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., Michael Jordan" 
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    />
                    <Button onClick={handleAddPlayer} className="bg-accent hover:bg-accent/90 text-accent-foreground">Add</Button>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Users/> Waiting List ({waitingPlayers.length})</CardTitle>
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
                            isWaiting={true}
                        />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No players waiting.</p>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Crown/> Champions' Circle ({champions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2 mb-4">
                        <Switch id="champion-rule" checked={championRule} onCheckedChange={setChampionRule} />
                        <Label htmlFor="champion-rule">Enable Champion Rule</Label>
                    </div>
                    {championRule && (
                        <div className="flex items-center gap-2 mb-4">
                            <Label htmlFor="wins-to-champion">Wins to be Champion:</Label>
                            <Input 
                                id="wins-to-champion"
                                type="number" 
                                value={winsToChampion}
                                onChange={(e) => setWinsToChampion(Number(e.target.value))}
                                className="w-20"
                            />
                        </div>
                    )}
                    <Separator/>
                    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                    {champions.length > 0 ? (
                        champions.map(p => <PlayerCard key={p.id} player={p} onRemove={handleRemovePlayer}/>)
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No champions resting.</p>
                    )}
                    </div>
                    {champions.length > 0 && <Button variant="outline" className="w-full mt-4" onClick={resetChampions}>Return Champions to Waiting List</Button>}
                </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Team Formation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={handleAutoBalance} disabled={isLoading || waitingPlayers.length < 2}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4"/>} 
                            Auto-Balance Teams
                        </Button>
                        <Button size="lg" variant="secondary" onClick={handleGetRecommendation} disabled={isLoading || teamA.players.length === 0 || teamB.players.length === 0}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4"/>} 
                            Get AI Balancing Tip
                        </Button>
                    </div>

                    {aiExplanation && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">AI Balancing Explanation</AlertTitle>
                            <AlertDescription>{aiExplanation}</AlertDescription>
                        </Alert>
                    )}
                    {aiRecommendation && (
                        <Alert variant="default" className="border-accent text-accent-foreground/80">
                            <Info className="h-4 w-4 text-accent" />
                            <AlertTitle className="font-headline text-accent">AI Balancing Recommendation</AlertTitle>
                            <AlertDescription className="text-accent-foreground/80">{aiRecommendation}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        <TeamColumn team={teamA} onRemovePlayer={handleRemoveFromTeam} />
                        <TeamColumn team={teamB} onRemovePlayer={handleRemoveFromTeam} />
                    </div>

                    <Separator />

                    <div className="text-center space-y-4">
                        <h3 className="font-headline text-2xl">Record Match Result</h3>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground" onClick={() => handleRecordWin('A')} disabled={teamA.players.length === 0 || teamB.players.length === 0}>
                                <Trophy className="mr-2 h-4 w-4"/> Team A Won
                            </Button>
                            <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground" onClick={() => handleRecordWin('B')} disabled={teamA.players.length === 0 || teamB.players.length === 0}>
                                <Trophy className="mr-2 h-4 w-4"/> Team B Won
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

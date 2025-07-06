export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  consecutiveWins: number;
}

export interface Team {
  name: string;
  players: Player[];
}

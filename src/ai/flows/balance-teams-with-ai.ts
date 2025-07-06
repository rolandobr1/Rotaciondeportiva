'use server';
/**
 * @fileOverview An AI agent for balancing teams based on player win rates.
 *
 * - balanceTeamsWithAI - A function that balances teams based on player win rates.
 * - BalanceTeamsWithAIInput - The input type for the balanceTeamsWithAI function.
 * - BalanceTeamsWithAIOutput - The return type for the balanceTeamsWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlayerSchema = z.object({
  id: z.string().describe('The unique identifier of the player.'),
  name: z.string().describe('The name of the player.'),
  winRate: z.number().describe('The win rate of the player (0 to 1).'),
});

const BalanceTeamsWithAIInputSchema = z.object({
  players: z.array(PlayerSchema).describe('The list of players available to form teams.'),
  teamCount: z.number().int().min(2).describe('The number of teams to create.'),
});
export type BalanceTeamsWithAIInput = z.infer<typeof BalanceTeamsWithAIInputSchema>;

const TeamSchema = z.object({
  name: z.string().describe('The name of the team.'),
  playerIds: z.array(z.string()).describe('The list of player IDs in the team.'),
});

const BalanceTeamsWithAIOutputSchema = z.object({
  teams: z.array(TeamSchema).describe('The list of balanced teams.'),
  explanation: z
    .string()
    .describe('An explanation of how the teams were balanced.'),
});

export type BalanceTeamsWithAIOutput = z.infer<typeof BalanceTeamsWithAIOutputSchema>;

export async function balanceTeamsWithAI(input: BalanceTeamsWithAIInput): Promise<BalanceTeamsWithAIOutput> {
  return balanceTeamsWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'balanceTeamsPrompt',
  input: {schema: BalanceTeamsWithAIInputSchema},
  output: {schema: BalanceTeamsWithAIOutputSchema},
  prompt: `You are an expert at balancing teams for a game based on player win rates.

Given the following list of players and their win rates, create {{teamCount}} teams that are as balanced as possible.

Players:
{{#each players}}
- {{name}} (ID: {{id}}, Win Rate: {{winRate}})
{{/each}}

Teams should be named Team A, Team B, Team C, etc.

Return the list of teams with player IDs and an explanation of how you balanced the teams.

Ensure each player is assigned to exactly one team.
`,
});

const balanceTeamsWithAIFlow = ai.defineFlow(
  {
    name: 'balanceTeamsWithAIFlow',
    inputSchema: BalanceTeamsWithAIInputSchema,
    outputSchema: BalanceTeamsWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

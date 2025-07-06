'use server';
/**
 * @fileOverview Un agente de IA para equilibrar equipos basado en las tasas de victorias de los jugadores.
 *
 * - balanceTeamsWithAI - Una función que equilibra equipos en función de las tasas de victorias de los jugadores.
 * - BalanceTeamsWithAIInput - El tipo de entrada para la función balanceTeamsWithAI.
 * - BalanceTeamsWithAIOutput - El tipo de retorno para la función balanceTeamsWithAI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlayerSchema = z.object({
  id: z.string().describe('El identificador único del jugador.'),
  name: z.string().describe('El nombre del jugador.'),
  winRate: z.number().describe('La tasa de victorias del jugador (de 0 a 1).'),
});

const BalanceTeamsWithAIInputSchema = z.object({
  players: z.array(PlayerSchema).describe('La lista de jugadores disponibles para formar equipos.'),
  teamCount: z.number().int().min(2).describe('El número de equipos a crear.'),
});
export type BalanceTeamsWithAIInput = z.infer<typeof BalanceTeamsWithAIInputSchema>;

const TeamSchema = z.object({
  name: z.string().describe('El nombre del equipo.'),
  playerIds: z.array(z.string()).describe('La lista de IDs de jugadores en el equipo.'),
});

const BalanceTeamsWithAIOutputSchema = z.object({
  teams: z.array(TeamSchema).describe('La lista de equipos equilibrados.'),
  explanation: z
    .string()
    .describe('Una explicación de cómo se equilibraron los equipos.'),
});

export type BalanceTeamsWithAIOutput = z.infer<typeof BalanceTeamsWithAIOutputSchema>;

export async function balanceTeamsWithAI(input: BalanceTeamsWithAIInput): Promise<BalanceTeamsWithAIOutput> {
  return balanceTeamsWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'balanceTeamsPrompt',
  input: {schema: BalanceTeamsWithAIInputSchema},
  output: {schema: BalanceTeamsWithAIOutputSchema},
  prompt: `Eres un experto en equilibrar equipos para un juego basado en las tasas de victoria de los jugadores.

Dada la siguiente lista de jugadores y sus tasas de victoria, crea {{teamCount}} equipos que sean lo más equilibrados posible.

Jugadores:
{{#each players}}
- {{name}} (ID: {{id}}, Tasa de Victoria: {{winRate}})
{{/each}}

Los equipos deben llamarse Equipo A, Equipo B, Equipo C, etc.

Devuelve la lista de equipos con los IDs de los jugadores y una explicación de cómo equilibraste los equipos.

Asegúrate de que cada jugador sea asignado exactamente a un equipo.
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

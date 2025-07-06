"use server";

import { balanceTeamsWithAI, BalanceTeamsWithAIInput } from "@/ai/flows/balance-teams-with-ai";
import { getTeamRecommendation, GetTeamRecommendationInput } from "@/ai/flows/get-team-recommendation";

export async function runBalanceTeams(input: BalanceTeamsWithAIInput) {
    try {
        const result = await balanceTeamsWithAI(input);
        return result;
    } catch (error) {
        console.error("Error balancing teams:", error);
        return null;
    }
}

export async function runGetTeamRecommendation(input: GetTeamRecommendationInput) {
    try {
        const result = await getTeamRecommendation(input);
        return result;
    } catch (error) {
        console.error("Error getting team recommendation:", error);
        return null;
    }
}

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Crown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  championRule: boolean;
  onToggleRule: (checked: boolean) => void;
  winsToChampion: number;
  onUpdateWins: (wins: number) => void;
  waitingListCount: number;
}

export function SettingsSection({
  championRule,
  onToggleRule,
  winsToChampion,
  onUpdateWins,
  waitingListCount
}: SettingsSectionProps) {
  const isRuleDisabled = waitingListCount < 10;

  return (
    <Card className="glass border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-bold">
          <Crown className="h-5 w-5" /> Regla del Campeón
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Configura cómo los equipos se vuelven campeones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
          <div className="space-y-1">
            <Label htmlFor="champion-rule" className="text-base font-bold">Activar Regla</Label>
            <p className="text-xs text-muted-foreground">
              {isRuleDisabled ? "Se requieren 10+ jugadores en espera." : "Habilita el descanso de campeones."}
            </p>
          </div>
          <Switch 
            id="champion-rule" 
            checked={championRule} 
            onCheckedChange={onToggleRule}
            disabled={isRuleDisabled}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className={cn(
          "space-y-4 p-4 glass rounded-xl border-white/5 transition-opacity duration-300",
          !championRule && "opacity-50 pointer-events-none"
        )}>
          <div className="flex items-center justify-between">
            <Label htmlFor="wins-to-champion" className="font-bold">Victorias para Coronar</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="wins-to-champion" 
                type="number" 
                value={winsToChampion} 
                onChange={(e) => onUpdateWins(parseInt(e.target.value) || 1)}
                className="w-16 bg-background/40 border-white/10 text-center font-bold"
                min="1"
              />
            </div>
          </div>
          <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-white/5 p-2 rounded-lg">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            <p>Si un equipo gana {winsToChampion} veces seguidas, se retira a descansar y espera al ganador de un partido interino.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

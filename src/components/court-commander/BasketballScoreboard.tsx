import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Minimize2, Maximize2, X, Settings, Plus, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BasketballScoreboardProps {
  onSubmit: (result: {
    puntosA: number;
    puntosB: number;
    faltasA: number;
    faltasB: number;
    tiempoTranscurridoMs: number;
  }) => void;
  configuracionInicial?: {
    maxPuntos?: number; // default 21
    maxTiempoMs?: number; // default 10 * 60 * 1000
  };
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  teamAName?: string;
  teamBName?: string;
}

export default function BasketballScoreboard({ 
  onSubmit, 
  configuracionInicial, 
  isOpen = false, 
  onClose, 
  onMinimize,
  teamAName = 'Equipo A',
  teamBName = 'Equipo B'
}: BasketballScoreboardProps) {
  const [puntosA, setPuntosA] = useState(0);
  const [puntosB, setPuntosB] = useState(0);
  const [faltasA, setFaltasA] = useState(0);
  const [faltasB, setFaltasB] = useState(0);
  
  const [maxPuntos, setMaxPuntos] = useState(configuracionInicial?.maxPuntos ?? 21);
  const [maxTiempoMs, setMaxTiempoMs] = useState(configuracionInicial?.maxTiempoMs ?? 10 * 60 * 1000);
  
  const [timeLeftMs, setTimeLeftMs] = useState(maxTiempoMs);
  const [running, setRunning] = useState(false);

  // Update timeLeft if maxTiempoMs changes via settings
  useEffect(() => {
    if (!running && pointsTotal === 0) {
        setTimeLeftMs(maxTiempoMs);
    }
  }, [maxTiempoMs]);

  const pointsTotal = puntosA + puntosB + faltasA + faltasB;

  // Auto‑finish when max points reached
  useEffect(() => {
    if (puntosA >= maxPuntos || puntosB >= maxPuntos) {
      handleFinish();
    }
  }, [puntosA, puntosB, maxPuntos]);

  // Timer effect (Countdown)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (running) {
      timer = setInterval(() => {
        setTimeLeftMs((prev) => {
          const next = prev - 1000;
          if (next <= 0) {
            setRunning(false);
            handleFinish();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [running]);

  const handleFinish = () => {
    onSubmit({ 
        puntosA, 
        puntosB, 
        faltasA, 
        faltasB, 
        tiempoTranscurridoMs: maxTiempoMs - timeLeftMs 
    });
    // Reset for next match
    setRunning(false);
    setPuntosA(0);
    setPuntosB(0);
    setFaltasA(0);
    setFaltasB(0);
    setTimeLeftMs(maxTiempoMs);
  };

  const addPoints = (setter: React.Dispatch<React.SetStateAction<number>>, amount: number) => () => {
    setter((v) => Math.min(maxPuntos, v + amount));
  };
  
  const dec = (setter: React.Dispatch<React.SetStateAction<number>>) => () => setter((v) => Math.max(0, v - 1));

  const teamControls = (team: 'A' | 'B') => {
    const puntos = team === 'A' ? puntosA : puntosB;
    const faltas = team === 'A' ? faltasA : faltasB;
    const setPuntos = team === 'A' ? setPuntosA : setPuntosB;
    const setFaltas = team === 'A' ? setFaltasA : setFaltasB;
    const teamName = team === 'A' ? teamAName : teamBName;

    return (
      <div className="p-3 sm:p-6 border border-slate-700 rounded-3xl sm:rounded-[2.5rem] bg-slate-900/50 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <h3 className="text-center text-sm sm:text-2xl font-black text-sky-400 mb-3 sm:mb-6 uppercase tracking-wider truncate">{teamName}</h3>
        <div className="space-y-4 sm:space-y-8">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 font-black">Marcador</span>
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-6">
                <Button variant="outline" size="icon" className="h-7 w-7 sm:h-12 sm:w-12 rounded-full border-slate-700 hover:bg-slate-800" onClick={dec(setPuntos)}>-</Button>
                <span className="text-3xl sm:text-7xl font-black text-white tabular-nums w-10 sm:w-24 text-center">{puntos}</span>
                <Button variant="outline" size="icon" className="h-7 w-7 sm:h-12 sm:w-12 rounded-full border-slate-700 hover:bg-slate-800" onClick={addPoints(setPuntos, 1)} disabled={puntos >= maxPuntos}>+</Button>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button variant="secondary" className="h-7 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold bg-sky-500/10 text-sky-400 text-[10px] sm:text-base" onClick={addPoints(setPuntos, 2)} disabled={puntos >= maxPuntos}>+2</Button>
                <Button variant="secondary" className="h-7 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold bg-sky-500/10 text-sky-400 text-[10px] sm:text-base" onClick={addPoints(setPuntos, 3)} disabled={puntos >= maxPuntos}>+3</Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-3">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 font-black">Faltas</span>
            <div className="flex items-center gap-2 sm:gap-6">
              <Button variant="outline" size="icon" className="h-6 w-6 sm:h-10 sm:w-10 rounded-full border-slate-800 hover:bg-slate-800" onClick={dec(setFaltas)}>-</Button>
              <span className="text-xl sm:text-3xl font-black text-amber-500 tabular-nums w-6 sm:w-10 text-center">{faltas}</span>
              <Button variant="outline" size="icon" className="h-6 w-6 sm:h-10 sm:w-10 rounded-full border-slate-800 hover:bg-slate-800" onClick={addPoints(setFaltas, 1)}>+</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      <DialogContent className="max-w-4xl bg-slate-950 border-slate-900 text-slate-100 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 overflow-y-auto max-h-[100dvh] rounded-[2rem] sm:rounded-[3rem] border-2">
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-8">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-4xl font-black text-white tracking-tighter flex items-center gap-2 sm:gap-3">
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-sky-500 animate-pulse shrink-0" />
                <span className="truncate">MARCADOR <span className="text-sky-500 italic">LIVE</span></span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">Court Commander</DialogDescription>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 sm:w-80 bg-slate-900 border-slate-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
                  <div className="space-y-4 sm:space-y-6">
                    <h4 className="font-black uppercase tracking-widest text-[10px] sm:text-xs text-sky-500">Configuración</h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="max-points" className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Puntos para ganar</Label>
                        <Input 
                            id="max-points" 
                            type="number" 
                            value={maxPuntos} 
                            onChange={(e) => setMaxPuntos(Number(e.target.value))}
                            className="h-8 sm:h-10 bg-slate-950 border-slate-800 rounded-lg sm:rounded-xl focus:ring-sky-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="max-time" className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Tiempo (minutos)</Label>
                        <Input 
                            id="max-time" 
                            type="number" 
                            value={maxTiempoMs / 60000} 
                            onChange={(e) => setMaxTiempoMs(Number(e.target.value) * 60000)}
                            className="h-8 sm:h-10 bg-slate-950 border-slate-800 rounded-lg sm:rounded-xl focus:ring-sky-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors" onClick={onMinimize}>
                <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Timer Section - Moved up for better mobile visibility */}
          <div className="flex flex-col items-center gap-3 sm:gap-6 py-4 sm:py-8 bg-gradient-to-b from-slate-900/50 to-transparent rounded-2xl sm:rounded-[3rem] border border-slate-800/30">
            <div className={cn(
                "text-4xl sm:text-8xl font-mono font-black tracking-tighter tabular-nums px-6 sm:px-10 py-3 sm:py-6 rounded-xl sm:rounded-[2rem] border-2 shadow-2xl transition-all duration-500",
                timeLeftMs < 60000 && timeLeftMs > 0 && running ? "text-rose-500 border-rose-500/50 bg-rose-500/5 animate-pulse" : "text-white border-slate-800 bg-black/40"
            )}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="lg"
                className={cn(
                  "h-12 sm:h-20 px-6 sm:px-12 text-sm sm:text-2xl font-black rounded-lg sm:rounded-[1.5rem] transition-all duration-500 shadow-xl",
                  running 
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20" 
                    : "bg-sky-600 hover:bg-sky-700 shadow-sky-900/20"
                )}
                onClick={() => setRunning(!running)}
              >
                {running ? 'PAUSAR' : 'INICIAR'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 w-12 sm:h-20 sm:w-20 rounded-lg sm:rounded-[1.5rem] border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all p-0 flex items-center justify-center"
                onClick={() => setTimeLeftMs(maxTiempoMs)}
              >
                <RotateCcw className="h-5 w-5 sm:h-8 sm:w-8" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-8">
            {teamControls('A')}
            {teamControls('B')}
          </div>

          <DialogFooter className="flex flex-row items-center justify-between bg-slate-900/30 p-4 sm:p-8 -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 border-t border-slate-900 gap-2">
            <Button variant="ghost" className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[8px] sm:text-xs p-1" onClick={onClose}>Cancelar</Button>
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 sm:px-16 h-12 sm:h-20 text-sm sm:text-2xl rounded-lg sm:rounded-[1.5rem] shadow-2xl shadow-emerald-900/20 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all flex-1 sm:flex-initial"
              onClick={handleFinish} 
              disabled={puntosA === 0 && puntosB === 0}
            >
              FINALIZAR
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

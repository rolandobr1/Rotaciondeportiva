"use client";

import { useState } from 'react';
import { Player } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlayerCard } from './PlayerCard';
import { Users, Plus, Save, History, ListChecks } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface WaitingListProps {
  players: Player[];
  waitingListIds: string[];
  onAddPlayers: (names: string) => void;
  onRemovePlayer: (id: string) => void;
  onAssignToTeam: (id: string, team: 'A' | 'B') => void;
  onMoveInList: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onEditPlayer: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  draggedPlayerId: string | null;
  dragOverPlayerId: string | null;
  teamsAreFull: boolean;
  onSaveSnapshot: () => void;
  onRestoreSnapshot: () => void;
}

export function WaitingList({
  players,
  waitingListIds,
  onAddPlayers,
  onRemovePlayer,
  onAssignToTeam,
  onMoveInList,
  onEditPlayer,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  draggedPlayerId,
  dragOverPlayerId,
  teamsAreFull,
  onSaveSnapshot,
  onRestoreSnapshot
}: WaitingListProps) {
  const [newNames, setNewNames] = useState('');

  const handleAdd = () => {
    onAddPlayers(newNames);
    setNewNames('');
  };

  const waitingPlayers = waitingListIds
    .map(id => players.find(p => p.id === id))
    .filter((p): p is Player => !!p);

  return (
    <div className="space-y-6">
      {/* Bulk Add Section */}
      <Card className="glass border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-bold">
            <Plus className="h-5 w-5" /> 
            Añadir Jugadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Escribe nombres (uno por línea)..." 
            value={newNames}
            onChange={(e) => setNewNames(e.target.value)}
            className="bg-background/40 border-white/10 min-h-[100px] resize-none focus:ring-primary/40"
          />
          <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold shadow-lg shadow-primary/20">
            Añadir a la Lista
          </Button>
        </CardContent>
      </Card>

      {/* Snapshot Actions */}
      <Card className="glass border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-bold">
            <ListChecks className="h-5 w-5" />
            Acciones de Lista
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-medium" onClick={onSaveSnapshot}>
            <Save className="mr-2 h-4 w-4" /> Guardar
          </Button>
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-medium" onClick={onRestoreSnapshot}>
            <History className="mr-2 h-4 w-4" /> Restaurar
          </Button>
        </CardContent>
      </Card>

      {/* Main List */}
      <Card className="glass border-white/5">
        <Accordion type="single" collapsible defaultValue="list">
          <AccordionItem value="list" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline group">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary group-data-[state=open]:rotate-12 transition-transform" />
                <div className="text-left">
                  <span className="font-bold text-lg">Lista de Espera</span>
                  <p className="text-xs text-muted-foreground">{waitingPlayers.length} personas en cola</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {waitingPlayers.length > 0 ? (
                  waitingPlayers.map((p, index) => (
                    <PlayerCard 
                      key={p.id} 
                      player={p}
                      turn={index + 1}
                      onAssign={index < 10 && !teamsAreFull ? onAssignToTeam : undefined}
                      onRemove={onRemovePlayer}
                      draggable={true}
                      onDragStart={(e) => onDragStart(e, p.id)}
                      onDragEnter={(e) => onDragEnter(e, p.id)}
                      onDragLeave={onDragLeave}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, p.id)}
                      onDragEnd={() => {}}
                      isDragging={draggedPlayerId === p.id}
                      isDraggingOver={dragOverPlayerId === p.id && draggedPlayerId !== p.id}
                      onEdit={onEditPlayer}
                      onMoveInWaitingList={onMoveInList}
                      isFirstInList={index === 0}
                      isLastInList={index === waitingPlayers.length - 1}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 opacity-40 italic">
                    No hay nadie esperando
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}

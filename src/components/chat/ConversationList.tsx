import React, { useState } from 'react';
import { useChatConversations, ChatConversation } from '@/hooks/chat/useChatConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  eventId: string;
  selectedId?: string;
  onSelect: (conversation: ChatConversation) => void;
  className?: string;
}

export function ConversationList({ eventId, selectedId, onSelect, className }: ConversationListProps) {
  const { conversations, isLoading, createConversation } = useChatConversations(eventId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    setIsCreating(true);
    const conversation = await createConversation(eventId, newTitle);
    if (conversation) {
      setNewTitle('');
      setIsCreateOpen(false);
      onSelect(conversation);
    }
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Konwersacje</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Nowa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowa konwersacja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Tytuł konwersacji"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Utwórz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 px-4">
              Brak konwersacji
            </p>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                    selectedId === conversation.id && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.title || 'Bez tytułu'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(conversation.updatedAt), 'd MMM, HH:mm', { locale: pl })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ConversationList;

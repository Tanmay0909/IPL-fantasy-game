import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  inUserTeam: boolean;
  onPlayerAction?: () => void;
}

const PlayerCard = ({ player, inUserTeam, onPlayerAction }: PlayerCardProps) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handlePlayerAction = async () => {
    setIsPending(true);
    try {
      if (inUserTeam) {
        await apiRequest('DELETE', `/api/user-team/players/${player.id}`, undefined);
        toast({
          title: "Player removed",
          description: `${player.name} has been removed from your team`,
        });
      } else {
        await apiRequest('POST', '/api/user-team/players', { playerId: player.id });
        toast({
          title: "Player added",
          description: `${player.name} has been added to your team`,
        });
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/user-team'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-team/players'] });
      if (onPlayerAction) onPlayerAction();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Operation failed";
      toast({
        title: inUserTeam ? "Failed to remove player" : "Failed to add player",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  // Determine the player's stat to display based on type
  const getPlayerStat = () => {
    switch (player.type) {
      case 'batsman':
        return `Avg: ${player.stats.average}`;
      case 'bowler':
        return `Eco: ${player.stats.economy}`;
      case 'all-rounder':
      case 'wicket-keeper':
        return `Pts: ${player.stats.points}`;
      default:
        return '';
    }
  };

  return (
    <div className="player-card border-b hover:bg-gray-50 p-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center overflow-hidden">
          <img 
            src={player.image || `https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} 
            alt={player.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium">{player.name}</h3>
          <div className="text-xs text-gray-500">{player.team} | {player.type}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-700">
          {getPlayerStat()}
        </div>
        <div className="text-sm font-medium text-gray-700">
          <span className="text-secondary">{player.price} Cr</span>
        </div>
        <Button 
          size="sm"
          className={inUserTeam ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-blue-700"}
          onClick={handlePlayerAction}
          disabled={isPending}
        >
          {inUserTeam ? "Remove" : "Add"}
        </Button>
      </div>
    </div>
  );
};

export default PlayerCard;

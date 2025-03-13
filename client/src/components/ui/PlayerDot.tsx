import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { PlayerWithRole } from "@shared/schema";

interface PlayerDotProps {
  player: PlayerWithRole;
  position: string;
}

const PlayerDot = ({ player, position }: PlayerDotProps) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  // Get background color based on player type
  const getBgColor = () => {
    switch (player.type) {
      case 'batsman':
        return 'bg-secondary';
      case 'bowler':
        return 'bg-green-600';
      case 'all-rounder':
        return 'bg-blue-600';
      case 'wicket-keeper':
        return 'bg-purple-600';
      default:
        return 'bg-primary';
    }
  };

  // Get player initials
  const getInitials = () => {
    if (!player.name) return '';
    const names = player.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  const handleSetRole = async (role: string | null) => {
    setIsPending(true);
    try {
      await apiRequest('PATCH', `/api/user-team/players/${player.id}/role`, { role });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user-team/players'] });
      
      toast({
        title: role ? `${role} set` : "Role removed",
        description: `${player.name} is ${role ? `now your ${role}` : "no longer captain or vice-captain"}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update player role";
      toast({
        title: "Role update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} asChild>
        <div className={`player-dot ${getBgColor()}`}>
          <span>{getInitials()}</span>
          {player.role === "captain" && <span className="captain-badge">C</span>}
          {player.role === "vice-captain" && <span className="vice-captain-badge">V</span>}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSetRole("captain")}>
          Make Captain
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetRole("vice-captain")}>
          Make Vice Captain
        </DropdownMenuItem>
        {player.role && (
          <DropdownMenuItem onClick={() => handleSetRole(null)}>
            Remove Role
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlayerDot;

import { useState } from "react";
import { UserTeam, UserTeamPlayer, Player, Team } from "@shared/schema";
import PlayerCard from "./player-card";
import BenchPlayer from "./bench-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import { Button } from "./button";

interface TeamViewProps {
  userTeam?: UserTeam & { 
    players: (UserTeamPlayer & { 
      player: Player & { team: Team } 
    })[] 
  };
}

const TeamView = ({ userTeam }: TeamViewProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const setCaptainMutation = useMutation({
    mutationFn: async (playerId: number) => {
      if (!userTeam) return;
      await apiRequest(
        "POST",
        `/api/user-team-players/captain/${userTeam.id}/${playerId}`,
        {}
      );
    },
    onSuccess: () => {
      toast({
        title: "Captain updated",
        description: "Your team captain has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Could not update captain: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const setViceCaptainMutation = useMutation({
    mutationFn: async (playerId: number) => {
      if (!userTeam) return;
      await apiRequest(
        "POST",
        `/api/user-team-players/vice-captain/${userTeam.id}/${playerId}`,
        {}
      );
    },
    onSuccess: () => {
      toast({
        title: "Vice-captain updated",
        description: "Your team vice-captain has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Could not update vice-captain: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (!userTeam) {
    return <div>Loading team...</div>;
  }

  const activePlayers = userTeam.players.filter(p => p.isActive);
  const benchPlayers = userTeam.players.filter(p => !p.isActive);

  const wicketKeepers = activePlayers.filter(p => p.player.role === "WICKET_KEEPER");
  const batsmen = activePlayers.filter(p => p.player.role === "BATSMAN");
  const allRounders = activePlayers.filter(p => p.player.role === "ALL_ROUNDER");
  const bowlers = activePlayers.filter(p => p.player.role === "BOWLER");

  const handlePlayerClick = (player: UserTeamPlayer & { player: Player & { team: Team } }) => {
    if (!isEditing) return;
    
    // See if this player is already captain or vice-captain
    if (player.isCaptain) {
      setViceCaptainMutation.mutate(player.playerId);
    } else if (player.isViceCaptain) {
      // Remove roles (just set another player as captain to reset)
      setCaptainMutation.mutate(player.playerId);
    } else {
      // If not, make captain if no captain exists, otherwise make vice-captain
      const captain = activePlayers.find(p => p.isCaptain);
      if (!captain) {
        setCaptainMutation.mutate(player.playerId);
      } else {
        setViceCaptainMutation.mutate(player.playerId);
      }
    }
  };

  // Calculate formation
  const formation = `${batsmen.length}-${allRounders.length}-${bowlers.length}`;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-roboto font-semibold">{userTeam.name}</h2>
        <div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="bg-[#FF1744] hover:bg-opacity-90"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 inline-block mr-1" />
            {isEditing ? "Done" : "Edit Team"}
          </Button>
        </div>
      </div>

      {/* Formation indicator */}
      <div className="flex justify-center mb-2">
        <span className="bg-[#004BA0] bg-opacity-10 px-3 py-1 rounded-full text-[#004BA0] text-sm font-medium">
          Formation: {formation}
        </span>
      </div>

      {/* Cricket Field with players */}
      <div className="cricket-field rounded-lg overflow-hidden bg-green-800 bg-opacity-90 p-4 relative">
        <div className="grid grid-cols-11 gap-2">
          {/* Wicket Keeper */}
          <div className="col-span-11 flex justify-center mb-4">
            {wicketKeepers.map((player) => (
              <PlayerCard
                key={player.playerId}
                player={player.player}
                position="wicketkeeper"
                isCaptain={player.isCaptain}
                isViceCaptain={player.isViceCaptain}
                onClick={() => handlePlayerClick(player)}
              />
            ))}
          </div>

          {/* Batsmen */}
          {batsmen.map((player, index) => (
            <div 
              key={player.playerId} 
              className={`col-span-${index === 1 ? '2' : '3'} flex justify-center`}
            >
              <PlayerCard
                player={player.player}
                position="batsman"
                isCaptain={player.isCaptain}
                isViceCaptain={player.isViceCaptain}
                onClick={() => handlePlayerClick(player)}
              />
            </div>
          ))}

          {/* All Rounders */}
          {allRounders.map((player, index) => (
            <div 
              key={player.playerId} 
              className={`col-span-${index === 1 ? '5' : '3'} flex justify-center mt-4`}
            >
              <PlayerCard
                player={player.player}
                position="allrounder"
                isCaptain={player.isCaptain}
                isViceCaptain={player.isViceCaptain}
                onClick={() => handlePlayerClick(player)}
              />
            </div>
          ))}

          {/* Bowlers */}
          {bowlers.map((player, index) => (
            <div 
              key={player.playerId} 
              className={`col-span-${index === 1 ? '2' : '3'} mt-4 flex justify-center`}
            >
              <PlayerCard
                player={player.player}
                position="bowler"
                isCaptain={player.isCaptain}
                isViceCaptain={player.isViceCaptain}
                onClick={() => handlePlayerClick(player)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="mt-6">
        <h3 className="text-lg font-roboto font-semibold mb-3">Bench</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {benchPlayers.map((player) => (
            <BenchPlayer
              key={player.playerId}
              player={player.player}
              onClick={() => isEditing && handlePlayerClick(player)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamView;

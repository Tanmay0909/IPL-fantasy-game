import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type Player, type Team } from "@shared/schema";

const statusColors = {
  playing: "border-primary",
  doubtful: "border-[#FF9800]",
  injured: "border-secondary",
};

interface PlayerDisplayProps {
  player: Player;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onPlayerClick?: (player: Player) => void;
}

const PlayerDisplay = ({ player, isCaptain, isViceCaptain, onPlayerClick }: PlayerDisplayProps) => {
  return (
    <div className="player-position mx-4 text-center" onClick={() => onPlayerClick && onPlayerClick(player)}>
      <div className="inline-block relative">
        <div className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 ${player.isInjured ? statusColors.injured : player.isDoubtful ? statusColors.doubtful : statusColors.playing} overflow-hidden`}>
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="w-14 h-14 object-cover" />
          ) : (
            <div className="flex items-center justify-center w-14 h-14 bg-gray-200 text-gray-500 text-xs">No Image</div>
          )}
        </div>
        {isCaptain && (
          <span className="captain-badge absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            C
          </span>
        )}
        {isViceCaptain && (
          <span className="vice-captain-badge absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            VC
          </span>
        )}
      </div>
      <p className="mt-1 text-white font-medium text-sm">{player.shortName}</p>
      <p className="text-white text-xs opacity-80">
        {player.team} • {player.points}pts
      </p>
    </div>
  );
};

interface TeamViewProps {
  teamId?: number;
  userId?: number;
}

const TeamView = ({ teamId, userId }: TeamViewProps) => {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const { data: teamData, isLoading } = useQuery<{ team: Team; players: Player[] }>({
    queryKey: userId ? [`/api/users/${userId}/team`] : [`/api/teams/${teamId}`],
    select: (data) => ({
      team: {
        id: data.id,
        name: data.name,
        captainId: data.captainId,
        viceCaptainId: data.viceCaptainId,
        remainingBudget: data.remainingBudget,
        totalPoints: data.totalPoints,
        gameweekPoints: data.gameweekPoints,
      } as Team,
      players: data.players || [],
    }),
  });

  const setCaptainMutation = useMutation({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      if (!teamData) return null;
      return apiRequest("PATCH", `/api/teams/${teamData.team.id}`, { captainId: playerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userId ? `/api/users/${userId}/team` : `/api/teams/${teamId}`] });
      toast({
        title: "Captain updated",
        description: "Captain has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update captain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setViceCaptainMutation = useMutation({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      if (!teamData) return null;
      return apiRequest("PATCH", `/api/teams/${teamData.team.id}`, { viceCaptainId: playerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userId ? `/api/users/${userId}/team` : `/api/teams/${teamId}`] });
      toast({
        title: "Vice Captain updated",
        description: "Vice Captain has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update vice captain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayerId(player.id);
  };

  const handleSetCaptain = () => {
    if (selectedPlayerId) {
      setCaptainMutation.mutate({ playerId: selectedPlayerId });
      setSelectedPlayerId(null);
    }
  };

  const handleSetViceCaptain = () => {
    if (selectedPlayerId) {
      setViceCaptainMutation.mutate({ playerId: selectedPlayerId });
      setSelectedPlayerId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl p-4 mb-6 relative bg-gray-100 animate-pulse">
        <div className="h-80"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="rounded-xl p-4 mb-6 relative bg-gray-100">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600">No team found</h3>
          <p className="text-gray-500 mt-2">Create a team to get started</p>
        </div>
      </div>
    );
  }

  const batsmen = teamData.players.filter((p) => p.role === "BAT" || p.role === "WK");
  const allRounders = teamData.players.filter((p) => p.role === "ALL");
  const bowlers = teamData.players.filter((p) => p.role === "BWL");

  return (
    <div className="cricket-field rounded-xl p-4 mb-6 relative">
      <div className="absolute top-4 right-4 flex space-x-2">
        <div className="bg-white rounded-lg shadow px-3 py-1 flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></div>
          <span className="text-sm font-medium">Playing</span>
        </div>
        <div className="bg-white rounded-lg shadow px-3 py-1 flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF9800] mr-2"></div>
          <span className="text-sm font-medium">Doubtful</span>
        </div>
        <div className="bg-white rounded-lg shadow px-3 py-1 flex items-center">
          <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
          <span className="text-sm font-medium">Injured</span>
        </div>
      </div>

      {selectedPlayerId && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-3 z-10">
          <p className="text-sm font-semibold mb-2">Select Role:</p>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleSetCaptain}>
              Set as Captain
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSetViceCaptain}>
              Set as Vice Captain
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedPlayerId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="py-6">
        {/* Batsmen */}
        <div className="flex justify-center mb-12">
          {batsmen.map((player) => (
            <PlayerDisplay
              key={player.id}
              player={player}
              isCaptain={teamData.team.captainId === player.id}
              isViceCaptain={teamData.team.viceCaptainId === player.id}
              onPlayerClick={handlePlayerClick}
            />
          ))}
        </div>

        {/* All Rounders */}
        <div className="flex justify-center mb-12">
          {allRounders.map((player) => (
            <PlayerDisplay
              key={player.id}
              player={player}
              isCaptain={teamData.team.captainId === player.id}
              isViceCaptain={teamData.team.viceCaptainId === player.id}
              onPlayerClick={handlePlayerClick}
            />
          ))}
        </div>

        {/* Bowlers */}
        <div className="flex justify-center">
          {bowlers.map((player) => (
            <PlayerDisplay
              key={player.id}
              player={player}
              isCaptain={teamData.team.captainId === player.id}
              isViceCaptain={teamData.team.viceCaptainId === player.id}
              onPlayerClick={handlePlayerClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamView;

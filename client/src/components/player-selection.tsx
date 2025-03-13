import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type Player, type Team } from "@shared/schema";

interface PlayerSelectionProps {
  userId: number;
}

const PlayerSelection = ({ userId }: PlayerSelectionProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Players");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");

  const { data: allPlayers, isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const { data: userTeam } = useQuery<{ team: Team; players: Player[] }>({
    queryKey: [`/api/users/${userId}/team`],
    select: (data) => ({
      team: {
        id: data.id,
        name: data.name,
        remainingBudget: data.remainingBudget,
      } as Team,
      players: data.players || [],
    }),
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ teamId, playerId }: { teamId: number; playerId: number }) => {
      return apiRequest("POST", "/api/team-players", { teamId, playerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/team`] });
      toast({
        title: "Player added",
        description: "Player has been added to your team",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add player",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddPlayer = (player: Player) => {
    if (!userTeam || !userTeam.team.id) {
      toast({
        title: "Team not found",
        description: "You need to create a team first",
        variant: "destructive",
      });
      return;
    }

    // Check if player is already in team
    if (userTeam.players.some((p) => p.id === player.id)) {
      toast({
        title: "Player already in team",
        description: "This player is already in your team",
        variant: "destructive",
      });
      return;
    }

    // Check if enough budget
    if (userTeam.team.remainingBudget < player.price) {
      toast({
        title: "Not enough budget",
        description: `You need ₹${player.price.toFixed(1)}M but only have ₹${userTeam.team.remainingBudget.toFixed(1)}M`,
        variant: "destructive",
      });
      return;
    }

    addPlayerMutation.mutate({ teamId: userTeam.team.id, playerId: player.id });
  };

  // Filter players based on search, role, and team
  const filteredPlayers = allPlayers
    ? allPlayers.filter((player) => {
        const matchesSearch = searchQuery.trim() === "" 
          || player.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = selectedRole === "All Players" 
          || (selectedRole === "Batsmen" && (player.role === "BAT" || player.role === "WK"))
          || (selectedRole === "All-rounders" && player.role === "ALL")
          || (selectedRole === "Bowlers" && player.role === "BWL");
        
        const matchesTeam = selectedTeam === "All Teams" 
          || player.team === selectedTeam;
        
        return matchesSearch && matchesRole && matchesTeam;
      })
    : [];

  // Get unique teams for filtering
  const teams = allPlayers
    ? [...new Set(allPlayers.map((player) => player.team))].sort()
    : [];

  if (isLoadingPlayers) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
        <div className="max-h-[500px] overflow-y-auto pr-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Player Selection</h2>
        <div className="relative">
          <select
            className="bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>All Players</option>
            <option>Batsmen</option>
            <option>All-rounders</option>
            <option>Bowlers</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search players..."
          className="w-full py-2 px-4 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={selectedTeam === "All Teams" ? "default" : "outline"}
          className="whitespace-nowrap text-xs font-medium rounded-full"
          size="sm"
          onClick={() => setSelectedTeam("All Teams")}
        >
          All Teams
        </Button>
        {teams.map((team) => (
          <Button
            key={team}
            variant={selectedTeam === team ? "default" : "outline"}
            className="whitespace-nowrap text-xs font-medium rounded-full"
            size="sm"
            onClick={() => setSelectedTeam(team)}
          >
            {team}
          </Button>
        ))}
      </div>

      {/* Player list */}
      <div className="max-h-[500px] overflow-y-auto pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No players found matching your search criteria
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="player-card bg-gray-50 rounded-lg p-3 mb-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
              onClick={() => handleAddPlayer(player)}
            >
              <div className="flex items-center">
                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-3 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                    No Image
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{player.name}</h4>
                  <div className="flex items-center text-xs text-gray-600">
                    <span
                      className={`${
                        player.role === "BAT" || player.role === "WK"
                          ? "bg-primary"
                          : player.role === "ALL"
                          ? "bg-[#FF9800]"
                          : "bg-secondary"
                      } text-white px-1.5 rounded text-xs mr-2`}
                    >
                      {player.role}
                    </span>
                    <span>{player.team}</span>
                    <span className="mx-1">•</span>
                    <span
                      className={`${
                        player.form > 7
                          ? "text-[#4CAF50]"
                          : player.form < 5
                          ? "text-secondary"
                          : ""
                      } font-medium`}
                    >
                      Form: {player.form.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">₹{player.price.toFixed(1)}M</span>
                {player.priceChange !== 0 && (
                  <span
                    className={`text-xs ${
                      player.priceChange > 0
                        ? "text-[#4CAF50]"
                        : "text-secondary"
                    }`}
                  >
                    {player.priceChange > 0 ? "+" : ""}
                    {player.priceChange.toFixed(1)}M
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerSelection;

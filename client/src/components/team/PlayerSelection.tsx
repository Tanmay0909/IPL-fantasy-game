import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PlayerCard from "@/components/ui/PlayerCard";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Player } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const PlayerSelection = () => {
  const [filterType, setFilterType] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
    refetchOnWindowFocus: false
  });
  
  // Fetch user team players to determine which players are already in the team
  const { data: userTeamPlayers, isLoading: userTeamLoading } = useQuery({
    queryKey: ['/api/user-team/players'],
    refetchOnWindowFocus: false
  });

  // Available IPL teams for filtering
  const iplTeams = [
    { id: "all", name: "All Teams" },
    { id: "MI", name: "Mumbai Indians" },
    { id: "CSK", name: "Chennai Super Kings" },
    { id: "RCB", name: "Royal Challengers Bangalore" },
    { id: "KKR", name: "Kolkata Knight Riders" },
    { id: "DC", name: "Delhi Capitals" },
    { id: "PBKS", name: "Punjab Kings" },
    { id: "RR", name: "Rajasthan Royals" },
    { id: "SRH", name: "Sunrisers Hyderabad" }
  ];

  // Filter players based on type, team and search query
  const getFilteredPlayers = () => {
    if (!players) return [];
    
    return players.filter((player: Player) => {
      // Filter by player type
      if (filterType !== "all" && player.type !== filterType) return false;
      
      // Filter by team
      if (filterTeam !== "all" && player.team !== filterTeam) return false;
      
      // Filter by search query
      if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  };

  // Check if a player is in user's team
  const isPlayerInTeam = (playerId: number) => {
    if (!userTeamPlayers) return false;
    return userTeamPlayers.some((p: any) => p.id === playerId);
  };

  const filteredPlayers = getFilteredPlayers();
  const isLoading = playersLoading || userTeamLoading;

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-primary px-4 py-3 text-white">
        <h2 className="font-roboto font-bold">Select Players</h2>
      </CardHeader>
      
      {/* Player Filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:gap-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filterType === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterType("all")}
              className={filterType === "all" ? "bg-primary" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}
            >
              All
            </Button>
            <Button 
              variant={filterType === "batsman" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterType("batsman")}
              className={filterType === "batsman" ? "bg-secondary" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}
            >
              BAT
            </Button>
            <Button 
              variant={filterType === "all-rounder" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterType("all-rounder")}
              className={filterType === "all-rounder" ? "bg-primary" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}
            >
              AR
            </Button>
            <Button 
              variant={filterType === "bowler" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterType("bowler")}
              className={filterType === "bowler" ? "bg-primary" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}
            >
              BOWL
            </Button>
            <Button 
              variant={filterType === "wicket-keeper" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterType("wicket-keeper")}
              className={filterType === "wicket-keeper" ? "bg-primary" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}
            >
              WK
            </Button>
          </div>
          
          <div className="flex flex-grow gap-2">
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
            
            <Select 
              value={filterTeam} 
              onValueChange={setFilterTeam}
            >
              <SelectTrigger className="w-[140px] bg-gray-100">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                {iplTeams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Player List */}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-3 border-b">
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : filteredPlayers.length > 0 ? (
            filteredPlayers.map((player: Player) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                inUserTeam={isPlayerInTeam(player.id)} 
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No players found matching your filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSelection;

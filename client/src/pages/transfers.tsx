import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameweekInfo from "@/components/ui/gameweek-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Team, UserTeam } from "@shared/schema";
import BenchPlayer from "@/components/ui/bench-player";

const Transfers = () => {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery<{
    user: any;
    userTeam: UserTeam;
    currentGameweek: any;
  }>({
    queryKey: ["/api/current-user"],
  });

  const { data: players, isLoading: playersLoading } = useQuery<(Player & { team: Team })[]>({
    queryKey: ["/api/players"],
  });

  if (isLoading || playersLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const filteredPlayers = players ? players.filter(player => {
    if (filter === "all") return true;
    return player.role === filter;
  }) : [];

  return (
    <>
      <GameweekInfo userTeam={data?.userTeam} />
      
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Player Transfers</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  You have <span className="font-bold text-[#004BA0]">{data?.userTeam.remainingTransfers || 0}</span> free transfers remaining
                </p>
              </div>
              <div className="flex space-x-2">
                <div className="text-sm text-gray-600">
                  Budget: <span className="font-bold text-[#004BA0]">₹{data?.userTeam ? (data.userTeam.budget / 10).toFixed(1) : 0}m</span>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="WICKET_KEEPER">Wicket Keepers</TabsTrigger>
                <TabsTrigger value="BATSMAN">Batsmen</TabsTrigger>
                <TabsTrigger value="ALL_ROUNDER">All Rounders</TabsTrigger>
                <TabsTrigger value="BOWLER">Bowlers</TabsTrigger>
              </TabsList>
              
              <TabsContent value={filter}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredPlayers.map(player => (
                    <BenchPlayer key={player.id} player={player} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Transfers;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameweekInfo from "@/components/ui/gameweek-info";
import TeamView from "@/components/ui/team-view";
import PowerUpCard from "@/components/ui/power-up-card";
import FixtureCard from "@/components/ui/fixture-card";
import LeagueCard from "@/components/ui/league-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gameweek, User, UserTeam, League, Fixture, Team, UserPowerUp, PowerUp } from "@shared/schema";

interface CurrentUserData {
  user: User;
  userTeam: UserTeam;
  currentGameweek: Gameweek;
  leagues: (League & { members: any[] })[];
  fixtures: (Fixture & { homeTeam: Team; awayTeam: Team })[];
  powerUps: (UserPowerUp & { powerUp: PowerUp })[];
}

const Home = () => {
  const [activeTab, setActiveTab] = useState("team");

  const { data, isLoading, error } = useQuery<CurrentUserData>({
    queryKey: ["/api/current-user"],
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error || !data) {
    return <div className="container mx-auto px-4 py-8">Error loading data</div>;
  }

  return (
    <>
      <GameweekInfo userTeam={data.userTeam} />
      
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full mb-6">
          <Tabs defaultValue="team" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200">
              <TabsList className="p-0 bg-transparent">
                <TabsTrigger 
                  value="team" 
                  className={`px-4 py-3 rounded-none ${activeTab === 'team' ? 'border-b-2 border-[#004BA0] text-[#004BA0]' : 'text-gray-500 hover:text-[#004BA0]'} font-medium`}
                >
                  My Team
                </TabsTrigger>
                <TabsTrigger 
                  value="transfers" 
                  className={`px-4 py-3 rounded-none ${activeTab === 'transfers' ? 'border-b-2 border-[#004BA0] text-[#004BA0]' : 'text-gray-500 hover:text-[#004BA0]'} font-medium`}
                >
                  Transfers
                </TabsTrigger>
                <TabsTrigger 
                  value="points" 
                  className={`px-4 py-3 rounded-none ${activeTab === 'points' ? 'border-b-2 border-[#004BA0] text-[#004BA0]' : 'text-gray-500 hover:text-[#004BA0]'} font-medium`}
                >
                  Points
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="team">
              <TeamView userTeam={data.userTeam} />
            </TabsContent>
            
            <TabsContent value="transfers">
              <div className="p-4">
                <h2 className="text-xl font-roboto font-semibold mb-4">Player Transfers</h2>
                <p>This tab will contain the transfers functionality.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="points">
              <div className="p-4">
                <h2 className="text-xl font-roboto font-semibold mb-4">Gameweek Points</h2>
                <p>This tab will contain the points breakdown.</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Team Stats and Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Points Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Gameweek 7 Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-[#004BA0]">87</span>
                <div className="text-sm text-gray-500">Average: 62</div>
                <div className="text-sm text-green-600">+25 above average</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Highest Scorer:</span>
                  <span className="font-medium">R. Sharma (26 pts)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Captain points:</span>
                  <span className="font-medium">MS Dhoni (20 pts)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Vice-Captain points:</span>
                  <span className="font-medium">H. Pandya (10 pts)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Bench points:</span>
                  <span className="font-medium">23 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leagues Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Leagues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.leagues.map((league) => (
                <LeagueCard 
                  key={league.id} 
                  league={league} 
                  userTeamId={data.userTeam.id} 
                />
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Fixtures */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.fixtures.map((fixture) => (
                  <FixtureCard 
                    key={fixture.id} 
                    fixture={fixture} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Power-ups and Chips */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Power-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.powerUps.map((powerUp) => (
                <PowerUpCard 
                  key={powerUp.id} 
                  userPowerUp={powerUp} 
                  gameweekId={data.currentGameweek.id} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Home;

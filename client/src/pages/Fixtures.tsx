import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameStatusBar from "@/components/layout/GameStatusBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  startTime: string;
  status: string;
  result?: string;
  homeScore?: string;
  awayScore?: string;
}

const Fixtures = () => {
  const [teamFilter, setTeamFilter] = useState("all");

  // Get all fixtures
  const { data: allFixtures, isLoading } = useQuery({
    queryKey: ['/api/fixtures'],
    refetchOnWindowFocus: false
  });

  // Get IPL teams
  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
    refetchOnWindowFocus: false
  });

  // Group fixtures by status
  const groupFixturesByStatus = (fixtures: Fixture[] = []) => {
    const upcoming = fixtures.filter(f => f.status === 'upcoming');
    const live = fixtures.filter(f => f.status === 'live');
    const completed = fixtures.filter(f => f.status === 'completed');
    
    // Apply team filter if not "all"
    const filterByTeam = (fixtures: Fixture[]) => {
      if (teamFilter === "all") return fixtures;
      return fixtures.filter(f => 
        f.homeTeam === teamFilter || f.awayTeam === teamFilter
      );
    };
    
    return {
      upcoming: filterByTeam(upcoming),
      live: filterByTeam(live),
      completed: filterByTeam(completed)
    };
  };

  const { upcoming, live, completed } = groupFixturesByStatus(allFixtures);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <GameStatusBar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">IPL 2023 Fixtures</h1>
          
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams?.map(team => (
                <SelectItem key={team.code} value={team.code}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live" className="relative">
              Live
              {live?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : upcoming && upcoming.length > 0 ? (
              <div className="grid gap-6">
                {upcoming.map(fixture => (
                  <Card key={fixture.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3 px-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{formatDate(fixture.startTime)}</span>
                        <span className="text-sm text-gray-500">{fixture.venue}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-6 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.homeTeam}`}
                            alt={fixture.homeTeam}
                            className="w-full h-full"
                          />
                        </div>
                        <span className="font-bold text-lg">{fixture.homeTeam}</span>
                      </div>
                      
                      <div className="font-semibold text-lg">vs</div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-lg">{fixture.awayTeam}</span>
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.awayTeam}`}
                            alt={fixture.awayTeam}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No upcoming matches {teamFilter !== "all" ? `for ${teamFilter}` : ""}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="live">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : live && live.length > 0 ? (
              <div className="grid gap-6">
                {live.map(fixture => (
                  <Card key={fixture.id} className="overflow-hidden border-2 border-green-500">
                    <CardHeader className="bg-green-50 py-3 px-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          LIVE NOW
                        </span>
                        <span className="text-sm text-gray-700">{fixture.venue}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.homeTeam}`}
                              alt={fixture.homeTeam}
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-xl">{fixture.homeTeam}</span>
                            {fixture.homeScore && (
                              <div className="text-sm text-gray-600">{fixture.homeScore}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="font-semibold text-lg">vs</div>
                        
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="font-bold text-xl">{fixture.awayTeam}</span>
                            {fixture.awayScore && (
                              <div className="text-sm text-gray-600">{fixture.awayScore}</div>
                            )}
                          </div>
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.awayTeam}`}
                              alt={fixture.awayTeam}
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {fixture.result && (
                        <div className="text-center text-green-600 font-medium">
                          {fixture.result}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No live matches at the moment
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : completed && completed.length > 0 ? (
              <div className="grid gap-6">
                {completed.map(fixture => (
                  <Card key={fixture.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3 px-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{formatDate(fixture.startTime)}</span>
                        <span className="text-sm text-gray-500">{fixture.venue}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.homeTeam}`}
                              alt={fixture.homeTeam}
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-lg">{fixture.homeTeam}</span>
                            {fixture.homeScore && (
                              <div className="text-sm text-gray-600">{fixture.homeScore}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="font-semibold text-lg">vs</div>
                        
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="font-bold text-lg">{fixture.awayTeam}</span>
                            {fixture.awayScore && (
                              <div className="text-sm text-gray-600">{fixture.awayScore}</div>
                            )}
                          </div>
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${fixture.awayTeam}`}
                              alt={fixture.awayTeam}
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {fixture.result && (
                        <div className="text-center text-gray-700 font-medium">
                          {fixture.result}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No completed matches {teamFilter !== "all" ? `for ${teamFilter}` : ""}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Fixtures;

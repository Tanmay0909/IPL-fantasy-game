import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { type User } from "@shared/schema";

const Leaderboard = () => {
  // Mock user ID for demo purposes
  const userId = 1;

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    // Fallback to an empty array if the endpoint doesn't exist yet
    select: (data) => data || [],
  });

  // Mock global rankings for now (since we don't have a dedicated endpoint)
  const globalRankings = [
    { id: 1, username: "RohitFan", totalPoints: 612, change: 2 },
    { id: 2, username: "ViratKing", totalPoints: 598, change: -1 },
    { id: 3, username: "DhoniLover", totalPoints: 573, change: 1 },
    { id: 4, username: "CricketMaster", totalPoints: 557, change: -2 },
    { id: 5, username: "IPLGuru", totalPoints: 542, change: 3 },
    { id: 6, username: "FantasyPro", totalPoints: 537, change: 0 },
    { id: 7, username: "BumrahBoss", totalPoints: 521, change: 5 },
    { id: 8, username: "MaxwellFan", totalPoints: 508, change: -3 },
    { id: 9, username: "KLRahulSupporter", totalPoints: 496, change: 1 },
    { id: 10, username: "JadejaJunior", totalPoints: 489, change: -1 },
    { id: userId, username: "YourUsername", totalPoints: 437, change: 2 },
  ].sort((a, b) => b.totalPoints - a.totalPoints);

  // For weekly rankings, we'll adjust the total points a bit to simulate different weekly performances
  const weeklyRankings = [...globalRankings]
    .map(user => ({
      ...user,
      weeklyPoints: Math.floor(Math.random() * 70) + 30 // Random score between 30-100
    }))
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  // Find the user's position in the rankings
  const userGlobalRank = globalRankings.findIndex(u => u.id === userId) + 1;
  const userWeeklyRank = weeklyRankings.findIndex(u => u.id === userId) + 1;

  // Get the top 10 users
  const top10Global = globalRankings.slice(0, 10);
  const top10Weekly = weeklyRankings.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other fantasy cricket managers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Global Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-4xl font-bold text-primary">{userGlobalRank}</span>
              <span className="ml-2 text-sm text-gray-500">of {globalRankings.length}</span>
              {globalRankings.find(u => u.id === userId)?.change > 0 && (
                <Badge className="ml-auto bg-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  {globalRankings.find(u => u.id === userId)?.change}
                </Badge>
              )}
              {globalRankings.find(u => u.id === userId)?.change < 0 && (
                <Badge className="ml-auto bg-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
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
                  {Math.abs(globalRankings.find(u => u.id === userId)?.change || 0)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Weekly Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-4xl font-bold text-secondary">{userWeeklyRank}</span>
              <span className="ml-2 text-sm text-gray-500">of {weeklyRankings.length}</span>
              <div className="ml-auto">
                <span className="text-xl font-bold">
                  {weeklyRankings.find(u => u.id === userId)?.weeklyPoints}
                </span>
                <span className="text-sm text-gray-500 ml-1">pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-4xl font-bold text-accent">
                {globalRankings.find(u => u.id === userId)?.totalPoints}
              </span>
              <div className="ml-auto">
                <span className="text-xl font-semibold text-primary">
                  {globalRankings[0].totalPoints - (globalRankings.find(u => u.id === userId)?.totalPoints || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">from #1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global">
        <TabsList className="mb-4">
          <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Global Rankings</CardTitle>
              <CardDescription>
                Overall performance throughout the season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-right w-20">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10Global.map((user, index) => (
                    <TableRow key={user.id} className={user.id === userId ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">
                        {index === 0 && <span className="text-accent">🏆</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-amber-600">🥉</span>}
                        {index > 2 && (index + 1)}
                      </TableCell>
                      <TableCell>
                        {user.username}
                        {user.id === userId && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{user.totalPoints}</TableCell>
                      <TableCell className="text-right">
                        {user.change > 0 && (
                          <span className="text-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 inline"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            {user.change}
                          </span>
                        )}
                        {user.change < 0 && (
                          <span className="text-red-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 inline"
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
                            {Math.abs(user.change)}
                          </span>
                        )}
                        {user.change === 0 && <span>-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {userGlobalRank > 10 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          . . .
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-medium">{userGlobalRank}</TableCell>
                        <TableCell>
                          {globalRankings.find(u => u.id === userId)?.username}
                          <Badge variant="outline" className="ml-2">You</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {globalRankings.find(u => u.id === userId)?.totalPoints}
                        </TableCell>
                        <TableCell className="text-right">
                          {(globalRankings.find(u => u.id === userId)?.change || 0) > 0 && (
                            <span className="text-green-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 inline"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                              {globalRankings.find(u => u.id === userId)?.change}
                            </span>
                          )}
                          {(globalRankings.find(u => u.id === userId)?.change || 0) < 0 && (
                            <span className="text-red-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 inline"
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
                              {Math.abs(globalRankings.find(u => u.id === userId)?.change || 0)}
                            </span>
                          )}
                          {(globalRankings.find(u => u.id === userId)?.change || 0) === 0 && <span>-</span>}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Rankings</CardTitle>
              <CardDescription>
                Gameweek 5 performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Weekly Points</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10Weekly.map((user, index) => (
                    <TableRow key={user.id} className={user.id === userId ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">
                        {index === 0 && <span className="text-accent">🏆</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-amber-600">🥉</span>}
                        {index > 2 && (index + 1)}
                      </TableCell>
                      <TableCell>
                        {user.username}
                        {user.id === userId && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{user.weeklyPoints}</TableCell>
                      <TableCell className="text-right text-gray-500">{user.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                  
                  {userWeeklyRank > 10 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          . . .
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-medium">{userWeeklyRank}</TableCell>
                        <TableCell>
                          {weeklyRankings.find(u => u.id === userId)?.username}
                          <Badge variant="outline" className="ml-2">You</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {weeklyRankings.find(u => u.id === userId)?.weeklyPoints}
                        </TableCell>
                        <TableCell className="text-right text-gray-500">
                          {weeklyRankings.find(u => u.id === userId)?.totalPoints}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;

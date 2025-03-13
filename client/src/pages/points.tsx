import { useQuery } from "@tanstack/react-query";
import GameweekInfo from "@/components/ui/gameweek-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTeam } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Sample data for the chart
const pointsHistory = [
  { gameweek: "GW1", points: 45, average: 38 },
  { gameweek: "GW2", points: 62, average: 51 },
  { gameweek: "GW3", points: 35, average: 42 },
  { gameweek: "GW4", points: 55, average: 49 },
  { gameweek: "GW5", points: 72, average: 56 },
  { gameweek: "GW6", points: 68, average: 61 },
  { gameweek: "GW7", points: 87, average: 62 },
];

const Points = () => {
  const { data, isLoading } = useQuery<{
    user: any;
    userTeam: UserTeam;
    currentGameweek: any;
  }>({
    queryKey: ["/api/current-user"],
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <>
      <GameweekInfo userTeam={data?.userTeam} />
      
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Points History</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pointsHistory}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gameweek" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" name="Your Points" fill="#004BA0" />
                  <Bar dataKey="average" name="Average" fill="#FFD700" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Gameweek 7 Details</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Player</th>
                    <th className="text-center pb-2">Team</th>
                    <th className="text-right pb-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">R. Sharma (C)</td>
                    <td className="text-center py-2">MI</td>
                    <td className="text-right py-2 font-medium">26</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">V. Kohli</td>
                    <td className="text-center py-2">RCB</td>
                    <td className="text-right py-2 font-medium">18</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">MS Dhoni</td>
                    <td className="text-center py-2">CSK</td>
                    <td className="text-right py-2 font-medium">10</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">H. Pandya (VC)</td>
                    <td className="text-center py-2">MI</td>
                    <td className="text-right py-2 font-medium">10</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">J. Bumrah</td>
                    <td className="text-center py-2">MI</td>
                    <td className="text-right py-2 font-medium">8</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">R. Jadeja</td>
                    <td className="text-center py-2">CSK</td>
                    <td className="text-right py-2 font-medium">6</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Total</td>
                    <td className="text-center py-2"></td>
                    <td className="text-right py-2 font-bold text-[#004BA0]">87</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Season Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Points:</span>
                  <span className="font-bold text-[#004BA0] text-xl">{data?.userTeam.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Global Rank:</span>
                  <span className="font-medium">12,567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Highest Gameweek:</span>
                  <span className="font-medium">87 (GW7)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Points:</span>
                  <span className="font-medium">60.6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transfers Made:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Chips Used:</span>
                  <span className="font-medium">Triple Captain (GW3)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Points;

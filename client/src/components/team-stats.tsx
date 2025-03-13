import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { type Player, type Team } from "@shared/schema";

interface TeamStatsProps {
  teamId?: number;
  userId?: number;
}

const TeamStats = ({ teamId, userId }: TeamStatsProps) => {
  const { data, isLoading } = useQuery<{ team: Team; players: Player[] }>({
    queryKey: userId ? [`/api/users/${userId}/team`] : [`/api/teams/${teamId}`],
    select: (data) => ({
      team: {
        id: data.id,
        name: data.name,
        remainingBudget: data.remainingBudget,
      } as Team,
      players: data.players || [],
    }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.players.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Balance</h3>
          <p className="text-sm text-gray-500">No players selected yet</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Value</h3>
          <div className="flex flex-col h-full justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">₹0.0M</span>
              <p className="text-gray-500 text-sm mt-1">Team Value</p>
            </div>
            <div className="text-center mt-4">
              <span className="text-xl font-bold text-[#4CAF50]">₹100.0M</span>
              <p className="text-gray-500 text-sm mt-1">Bank</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Distribution</h3>
          <p className="text-sm text-gray-500">No teams selected yet</p>
        </div>
      </div>
    );
  }

  const batsmen = data.players.filter((p) => p.role === "BAT" || p.role === "WK");
  const allRounders = data.players.filter((p) => p.role === "ALL");
  const bowlers = data.players.filter((p) => p.role === "BWL");

  const teamValue = data.players.reduce((sum, player) => sum + player.price, 0);
  const remainingBudget = data.team.remainingBudget || 100 - teamValue;

  // Get team distribution
  const teamCounts: Record<string, number> = {};
  data.players.forEach((player) => {
    if (teamCounts[player.team]) {
      teamCounts[player.team]++;
    } else {
      teamCounts[player.team] = 1;
    }
  });

  // Team colors
  const teamColors: Record<string, string> = {
    MI: "bg-primary",
    CSK: "bg-yellow-500",
    RCB: "bg-red-600",
    KKR: "bg-purple-700",
    DC: "bg-blue-400",
    PBKS: "bg-red-500",
    RR: "bg-pink-500",
    SRH: "bg-orange-500",
    GT: "bg-teal-500",
    LSG: "bg-green-600",
  };

  const sortedTeams = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Balance</h3>
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Batsmen</span>
          <span className="font-medium">{batsmen.length}/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${(batsmen.length / 7) * 100}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-sm mb-1">
          <span>All-rounders</span>
          <span className="font-medium">{allRounders.length}/4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${(allRounders.length / 4) * 100}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-sm mb-1">
          <span>Bowlers</span>
          <span className="font-medium">{bowlers.length}/6</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${(bowlers.length / 6) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Value</h3>
        <div className="flex flex-col h-full justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold text-primary">₹{teamValue.toFixed(1)}M</span>
            <p className="text-gray-500 text-sm mt-1">Team Value</p>
          </div>
          <div className="text-center mt-4">
            <span className="text-xl font-bold text-[#4CAF50]">₹{remainingBudget.toFixed(1)}M</span>
            <p className="text-gray-500 text-sm mt-1">Bank</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Distribution</h3>
        <div className="space-y-2">
          {sortedTeams.map(([team, count]) => (
            <div key={team} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${teamColors[team] || 'bg-gray-400'} mr-2`}></div>
                <span>{team}</span>
              </div>
              <span className="font-medium">{count}</span>
            </div>
          ))}
          {sortedTeams.length === 0 && (
            <p className="text-sm text-gray-500">No teams selected yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamStats;

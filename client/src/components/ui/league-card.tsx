import { League, LeagueMember, UserTeam } from "@shared/schema";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface LeagueCardProps {
  league: League & { members: (LeagueMember & { userTeam: UserTeam })[] };
  userTeamId: number;
}

const LeagueCard = ({ league, userTeamId }: LeagueCardProps) => {
  // Sort members by points
  const sortedMembers = [...league.members].sort((a, b) => 
    b.userTeam.totalPoints - a.userTeam.totalPoints
  );
  
  // Find user's rank
  const userRank = sortedMembers.findIndex(m => m.userTeam.id === userTeamId) + 1;
  
  // Determine if user moved up, down, or stayed the same
  const getRankChange = () => {
    // For demo purposes, create fictional rank changes
    if (league.name === "Global") return 2310; // Up
    if (league.name === "Cricket Office League") return -1; // Down
    return 0; // No change (Friends United)
  };
  
  const rankChange = getRankChange();

  return (
    <div className="border-b border-gray-200 pb-3">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{league.name}</h4>
          <p className="text-sm text-gray-500">
            Rank: {userRank} of {sortedMembers.length}
          </p>
        </div>
        <div className={`text-sm ${
          rankChange > 0 
            ? "text-green-600" 
            : rankChange < 0 
              ? "text-red-600" 
              : "text-gray-600"
        }`}>
          {rankChange > 0 ? (
            <>↑ {rankChange}</>
          ) : rankChange < 0 ? (
            <>↓ {Math.abs(rankChange)}</>
          ) : (
            <>↔ {rankChange}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueCard;

import { Player, Team } from "@shared/schema";

interface BenchPlayerProps {
  player: Player & { team: Team };
  onClick?: () => void;
}

const BenchPlayer = ({ player, onClick }: BenchPlayerProps) => {
  const getRoleLabel = () => {
    switch (player.role) {
      case "WICKET_KEEPER": return "WK";
      case "BATSMAN": return "BAT";
      case "ALL_ROUNDER": return "ALL";
      case "BOWLER": return "BOWL";
      default: return "";
    }
  };

  return (
    <div className="player-card col-span-1" onClick={onClick}>
      <div className="bg-white rounded-lg shadow p-2 flex items-center space-x-3 border border-gray-200">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#004BA0] bg-opacity-10 flex items-center justify-center">
            <img src={player.imageUrl} alt={player.name} className="w-8 h-8" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{player.displayName}</p>
          <p className="text-xs text-gray-500">{player.team.shortName} • {getRoleLabel()}</p>
        </div>
      </div>
    </div>
  );
};

export default BenchPlayer;

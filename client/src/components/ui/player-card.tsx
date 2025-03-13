import { Player, Team } from "@shared/schema";

interface PlayerCardProps {
  player: Player & { team: Team };
  position: "wicketkeeper" | "batsman" | "allrounder" | "bowler";
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  className?: string;
  onClick?: () => void;
}

const PlayerCard = ({ 
  player, 
  position, 
  isCaptain = false, 
  isViceCaptain = false,
  className = "",
  onClick
}: PlayerCardProps) => {
  // Map role to display label
  const getRoleLabel = () => {
    switch (position) {
      case "wicketkeeper": return "WK";
      case "batsman": return "BAT";
      case "allrounder": return "ALL";
      case "bowler": return "BOWL";
      default: return "";
    }
  };

  return (
    <div className={`player-card ${className}`} onClick={onClick}>
      <div className="bg-white rounded-lg shadow-lg w-16 text-center overflow-hidden">
        <div className="bg-[#004BA0] text-white text-xs py-1">{getRoleLabel()}</div>
        <div className="p-1">
          <img src={player.imageUrl} alt={player.name} className="w-10 h-10 mx-auto" />
          <div className="text-xs font-medium truncate">{player.displayName}</div>
          <div className="text-[#FF1744] text-xs font-bold">{player.team.shortName}</div>
        </div>
        {isCaptain && (
          <div className="bg-[#FFD700] text-[#004BA0] text-xs py-1 font-bold">
            C
          </div>
        )}
        {isViceCaptain && (
          <div className="bg-[#FFD700] bg-opacity-40 text-[#004BA0] text-xs py-1 font-bold">
            VC
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;

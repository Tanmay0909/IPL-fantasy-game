import { Fixture, Team } from "@shared/schema";
import { format } from "date-fns";

interface FixtureCardProps {
  fixture: Fixture & { homeTeam: Team; awayTeam: Team };
}

const FixtureCard = ({ fixture }: FixtureCardProps) => {
  const formatMatchTime = (date: Date) => {
    return format(new Date(date), "MMM d • HH:mm");
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8">
          <img 
            src={fixture.homeTeam.logoUrl} 
            alt={fixture.homeTeam.name} 
            className="w-full h-full object-contain" 
          />
        </div>
        <span className="font-medium">{fixture.homeTeam.shortName}</span>
      </div>
      <div className="text-center">
        <span className="text-xs block text-gray-500">
          {formatMatchTime(fixture.startTime)}
        </span>
        <span className="text-sm font-medium">vs</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{fixture.awayTeam.shortName}</span>
        <div className="w-8 h-8">
          <img 
            src={fixture.awayTeam.logoUrl} 
            alt={fixture.awayTeam.name} 
            className="w-full h-full object-contain" 
          />
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TeamComposition = () => {
  // Fetch user team composition
  const { data: composition, isLoading } = useQuery({
    queryKey: ['/api/user-team/composition'],
    refetchOnWindowFocus: false
  });

  // Fetch team distribution
  const { data: distribution, isLoading: distributionLoading } = useQuery({
    queryKey: ['/api/user-team/distribution'],
    refetchOnWindowFocus: false
  });

  if (isLoading || distributionLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-md overflow-hidden">
        <CardHeader className="bg-primary px-4 py-3 text-white">
          <h2 className="font-roboto font-bold">Team Composition</h2>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const playerTypes = [
    { type: 'batsman', label: 'Batsmen', color: 'bg-secondary', count: composition?.batsmen || 0, max: composition?.maxBatsmen || 5 },
    { type: 'all-rounder', label: 'All-rounders', color: 'bg-blue-600', count: composition?.allRounders || 0, max: composition?.maxAllRounders || 3 },
    { type: 'bowler', label: 'Bowlers', color: 'bg-green-600', count: composition?.bowlers || 0, max: composition?.maxBowlers || 5 },
    { type: 'wicket-keeper', label: 'Wicket Keepers', color: 'bg-purple-600', count: composition?.wicketKeepers || 0, max: composition?.maxWicketKeepers || 1 }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-primary px-4 py-3 text-white">
        <h2 className="font-roboto font-bold">Team Composition</h2>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {playerTypes.map(type => (
            <div key={type.type} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${type.color} mr-2`}></div>
                <span className="text-sm">{type.label}</span>
              </div>
              <div className="text-sm font-medium">{type.count} / {type.max}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Team Distribution</div>
          <div className="grid grid-cols-4 gap-2">
            {distribution && Object.entries(distribution).map(([team, count]) => (
              <div key={team} className="bg-gray-100 p-2 rounded text-center">
                <div className="text-xs text-gray-500">{team}</div>
                <div className="font-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamComposition;

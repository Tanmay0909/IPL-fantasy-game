import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const UpcomingFixtures = () => {
  // Fetch upcoming fixtures
  const { data: fixtures, isLoading } = useQuery({
    queryKey: ['/api/fixtures/upcoming'],
    refetchOnWindowFocus: false
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    // Check if the date is tomorrow
    else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    // Otherwise show the date and time
    else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-primary px-4 py-3 text-white">
        <h2 className="font-roboto font-bold">Upcoming Matches</h2>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : fixtures && fixtures.length > 0 ? (
          <div className="space-y-4">
            {fixtures.map(fixture => (
              <div key={fixture.id} className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">{formatDate(fixture.startTime)}</div>
                  {fixture.status === 'live' && (
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Live</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-bold text-primary mr-1">{fixture.homeTeam}</span>
                    <span className="text-xs">vs</span>
                    <span className="font-bold text-primary ml-1">{fixture.awayTeam}</span>
                  </div>
                  <div className="text-xs text-gray-500">{fixture.venue}</div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="link" 
              className="w-full mt-4 text-primary hover:text-blue-700 text-sm font-medium"
            >
              View All Fixtures
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No upcoming fixtures available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingFixtures;

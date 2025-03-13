import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { type Fixture } from "@shared/schema";

const Fixtures = () => {
  const { data: fixtures, isLoading } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/upcoming'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-3">
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-10 w-20" />
              </div>
              <div className="text-center mt-2">
                <Skeleton className="h-3 w-40 mx-auto" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-6 w-32 mx-auto mt-4" />
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Upcoming Fixtures</h2>
        <div className="text-center py-6 text-gray-500">No upcoming fixtures</div>
      </div>
    );
  }

  // Team logos
  const teamLogos: Record<string, string> = {
    MI: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Medium/MI.png",
    CSK: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/logos/Medium/CSK.png",
    RCB: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Medium/RCB.png",
    KKR: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Medium/KKR.png",
    DC: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Medium/DC.png",
    PBKS: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Medium/PBKS.png",
    RR: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Medium/RR.png",
    SRH: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Medium/SRH.png",
    GT: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Medium/GT.png",
    LSG: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Medium/LSG.png",
  };

  const getMatchTimeDisplay = (matchTime: string) => {
    const date = new Date(matchTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeString = format(date, "h:mm a");

    if (isToday) {
      return `Today, ${timeString}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${timeString}`;
    } else {
      return format(date, "dd MMM, h:mm a");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-bold mb-3">Upcoming Fixtures</h2>
      <div className="space-y-3">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className="border-b pb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{getMatchTimeDisplay(fixture.matchTime.toString())}</span>
              <span>Match {fixture.matchNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={teamLogos[fixture.homeTeam] || ''}
                  alt={fixture.homeTeam}
                  className="w-10 h-10 mr-2"
                />
                <span className="font-medium">{fixture.homeTeam}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-sm font-bold">VS</span>
              </div>
              <div className="flex items-center justify-end">
                <span className="font-medium mr-2">{fixture.awayTeam}</span>
                <img
                  src={teamLogos[fixture.awayTeam] || ''}
                  alt={fixture.awayTeam}
                  className="w-10 h-10"
                />
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 mt-2">
              {fixture.venue}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-primary text-sm font-medium hover:underline">
        View all fixtures →
      </button>
    </div>
  );
};

export default Fixtures;

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type League, type User } from "@shared/schema";

interface MiniLeaguesProps {
  userId: number;
}

const MiniLeagues = ({ userId }: MiniLeaguesProps) => {
  const { data: leagues, isLoading } = useQuery<League[]>({
    queryKey: [`/api/users/${userId}/leagues`],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-6 w-32 mx-auto mt-4" />
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">My Mini Leagues</h2>
          <Button size="sm" variant="destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Join League
          </Button>
        </div>
        <div className="text-center py-6 text-gray-500">
          You haven't joined any leagues yet
        </div>
        <Button className="w-full mt-4" variant="link">
          Create your own league →
        </Button>
      </div>
    );
  }

  // Placeholder rankings since we don't have the actual user rankings in leagues yet
  const leagueRankings = [
    { id: leagues[0]?.id, rank: 3, color: "bg-primary" },
    { id: leagues[1]?.id, rank: 1, color: "bg-accent" },
    { id: leagues[2]?.id, rank: 12, color: "bg-gray-200" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">My Mini Leagues</h2>
        <Button size="sm" variant="destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Join League
        </Button>
      </div>

      <div className="space-y-3">
        {leagues.slice(0, 3).map((league, index) => {
          const ranking = leagueRankings.find((r) => r.id === league.id);
          return (
            <div key={league.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{league.name}</h3>
                  <p className="text-xs text-gray-600">
                    {index === 0 ? 21 : index === 1 ? 156 : 42} members
                  </p>
                </div>
                <div
                  className={`${
                    ranking?.color || "bg-gray-200"
                  } ${ranking?.rank === 1 ? "text-textColor" : "text-white"} text-xs px-2 py-1 rounded-full font-medium`}
                >
                  {ranking?.rank}
                  {index === 0 ? "rd" : index === 1 ? "st" : "th"}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your points:</span>
                <span className="font-medium">437</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {index === 1 ? "Runner-up:" : "Leader:"}
                </span>
                <span className="font-medium">
                  {index === 0
                    ? "Rahul - 512"
                    : index === 1
                    ? "Amit - 421"
                    : "Neha - 569"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Button className="w-full mt-4" variant="link">
        View all leagues →
      </Button>
    </div>
  );
};

export default MiniLeagues;

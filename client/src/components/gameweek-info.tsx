import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { type Gameweek } from "@shared/schema";

const GameweekInfo = () => {
  const { data: gameweek, isLoading } = useQuery<Gameweek>({
    queryKey: ['/api/gameweeks/current'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-3 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-6 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gameweek) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Gameweek {gameweek.number}</h2>
          <p className="text-sm text-gray-600">
            Deadline: <span className="font-semibold">{format(new Date(gameweek.deadline), "EEEE, dd MMM HH:mm")}</span>
          </p>
        </div>

        <div className="mt-3 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Transfers</p>
            <p className="font-bold text-xl">1 <span className="text-sm font-normal text-gray-500">free</span></p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-bold text-xl text-[#4CAF50]">₹3.5M</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Gameweek</p>
            <p className="font-bold text-xl">78 <span className="text-sm font-normal text-gray-500">pts</span></p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold text-xl">437 <span className="text-sm font-normal text-gray-500">pts</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameweekInfo;

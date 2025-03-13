import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type PowerUp } from "@shared/schema";

interface PowerUpsProps {
  userId: number;
}

const PowerUps = ({ userId }: PowerUpsProps) => {
  const { toast } = useToast();

  const { data: powerUps, isLoading } = useQuery<PowerUp>({
    queryKey: [`/api/users/${userId}/powerups`],
  });

  const usePowerUpMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      return apiRequest("POST", `/api/users/${userId}/powerups/${type}/use`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/powerups`] });
      toast({
        title: "Power-up activated",
        description: "Your power-up has been activated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to activate power-up",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleActivatePowerUp = (type: string) => {
    usePowerUpMutation.mutate({ type });
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!powerUps) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3">Power-ups</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">Wildcard</h4>
              <p className="text-sm opacity-90 mt-1">Make unlimited transfers for one gameweek</p>
            </div>
            <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded-full">
              {powerUps.wildcard ? "1 AVAILABLE" : "USED"}
            </span>
          </div>
          <Button
            variant="secondary"
            className="mt-4 bg-white hover:bg-gray-100 text-primary font-bold py-2 px-4 rounded-full text-sm transition w-full"
            disabled={!powerUps.wildcard || usePowerUpMutation.isPending}
            onClick={() => handleActivatePowerUp("wildcard")}
          >
            {powerUps.wildcard ? "Activate" : "Used"}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-secondary to-red-800 text-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">Triple Captain</h4>
              <p className="text-sm opacity-90 mt-1">Triple your captain's points for one gameweek</p>
            </div>
            <span className="bg-white text-secondary text-xs font-bold px-2 py-1 rounded-full">
              {powerUps.tripleCaption ? "1 AVAILABLE" : "USED"}
            </span>
          </div>
          <Button
            variant="secondary"
            className="mt-4 bg-white hover:bg-gray-100 text-secondary font-bold py-2 px-4 rounded-full text-sm transition w-full"
            disabled={!powerUps.tripleCaption || usePowerUpMutation.isPending}
            onClick={() => handleActivatePowerUp("tripleCaption")}
          >
            {powerUps.tripleCaption ? "Activate" : "Used"}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">Bench Boost</h4>
              <p className="text-sm opacity-90 mt-1">Score points from your bench players</p>
            </div>
            <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {powerUps.benchBoost ? "1 AVAILABLE" : "USED"}
            </span>
          </div>
          <Button
            variant="secondary"
            className={`mt-4 bg-white hover:bg-gray-100 text-gray-500 font-bold py-2 px-4 rounded-full text-sm transition w-full ${
              !powerUps.benchBoost ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!powerUps.benchBoost || usePowerUpMutation.isPending}
            onClick={() => handleActivatePowerUp("benchBoost")}
          >
            {powerUps.benchBoost ? "Activate" : "Used"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PowerUps;

import { PowerUp, UserPowerUp } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface PowerUpCardProps {
  userPowerUp: UserPowerUp & { powerUp: PowerUp };
  gameweekId: number;
}

const PowerUpCard = ({ userPowerUp, gameweekId }: PowerUpCardProps) => {
  const queryClient = useQueryClient();

  const usePowerUpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(
        "POST",
        `/api/power-ups/use/${userPowerUp.id}`,
        { gameweekId }
      );
    },
    onSuccess: () => {
      toast({
        title: "Power-up activated",
        description: `${userPowerUp.powerUp.name} has been activated for this gameweek.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/power-ups/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Could not use power-up: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div 
      className={`border rounded-lg p-4 relative ${
        userPowerUp.isUsed 
          ? "border-gray-200 bg-gray-50" 
          : "border-[#FFD700] bg-[#FFD700] bg-opacity-5"
      }`}
    >
      <div className="absolute top-2 right-2 text-xs bg-gray-200 rounded-full px-2 py-0.5">
        {userPowerUp.isUsed ? (
          <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Used</span>
        ) : (
          <span>Available</span>
        )}
      </div>
      <h4 className={`font-roboto font-medium text-lg ${userPowerUp.isUsed ? "text-gray-400" : "text-[#004BA0]"}`}>
        {userPowerUp.powerUp.name}
      </h4>
      <p className={`text-sm mt-1 ${userPowerUp.isUsed ? "text-gray-500" : "text-gray-600"}`}>
        {userPowerUp.powerUp.description}
      </p>
      {userPowerUp.isUsed ? (
        <button disabled className="mt-3 bg-gray-300 text-gray-500 py-2 px-4 rounded text-sm cursor-not-allowed">
          Used in GW{userPowerUp.usedInGameweek}
        </button>
      ) : (
        <button 
          className="mt-3 bg-[#004BA0] text-white py-2 px-4 rounded text-sm hover:bg-opacity-90 transition-colors duration-200"
          onClick={() => usePowerUpMutation.mutate()}
          disabled={usePowerUpMutation.isPending}
        >
          {usePowerUpMutation.isPending ? "Activating..." : "Use Now"}
        </button>
      )}
    </div>
  );
};

export default PowerUpCard;

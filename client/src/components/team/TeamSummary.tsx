import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const TeamSummary = () => {
  const [teamName, setTeamName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch user team information
  const { data: team, isLoading } = useQuery({
    queryKey: ['/api/user-team'],
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.name) {
        setTeamName(data.name);
      }
    }
  });

  const updateTeamName = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Team name is required",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await apiRequest('PATCH', '/api/user-team/name', { name: teamName });
      queryClient.invalidateQueries({ queryKey: ['/api/user-team'] });
      toast({
        title: "Team name updated",
        description: `Your team is now called "${teamName}"`
      });
    } catch (error) {
      toast({
        title: "Failed to update team name",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-md overflow-hidden">
        <CardHeader className="bg-primary px-4 py-3 text-white">
          <h2 className="font-roboto font-bold">Team Summary</h2>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const usedBudget = team?.usedBudget || 0;
  const totalBudget = team?.totalBudget || 100;
  const budgetPercentage = (usedBudget / totalBudget) * 100;

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-primary px-4 py-3 text-white">
        <h2 className="font-roboto font-bold">Team Summary</h2>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Team Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <div className="flex">
            <Input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)}
              className="flex-grow"
            />
            <Button 
              className="ml-2 bg-primary hover:bg-blue-700" 
              onClick={updateTeamName}
              disabled={isUpdating}
            >
              Save
            </Button>
          </div>
        </div>
        
        {/* Budget */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Budget</span>
            <span className="text-sm font-bold text-primary">{usedBudget} Cr / {totalBudget} Cr</span>
          </div>
          <div className="budget-indicator">
            <div className="budget-progress" style={{ width: `${budgetPercentage}%` }}></div>
          </div>
        </div>
        
        {/* Transfers */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Transfers Remaining</span>
            <span className="text-sm font-bold text-primary">{team?.transfersRemaining || 0}</span>
          </div>
        </div>
        
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-500">Total Points</div>
            <div className="text-xl font-bold text-primary">{team?.points || 0}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-500">Global Rank</div>
            <div className="text-xl font-bold text-secondary">#{team?.rank || 0}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-500">Last Week</div>
            <div className="text-xl font-bold text-primary">{team?.lastWeekPoints || 0} pts</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-500">Average</div>
            <div className="text-xl font-bold text-primary">{team?.averagePoints || 0} pts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSummary;

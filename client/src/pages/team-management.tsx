import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import TeamView from "@/components/team-view";
import TeamStats from "@/components/team-stats";
import PowerUps from "@/components/power-ups";
import PlayerSelection from "@/components/player-selection";
import GameweekInfo from "@/components/gameweek-info";
import Fixtures from "@/components/fixtures";
import MiniLeagues from "@/components/mini-leagues";
import { type Team } from "@shared/schema";

const TeamManagement = () => {
  const { toast } = useToast();
  // Mock user ID for demo purposes
  const userId = 1;

  const { data: team, isLoading: isLoadingTeam } = useQuery<Team>({
    queryKey: [`/api/users/${userId}/team`],
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamName: string) => {
      return apiRequest("POST", "/api/teams", {
        userId,
        name: teamName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/team`] });
      toast({
        title: "Team created",
        description: "Your team has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveTeamMutation = useMutation({
    mutationFn: async () => {
      if (!team) return null;
      return apiRequest("PATCH", `/api/teams/${team.id}`, {
        // Any team updates if needed
      });
    },
    onSuccess: () => {
      toast({
        title: "Team saved",
        description: "Your team has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTeam = () => {
    createTeamMutation.mutate("Mumbai Mavericks");
  };

  const handleSaveTeam = () => {
    saveTeamMutation.mutate();
  };

  return (
    <div>
      <GameweekInfo />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {team ? `My Team: ${team.name}` : "Create Your Team"}
              </h2>
              <div className="flex space-x-2">
                {team ? (
                  <>
                    <Button 
                      onClick={handleSaveTeam} 
                      disabled={saveTeamMutation.isPending}
                    >
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
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save Team
                    </Button>
                    <Button variant="outline">
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleCreateTeam} 
                    disabled={createTeamMutation.isPending}
                  >
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
                    Create Team
                  </Button>
                )}
              </div>
            </div>

            {team ? (
              <>
                <TeamView userId={userId} />
                <TeamStats userId={userId} />
                <PowerUps userId={userId} />
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Create Your Dream Team</h3>
                <p className="text-gray-600 mb-6">
                  Build a team of 11 players within a budget of ₹100M. Choose
                  batsmen, bowlers, all-rounders, and a wicket-keeper.
                </p>
                <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
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
                  Create Team Now
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/3">
          <PlayerSelection userId={userId} />
          <Fixtures />
          <MiniLeagues userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;

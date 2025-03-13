import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Gameweek, UserTeam } from "@shared/schema";

type GameweekInfoProps = {
  userTeam?: UserTeam;
};

const GameweekInfo = ({ userTeam }: GameweekInfoProps) => {
  const { data: currentGameweek } = useQuery<Gameweek>({
    queryKey: ["/api/gameweeks/current"],
  });

  const formatDeadline = (date: Date) => {
    return format(new Date(date), "EEE d MMM, HH:mm");
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between">
        <div className="md:flex items-center space-x-2 mb-2 md:mb-0">
          <span className="font-roboto font-medium text-lg">{currentGameweek?.name || "Gameweek"}</span>
          <div className="hidden md:block h-5 border-r border-gray-300 mx-2"></div>
          <span className="text-sm">
            Deadline:{" "}
            <span className="font-semibold">
              {currentGameweek?.deadline 
                ? formatDeadline(currentGameweek.deadline) + " IST"
                : "Loading..."}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <span className="block text-sm text-gray-500">Points</span>
            <span className="font-bold text-[#004BA0]">{userTeam?.totalPoints || 0}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">Budget</span>
            <span className="font-bold text-[#004BA0]">
              ₹{userTeam ? (userTeam.budget / 10).toFixed(1) : 0}m
            </span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">Transfers</span>
            <span className="font-bold text-[#004BA0]">{userTeam?.remainingTransfers || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameweekInfo;

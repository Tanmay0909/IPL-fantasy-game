import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerWithRole, PlayerTypeRules } from '@/types/player';
import { ArrowDownToLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BenchPlayers from './BenchPlayers';

interface TeamFormationProps {
  userId: number;
}

const TeamFormation = ({ userId }: TeamFormationProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userTeam } = useQuery<{ id: number; name: string }>({
    queryKey: ['/api/user-team'],
  });

  const { data: players, isLoading } = useQuery<PlayerWithRole[]>({
    queryKey: ['/api/user-team/players'],
    enabled: !!userTeam,
  });

  const handleMovePlayerToBench = async (player: PlayerWithRole, benchPosition: number) => {
    if (!userTeam) return;

    try {
      // Check if we can move this player to bench based on team composition rules
      const startingPlayers = players?.filter(p => p.isStarting && p.id !== player.id) || [];
      const startingByType = {
        'wicket-keeper': startingPlayers.filter(p => p.type === 'wicket-keeper').length,
        'batsman': startingPlayers.filter(p => p.type === 'batsman').length,
        'bowler': startingPlayers.filter(p => p.type === 'bowler').length,
        'all-rounder': startingPlayers.filter(p => p.type === 'all-rounder').length,
      };

      // Check minimum requirements
      const playerType = player.type as keyof typeof PlayerTypeRules;
      const minRequired = PlayerTypeRules[playerType].min;

      if (startingByType[playerType] < minRequired) {
        toast({
          title: 'Error',
          description: `You need at least ${minRequired} ${playerType}(s) in your starting XI`,
          variant: 'destructive',
        });
        return;
      }

      await apiRequest(
        'PATCH',
        `/api/user-team/players/${player.id}/starting`,
        {
          isStarting: false,
          benchPosition
        }
      );

      // Invalidate team players cache
      queryClient.invalidateQueries({ queryKey: ['/api/user-team/players'] });

      toast({
        title: 'Success',
        description: 'Player moved to bench',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move player to bench',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading team formation...</div>;
  }

  if (!players || players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Formation</CardTitle>
          <CardDescription>You haven't selected any players yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filter and organize players
  const startingPlayers = players.filter(player => player.isStarting !== false);
  const benchPlayers = players.filter(player => player.isStarting === false);

  // Organize starting players by position
  const wicketkeepers = startingPlayers.filter(player => player.type === 'wicket-keeper');
  const batsmen = startingPlayers.filter(player => player.type === 'batsman');
  const bowlers = startingPlayers.filter(player => player.type === 'bowler');
  const allrounders = startingPlayers.filter(player => player.type === 'all-rounder');

  // Count bench positions used
  const usedBenchPositions = new Set(benchPlayers.map(p => p.benchPosition));
  
  // Find first available bench position
  const getNextAvailableBenchPosition = () => {
    for (let i = 1; i <= 4; i++) {
      if (!usedBenchPositions.has(i)) {
        return i;
      }
    }
    return 1; // Default to 1 if somehow all positions are taken
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Starting XI</CardTitle>
          <CardDescription>
            Select your starting 11 players. Your team must include 1 wicket-keeper, 
            3-5 batsmen, 3-5 bowlers, and 1-3 all-rounders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Wicket-keepers */}
            <div>
              <h3 className="text-md font-semibold mb-2">Wicket-keeper ({wicketkeepers.length}/1)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {wicketkeepers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onBench={() => handleMovePlayerToBench(player, getNextAvailableBenchPosition())} 
                  />
                ))}
              </div>
            </div>

            {/* Batsmen */}
            <div>
              <h3 className="text-md font-semibold mb-2">Batsmen ({batsmen.length}/{PlayerTypeRules.batsman.max})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {batsmen.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onBench={() => handleMovePlayerToBench(player, getNextAvailableBenchPosition())}
                  />
                ))}
              </div>
            </div>

            {/* Bowlers */}
            <div>
              <h3 className="text-md font-semibold mb-2">Bowlers ({bowlers.length}/{PlayerTypeRules.bowler.max})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {bowlers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onBench={() => handleMovePlayerToBench(player, getNextAvailableBenchPosition())}
                  />
                ))}
              </div>
            </div>

            {/* All-rounders */}
            <div>
              <h3 className="text-md font-semibold mb-2">All-rounders ({allrounders.length}/{PlayerTypeRules['all-rounder'].max})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {allrounders.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onBench={() => handleMovePlayerToBench(player, getNextAvailableBenchPosition())}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bench players */}
      {userTeam && <BenchPlayers userTeamId={userTeam.id} benchPlayers={benchPlayers} />}
    </div>
  );
};

// Helper component for displaying a player card
interface PlayerCardProps {
  player: PlayerWithRole;
  onBench: () => void;
}

const PlayerCard = ({ player, onBench }: PlayerCardProps) => {
  const isCaptain = player.role === 'captain';
  const isViceCaptain = player.role === 'vice-captain';

  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center space-x-2">
        <div className={`
          ${player.type === 'wicket-keeper' ? 'bg-purple-100 text-purple-700' : 
            player.type === 'batsman' ? 'bg-blue-100 text-blue-700' : 
            player.type === 'bowler' ? 'bg-red-100 text-red-700' : 
            'bg-green-100 text-green-700'} 
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
        `}>
          {isCaptain ? 'C' : isViceCaptain ? 'VC' : player.type.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-xs text-gray-500">{player.team}</div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBench}
        className="flex items-center gap-1"
      >
        <ArrowDownToLine size={16} />
        <span className="hidden sm:inline">Bench</span>
      </Button>
    </div>
  );
};

export default TeamFormation;
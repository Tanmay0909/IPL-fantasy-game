import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
interface PlayerWithRole {
  id: number;
  name: string;
  team: string;
  type: string;
  price: number;
  image: string | null;
  stats: any;
  role?: string | null;
  isStarting?: boolean;
  benchPosition?: number;
}
import { ArrowUpFromLine } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BenchPlayersProps {
  userTeamId: number;
  benchPlayers: PlayerWithRole[];
}

const BenchPlayers = ({ userTeamId, benchPlayers }: BenchPlayersProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Sort bench players by position
  const sortedBenchPlayers = [...benchPlayers].sort((a, b) => 
    (a.benchPosition || 0) - (b.benchPosition || 0)
  );

  const handleMoveToStarting = async (playerId: number) => {
    try {
      await apiRequest(
        'PATCH',
        `/api/user-team/players/${playerId}/starting`,
        {
          isStarting: true,
          benchPosition: 0
        }
      );
      
      // Invalidate team players cache
      queryClient.invalidateQueries({ queryKey: ['/api/user-team/players'] });
      
      toast({
        title: 'Success',
        description: 'Player moved to starting XI',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move player to starting XI',
        variant: 'destructive',
      });
    }
  };

  const getPlayerTypeColor = (type: string) => {
    switch (type) {
      case 'wicket-keeper':
        return 'bg-purple-100 text-purple-700';
      case 'batsman':
        return 'bg-blue-100 text-blue-700';
      case 'bowler':
        return 'bg-red-100 text-red-700';
      case 'all-rounder':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Bench Players</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBenchPlayers.length === 0 ? (
          <p className="text-center text-gray-500">No bench players</p>
        ) : (
          <div className="space-y-2">
            {sortedBenchPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <div className={`${getPlayerTypeColor(player.type)} p-1 rounded-md text-xs font-medium w-8 h-8 flex items-center justify-center`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.team} • {player.type}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleMoveToStarting(player.id)}
                  className="flex items-center gap-1"
                >
                  <ArrowUpFromLine size={16} />
                  <span className="hidden sm:inline">Move Up</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BenchPlayers;
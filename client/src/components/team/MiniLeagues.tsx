import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const MiniLeagues = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [leagueCode, setLeagueCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  // Fetch user leagues
  const { data: leagues, isLoading } = useQuery({
    queryKey: ['/api/leagues/user'],
    refetchOnWindowFocus: false
  });

  const joinLeague = async () => {
    if (!leagueCode.trim()) {
      toast({
        title: "League code is required",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      await apiRequest('POST', '/api/leagues/join', { code: leagueCode });
      queryClient.invalidateQueries({ queryKey: ['/api/leagues/user'] });
      toast({
        title: "League joined",
        description: "You have successfully joined the league"
      });
      setIsOpen(false);
      setLeagueCode("");
    } catch (error) {
      toast({
        title: "Failed to join league",
        description: error instanceof Error ? error.message : "Invalid league code",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-primary px-4 py-3 text-white flex justify-between items-center">
        <h2 className="font-roboto font-bold">My Leagues</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-secondary hover:bg-red-600 text-white text-xs">
              + Join League
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a League</DialogTitle>
              <DialogDescription>
                Enter the league code to join an existing league
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Enter league code"
              value={leagueCode}
              onChange={(e) => setLeagueCode(e.target.value)}
            />
            <DialogFooter>
              <Button 
                onClick={joinLeague} 
                disabled={isJoining}
                className="bg-primary"
              >
                Join League
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : leagues && leagues.length > 0 ? (
          <div className="space-y-3">
            {leagues.map(league => (
              <div key={league.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{league.name}</div>
                  <div className="text-xs text-gray-500">{league.memberCount} members</div>
                </div>
                <div className="text-sm font-bold text-primary">#{league.userRank}</div>
              </div>
            ))}
            {leagues.length > 3 && (
              <Button 
                variant="link" 
                className="w-full mt-4 text-primary hover:text-blue-700 text-sm font-medium"
              >
                View All Leagues
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">You haven't joined any leagues yet</p>
            <Button 
              size="sm" 
              onClick={() => setIsOpen(true)}
              className="bg-primary"
            >
              Join a League
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniLeagues;

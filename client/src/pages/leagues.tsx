import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GameweekInfo from "@/components/ui/gameweek-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { League, LeagueMember, UserTeam } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Trophy, Users, Plus } from "lucide-react";

interface CurrentUserData {
  user: {
    id: number;
    username: string;
    email: string;
    totalPoints: number;
  };
  userTeam: UserTeam;
  leagues: (League & { members: (LeagueMember & { userTeam: UserTeam })[] })[];
}

// Create league form schema
const createLeagueSchema = z.object({
  name: z.string().min(3, { message: "League name must be at least 3 characters long" }).max(50),
  code: z.string().min(5, { message: "League code must be at least 5 characters long" }).max(20),
});

// Join league form schema
const joinLeagueSchema = z.object({
  leagueCode: z.string().min(5, { message: "League code must be at least 5 characters long" }).max(20),
});

const Leagues = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { data, isLoading } = useQuery<CurrentUserData>({
    queryKey: ["/api/current-user"],
  });

  // Create league form
  const createLeagueForm = useForm<z.infer<typeof createLeagueSchema>>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  // Join league form
  const joinLeagueForm = useForm<z.infer<typeof joinLeagueSchema>>({
    resolver: zodResolver(joinLeagueSchema),
    defaultValues: {
      leagueCode: "",
    },
  });

  // Create league mutation
  const createLeagueMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createLeagueSchema>) => {
      if (!data?.user) return;
      
      await apiRequest("POST", "/api/leagues", {
        ...values,
        creatorId: data.user.id,
        isGlobal: false,
      });
    },
    onSuccess: () => {
      toast({
        title: "League created",
        description: "Your league has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
      createLeagueForm.reset();
      setCreateOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Could not create league: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Join league mutation
  const joinLeagueMutation = useMutation({
    mutationFn: async (values: z.infer<typeof joinLeagueSchema>) => {
      if (!data?.userTeam) return;
      
      await apiRequest("POST", "/api/leagues/join", {
        leagueCode: values.leagueCode,
        userTeamId: data.userTeam.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "League joined",
        description: "You have successfully joined the league.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
      joinLeagueForm.reset();
      setJoinOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Could not join league: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create league form submission
  const onCreateSubmit = (values: z.infer<typeof createLeagueSchema>) => {
    createLeagueMutation.mutate(values);
  };

  // Handle join league form submission
  const onJoinSubmit = (values: z.infer<typeof joinLeagueSchema>) => {
    joinLeagueMutation.mutate(values);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!data) {
    return <div className="container mx-auto px-4 py-8">Error loading data</div>;
  }

  return (
    <>
      <GameweekInfo userTeam={data.userTeam} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-roboto">My Leagues</h1>
          <div className="flex space-x-4">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#004BA0]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create League
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new league</DialogTitle>
                  <DialogDescription>
                    Create your own league and invite friends to compete.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createLeagueForm}>
                  <form onSubmit={createLeagueForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createLeagueForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter league name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createLeagueForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter unique league code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="bg-[#004BA0]" disabled={createLeagueMutation.isPending}>
                        {createLeagueMutation.isPending ? "Creating..." : "Create League"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join League
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a league</DialogTitle>
                  <DialogDescription>
                    Enter a league code to join an existing league.
                  </DialogDescription>
                </DialogHeader>
                <Form {...joinLeagueForm}>
                  <form onSubmit={joinLeagueForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                    <FormField
                      control={joinLeagueForm.control}
                      name="leagueCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter league code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="bg-[#004BA0]" disabled={joinLeagueMutation.isPending}>
                        {joinLeagueMutation.isPending ? "Joining..." : "Join League"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {data.leagues.map((league) => (
            <Card key={league.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    {league.isGlobal ? (
                      <Trophy className="h-5 w-5 mr-2 text-[#FFD700]" />
                    ) : (
                      <Users className="h-5 w-5 mr-2 text-[#004BA0]" />
                    )}
                    {league.name}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {league.isGlobal ? "Global League" : `League Code: ${league.code}`}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Rank</th>
                        <th className="text-left pb-2">Team</th>
                        <th className="text-left pb-2">Manager</th>
                        <th className="text-right pb-2">GW</th>
                        <th className="text-right pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sort members by total points */}
                      {[...league.members]
                        .sort((a, b) => b.userTeam.totalPoints - a.userTeam.totalPoints)
                        .map((member, index) => {
                          const isUserTeam = member.userTeam.id === data.userTeam.id;
                          
                          return (
                            <tr 
                              key={member.id} 
                              className={`
                                border-b 
                                ${isUserTeam ? "bg-[#004BA0] bg-opacity-5" : ""}
                              `}
                            >
                              <td className="py-3">{index + 1}</td>
                              <td className="py-3 font-medium">{member.userTeam.name}</td>
                              <td className="py-3">
                                {/* Normally we'd show the username of the team owner here */}
                                {isUserTeam ? "You" : `Manager ${index + 1}`}
                              </td>
                              <td className="py-3 text-right">
                                {/* This would show the gameweek points, using placeholder */}
                                {isUserTeam ? 87 : 50 + Math.floor(Math.random() * 40)}
                              </td>
                              <td className="py-3 text-right font-bold">
                                {member.userTeam.totalPoints}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {data.leagues.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No leagues yet</h3>
                <p className="text-gray-500 mb-6 text-center">
                  You haven't joined any leagues yet. Create your own or join an existing one.
                </p>
                <div className="flex space-x-4">
                  <Button className="bg-[#004BA0]" onClick={() => setCreateOpen(true)}>
                    Create League
                  </Button>
                  <Button variant="outline" onClick={() => setJoinOpen(true)}>
                    Join League
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Leagues;

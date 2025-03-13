import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import TeamFormation from '@/components/team/TeamFormation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const TeamManagement = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>
              Please log in to manage your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/my-team">
          <Button variant="ghost" className="pl-0 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Team
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-gray-500">Manage your starting XI and bench players</p>
      </div>
      
      <div className="mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Rules</CardTitle>
            <CardDescription>
              Your starting XI must follow these composition rules:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>1 Wicket-keeper</li>
              <li>3-5 Batsmen</li>
              <li>3-5 Bowlers</li>
              <li>1-3 All-rounders</li>
              <li>Total of 11 players in starting XI</li>
              <li>Up to 4 players on bench</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      {user && <TeamFormation userId={user.id} />}
    </div>
  );
};

export default TeamManagement;
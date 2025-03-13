import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameStatusBar from "@/components/layout/GameStatusBar";
import TeamFormation from "@/components/team/TeamFormation";
import PlayerSelection from "@/components/team/PlayerSelection";
import TeamSummary from "@/components/team/TeamSummary";
import TeamComposition from "@/components/team/TeamComposition";
import MiniLeagues from "@/components/team/MiniLeagues";
import UpcomingFixtures from "@/components/team/UpcomingFixtures";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

const MyTeam = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("my-team");

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user && !isLoading) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <GameStatusBar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Selection & Summary Section */}
          <div className="w-full md:w-8/12 space-y-6">
            {/* Tabs */}
            <div className="flex border-b">
              <button 
                className={`px-4 py-2 ${activeTab === "my-team" ? "tab-active" : "text-gray-500 hover:text-textDark"}`}
                onClick={() => setActiveTab("my-team")}
              >
                My Team
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === "transfers" ? "tab-active" : "text-gray-500 hover:text-textDark"}`}
                onClick={() => setActiveTab("transfers")}
              >
                Transfers
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === "points" ? "tab-active" : "text-gray-500 hover:text-textDark"}`}
                onClick={() => setActiveTab("points")}
              >
                Points
              </button>
            </div>

            {/* Team Management Link */}
            <div className="flex justify-end mb-2">
              <Link href="/team-management">
                <Button size="sm" className="flex items-center gap-1">
                  <UsersRound size={16} />
                  Manage Squad
                </Button>
              </Link>
            </div>

            {/* Team Pitch Visualization */}
            {user && <TeamFormation userId={user.id} />}

            {/* Player Selection */}
            {user && <PlayerSelection userId={user.id} />}
          </div>

          {/* Team Info & Stats */}
          <div className="w-full md:w-4/12 space-y-6">
            {/* Budget & Points */}
            {user && <TeamSummary />}
            
            {/* Team Composition */}
            {user && <TeamComposition />}
            
            {/* Mini-Leagues */}
            {user && <MiniLeagues userId={user.id} />}
            
            {/* Upcoming Fixtures */}
            <UpcomingFixtures />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyTeam;

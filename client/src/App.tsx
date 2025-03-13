import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyTeam from "@/pages/MyTeam";
import Leagues from "@/pages/Leagues";
import Fixtures from "@/pages/Fixtures";
import Login from "@/pages/Login";
import TeamManagement from "@/pages/TeamManagement";
import { AuthProvider } from "./context/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-team" component={MyTeam} />
      <Route path="/team-management" component={TeamManagement} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/fixtures" component={Fixtures} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

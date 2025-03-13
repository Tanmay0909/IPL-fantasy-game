import { Clock, InfoIcon } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const GameStatusBar = () => {
  const { data: nextMatch } = useQuery({
    queryKey: ['/api/fixtures/next'],
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <Clock className="h-4 w-4 text-primary mr-1" />
              <span className="text-sm font-medium">
                Deadline: <span className="text-secondary">
                  {nextMatch?.deadline || "Loading..."}
                </span>
              </span>
            </div>
            <div className="text-sm">
              Next Match: <span className="font-medium">
                {nextMatch ? `${nextMatch.home} vs ${nextMatch.away}` : "Loading..."}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" className="bg-secondary hover:bg-red-600">
                    Wildcard
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset your team with unlimited transfers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="bg-accent hover:bg-yellow-400 text-textDark">
                    Power Play
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Triple captain points for next match</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatusBar;

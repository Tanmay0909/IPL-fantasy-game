import { Link, useLocation } from "wouter";
import { Home, BarChart2, Users, RotateCw, User } from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === "/" ? "text-[#004BA0]" : "text-gray-500"}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </a>
        </Link>
        <Link href="/points">
          <a className={`flex flex-col items-center ${location === "/points" ? "text-[#004BA0]" : "text-gray-500"}`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs">Points</span>
          </a>
        </Link>
        <Link href="/team">
          <a className={`flex flex-col items-center ${location === "/team" ? "text-[#004BA0]" : "text-gray-500"}`}>
            <User className="h-6 w-6" />
            <span className="text-xs">Team</span>
          </a>
        </Link>
        <Link href="/transfers">
          <a className={`flex flex-col items-center ${location === "/transfers" ? "text-[#004BA0]" : "text-gray-500"}`}>
            <RotateCw className="h-6 w-6" />
            <span className="text-xs">Transfers</span>
          </a>
        </Link>
        <Link href="/leagues">
          <a className={`flex flex-col items-center ${location === "/leagues" ? "text-[#004BA0]" : "text-gray-500"}`}>
            <Users className="h-6 w-6" />
            <span className="text-xs">Leagues</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;

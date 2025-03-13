import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-2xl font-bold">Fantasy IPL</a>
          </Link>
          <span className="ml-2 bg-accent text-textColor text-xs px-2 py-1 rounded-full font-bold">
            BETA
          </span>
        </div>
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/">
            <a className={cn("text-white hover:text-accent font-medium", location === "/" && "text-accent")}>
              Home
            </a>
          </Link>
          <Link href="/team">
            <a className={cn("text-white hover:text-accent font-medium", location === "/team" && "text-accent")}>
              My Team
            </a>
          </Link>
          <Link href="/leagues">
            <a className={cn("text-white hover:text-accent font-medium", location === "/leagues" && "text-accent")}>
              Leagues
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className={cn("text-white hover:text-accent font-medium", location === "/leaderboard" && "text-accent")}>
              Leaderboard
            </a>
          </Link>
          <Link href="/rules">
            <a className={cn("text-white hover:text-accent font-medium", location === "/rules" && "text-accent")}>
              Rules
            </a>
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="hidden md:block bg-accent hover:bg-yellow-400 text-textColor font-bold py-1 px-4 rounded-full transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Premium
          </button>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-accent flex items-center justify-center text-white font-bold text-sm">
              US
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

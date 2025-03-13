import { Link } from "wouter";
import { Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-[#004BA0] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <h1 className="text-xl md:text-2xl font-bold font-roboto">IPL Fantasy</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="hover:text-[#FFD700] transition-colors duration-200">My Team</a>
          </Link>
          <Link href="/transfers">
            <a className="hover:text-[#FFD700] transition-colors duration-200">Transfers</a>
          </Link>
          <Link href="/points">
            <a className="hover:text-[#FFD700] transition-colors duration-200">Points</a>
          </Link>
          <Link href="/leagues">
            <a className="hover:text-[#FFD700] transition-colors duration-200">Leagues</a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-[#FF1744] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="h-8 w-8 rounded-full bg-[#FFD700] text-[#004BA0] flex items-center justify-center font-bold">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, points } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "My Team", path: "/my-team" },
    { name: "Leagues", path: "/leagues" },
    { name: "Fixtures", path: "/fixtures" },
    { name: "Stats", path: "/stats" },
  ];

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Trophy className="h-8 w-8 mr-2" />
          <h1 className="text-xl md:text-2xl font-bold">Fantasy IPL</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`hover:text-accent transition duration-200 ${location === link.path ? 'text-accent' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <span className="hidden md:inline-block px-3 py-1 bg-accent text-textDark rounded-full font-medium text-sm">
                {points} pts
              </span>
              <div className="relative">
                <img 
                  src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + user.username} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
              </div>
            </>
          ) : (
            <Link href="/login" className="bg-accent text-textDark px-3 py-1 rounded-full text-sm font-medium">
              Login
            </Link>
          )}
          <button className="md:hidden focus:outline-none" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-primary z-50 md:hidden pt-20 px-4 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button className="absolute top-4 right-4 text-white focus:outline-none" onClick={closeMobileMenu}>
          <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col space-y-4 text-white text-lg">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`py-2 hover:bg-blue-900 px-3 rounded ${location === link.path ? 'bg-blue-900' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <div className="py-2 px-3">
              <span className="inline-block px-3 py-1 bg-accent text-textDark rounded-full font-medium">
                {points} pts
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from "wouter";
import { Trophy } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-bold">Fantasy IPL</h2>
            </div>
            <p className="mt-2 text-sm opacity-80">The ultimate fantasy cricket experience for IPL fans.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Quick Links</h3>
              <ul className="space-y-1 text-sm opacity-80">
                <li><Link href="/" className="hover:text-accent">Home</Link></li>
                <li><Link href="/my-team" className="hover:text-accent">My Team</Link></li>
                <li><Link href="/leagues" className="hover:text-accent">Leagues</Link></li>
                <li><Link href="/fixtures" className="hover:text-accent">Fixtures</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Resources</h3>
              <ul className="space-y-1 text-sm opacity-80">
                <li><Link href="/rules" className="hover:text-accent">Rules</Link></li>
                <li><Link href="/faq" className="hover:text-accent">FAQs</Link></li>
                <li><Link href="/points-system" className="hover:text-accent">Points System</Link></li>
                <li><Link href="/player-stats" className="hover:text-accent">Player Stats</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Connect</h3>
              <ul className="space-y-1 text-sm opacity-80">
                <li><Link href="/contact" className="hover:text-accent">Contact Us</Link></li>
                <li><a href="#" className="hover:text-accent">Twitter</a></li>
                <li><a href="#" className="hover:text-accent">Facebook</a></li>
                <li><a href="#" className="hover:text-accent">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-blue-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm opacity-80">© {currentYear} Fantasy IPL. All rights reserved.</div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy" className="text-sm opacity-80 hover:opacity-100">Privacy Policy</Link>
            <Link href="/terms" className="text-sm opacity-80 hover:opacity-100">Terms of Service</Link>
            <Link href="/cookies" className="text-sm opacity-80 hover:opacity-100">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

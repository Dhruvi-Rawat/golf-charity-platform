import { Link } from "react-router-dom";
import { Trophy, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Trophy className="h-5 w-5 text-primary" />
              GolfCharity
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              Play golf. Win prizes. Change lives.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
              <Link to="/charities" className="hover:text-primary transition-colors">Charities</Link>
              <Link to="/subscribe" className="hover:text-primary transition-colors">Subscribe</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Account</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-primary transition-colors">Create Account</Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Made with</h4>
            <p className="flex items-center gap-1 text-sm text-secondary-foreground/70">
              <Heart className="h-4 w-4 text-primary" /> for charity
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-secondary-foreground/10 pt-6 text-center text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} GolfCharity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-surface-variant">
      {/* Navigation */}
      <nav className="w-full border-b border-border glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-2 px-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/tiqoraLogo1.png" 
              alt="Tiqora Logo" 
              width={40} 
              height={40}
              className="w-10 h-10 rounded-lg shadow-theme-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher variant="expanded" />
            
          </div>
        </div>
      </nav>

      {/* Hero Section with Authentication */}
      <section id="auth">
        <Hero />
      </section>


     

      {/* Trust Section
      <section className="py-20 px-6 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-12">
            Trusted by Leading Healthcare Institutions Worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="text-muted-foreground font-bold text-lg tracking-wide">GENERAL HOSPITAL</div>
            <div className="text-muted-foreground font-bold text-lg tracking-wide">MEDICAL CENTER</div>
            <div className="text-muted-foreground font-bold text-lg tracking-wide">HEALTH SYSTEM</div>
            <div className="text-muted-foreground font-bold text-lg tracking-wide">CLINIC GROUP</div>
          </div>
        </div>
      </section> */}

      {/* Stats Section
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover mb-4 group-hover:scale-110 transition-transform">
                50K+
              </div>
              <div className="text-xl font-semibold text-foreground">Appointments Managed</div>
              <div className="text-muted-foreground mt-2">Every month</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-success-hover mb-4 group-hover:scale-110 transition-transform">
                1,200+
              </div>
              <div className="text-xl font-semibold text-foreground">Active Doctors</div>
              <div className="text-muted-foreground mt-2">Across all facilities</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover mb-4 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="text-xl font-semibold text-foreground">System Uptime</div>
              <div className="text-muted-foreground mt-2">Always available</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer
      <footer className="bg-background/95 backdrop-blur-sm text-foreground py-16 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Image 
                  src="/tiqoraLogo1.png" 
                  alt="Tiqora Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10 rounded-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Tiqora
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Empowering healthcare providers with cutting-edge technology for better patient care and operational efficiency.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-foreground">Product</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#auth" className="hover:text-foreground transition-colors">Get Started</a></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Analytics</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-foreground">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Help Center</span></li>
                <li><a href="#auth" className="hover:text-foreground transition-colors">Login</a></li>
                <li><a href="#auth" className="hover:text-foreground transition-colors">Sign Up</a></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Account</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Tiqora. All rights reserved. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer> */}
      
    </div>
  );
}

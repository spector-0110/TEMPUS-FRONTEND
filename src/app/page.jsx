import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";


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
      
    </div>
  );
}

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="w-full border-b border-white/20 bg-white/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/tiqoraLogo1.png" 
              alt="Tiqora Logo" 
              width={40} 
              height={40}
              className="w-10 h-10 rounded-lg shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <a 
              href="#features" 
              className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Features
            </a>
            <a 
              href="#auth" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Authentication */}
      <section id="auth">
        <Hero />
      </section>

      {/* Scroll Indicator */}
      <div className="flex justify-center pb-8">
        <a 
          href="#features"
          className="group flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium mb-2">Discover More</span>
          <ChevronDownIcon className="w-6 h-6 animate-bounce group-hover:text-blue-600" />
        </a>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🚀</span>
              Complete Healthcare Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Streamline your hospital operations with our comprehensive platform designed for modern healthcare providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enhanced Feature Cards */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent appointment booking system with automated scheduling, conflict detection, and patient notifications.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <UserGroupIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Doctor Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive doctor profiles, schedule management, and performance tracking for optimal resource allocation.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time insights into hospital operations, patient flow, revenue, and performance metrics.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <CreditCardIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Billing & Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrated billing system with multiple payment options, insurance processing, and financial reporting.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ClockIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Operations</h3>
              <p className="text-gray-600 leading-relaxed">
                Round-the-clock system availability with real-time updates and emergency scheduling capabilities.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Compliant</h3>
              <p className="text-gray-600 leading-relaxed">
                HIPAA-compliant platform with enterprise-grade security, data encryption, and privacy protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-12">
            Trusted by Leading Healthcare Institutions Worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="text-gray-400 font-bold text-lg tracking-wide">GENERAL HOSPITAL</div>
            <div className="text-gray-400 font-bold text-lg tracking-wide">MEDICAL CENTER</div>
            <div className="text-gray-400 font-bold text-lg tracking-wide">HEALTH SYSTEM</div>
            <div className="text-gray-400 font-bold text-lg tracking-wide">CLINIC GROUP</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                50K+
              </div>
              <div className="text-xl font-semibold text-gray-700">Appointments Managed</div>
              <div className="text-gray-500 mt-2">Every month</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                1,200+
              </div>
              <div className="text-xl font-semibold text-gray-700">Active Doctors</div>
              <div className="text-gray-500 mt-2">Across all facilities</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="text-xl font-semibold text-gray-700">System Uptime</div>
              <div className="text-gray-500 mt-2">Always available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/95 backdrop-blur-sm text-white py-16 px-6 border-t border-gray-700/50">
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
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Tiqora
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Empowering healthcare providers with cutting-edge technology for better patient care and operational efficiency.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#auth" className="hover:text-white transition-colors">Get Started</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Analytics</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><a href="#auth" className="hover:text-white transition-colors">Login</a></li>
                <li><a href="#auth" className="hover:text-white transition-colors">Sign Up</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Account</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Tiqora. All rights reserved. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

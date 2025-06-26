"use client";

import Image from "next/image";
import { ArrowRightIcon, PlayIcon, EyeIcon, EyeSlashIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService, validateEmail, validatePassword, validatePasswordMatch } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";


export function Hero() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "", showPassword: false });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    repeatPassword: "", 
    showPassword: false, 
    showRepeatPassword: false 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateEmail(loginData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const { user, error } = await authService.signIn(loginData.email, loginData.password);
      
      if (error) {
        setError(error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateEmail(signupData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(signupData.password)) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!validatePasswordMatch(signupData.password, signupData.repeatPassword)) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { user, error } = await authService.signUp(signupData.email, signupData.password);
      
      if (error) {
        setError(error);
      } else {
        router.push("/auth/sign-up-success");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateEmail(resetEmail)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const { success, error } = await authService.resetPassword(resetEmail);
      
      if (error) {
        setError(error);
      } else {
        setResetEmailSent(true);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center py-1 px-6">
      {/* Enhanced Background with exact gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-primary/30 to-primary-hover/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-100/20 to-blue-100/20 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Floating dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent/60 rounded-full animate-bounce delay-700" />
      </div>
      
      <div className="relative max-w-7xl mx-auto w-full">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'} items-center`}>
          
          {/* Left Content - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center"
              >
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/5 to-accent/5 text-primary border-primary/20 rounded-full shadow-sm">
                  ✨ Transforming Healthcare Scheduling
                </Badge>
            </motion.div>
            
            {/* Hero Image for Mobile & Tablet */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative mx-auto w-full max-w-md mb-8"
              >
                {/* Floating background elements */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary-hover/20 rounded-3xl blur-xl animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-r from-white/40 to-white/20 rounded-3xl" />
                
                <div className="relative bg-card/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-border group hover:shadow-3xl transition-all duration-500">
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm" />
                  
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="/HeroImg1.jpeg"
                      alt="Healthcare professionals using Tiqora platform"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    {/* Enhanced overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-surface/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                    
                    {/* Floating badge */}
                    <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-border">
                      <span className="text-xs font-semibold text-card-foreground flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Live Platform
                      </span>
                    </div>
                    
                    {/* Bottom info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/60 to-transparent p-4">
                      <div className="text-card-foreground">
                        <div className="text-sm font-semibold mb-1">Smart Healthcare Management</div>
                        <div className="text-xs opacity-90">Streamlining operations for better patient care</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hero Image for Tablet (md screens) */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative mx-auto w-full max-w-lg mb-8 block lg:hidden"
              >
                {/* Floating background elements */}
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/25 via-accent/25 to-primary-hover/25 rounded-3xl blur-2xl animate-pulse" />
                <div className="absolute -inset-3 bg-gradient-to-r from-white/30 to-white/15 rounded-3xl" />
                
                <div className="relative bg-card/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-border group hover:shadow-3xl transition-all duration-500">
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm" />
                  
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src="/HeroImg1.jpeg"
                      alt="Healthcare professionals using Tiqora platform"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      priority
                      sizes="(max-width: 1024px) 90vw, 50vw"
                    />
                    
                    {/* Enhanced overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-surface/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
                    
                    {/* Enhanced floating badge for tablets */}
                    <div className="absolute top-5 left-5 bg-card/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border">
                      <span className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                        Live Healthcare Platform
                      </span>
                    </div>
                    
                    {/* Enhanced bottom info overlay for tablets */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent p-5">
                      <div className="text-card-foreground">
                        <div className="text-base font-semibold mb-2">Smart Healthcare Management</div>
                        <div className="text-sm opacity-90">Advanced platform streamlining operations for better patient care</div>
                      </div>
                    </div>
                    
                    {/* Interactive corner elements */}
                    <div className="absolute top-5 right-5 bg-card/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-border group-hover:scale-110 transition-transform">
                      <div className="w-3 h-3 bg-gradient-to-r from-success to-success-hover rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Main Headlines */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Transform Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-accent">
                  Healthcare
                </span>
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-muted-foreground">
                Operations Today
              </h2>
            </motion.div>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl lg:max-w-none"
            >
              Streamline appointments, manage doctors, analyze performance, and deliver exceptional patient care—all from one intelligent, modern platform.
            </motion.p>
            
            {/* Feature Highlights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              {[
                "Smart Scheduling",
                "Patient Management",
                "HIPAA Compliant"
              ].map((feature, index) => (
                <motion.div 
                  key={feature} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2 bg-card/70 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CheckCircleIcon className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-card-foreground">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Enhanced Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover mb-2 group-hover:scale-110 transition-transform">
                  50K+
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Appointments</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-success-hover mb-2 group-hover:scale-110 transition-transform">
                  1,200+
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Doctors</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover mb-2 group-hover:scale-110 transition-transform">
                  99.9%
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Uptime</div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Authentication Hub */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            {/* Hero Image for Desktop (lg and above) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.7, type: "spring", stiffness: 100 }}
                className="absolute -top-12 -left-12 w-80 h-64 z-0 group"
              >
                {/* Floating background glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent/30 to-primary-hover/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="relative bg-card/85 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-border group-hover:shadow-3xl transition-all duration-500 hover:rotate-1 hover:scale-105">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm transform scale-105" />
                  
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src="/HeroImg1.jpeg"
                      alt="Healthcare professionals using advanced medical technology"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 0vw, 33vw"
                    />
                    
                    {/* Multi-layered overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-surface/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
                    
                    {/* Interactive floating elements */}
                    <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm rounded-full p-2 shadow-lg border border-border group-hover:scale-110 transition-transform">
                      <div className="w-3 h-3 bg-gradient-to-r from-success to-success-hover rounded-full animate-pulse" />
                    </div>
                    
                    {/* Bottom overlay with tech info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent p-3">
                      <div className="text-card-foreground">
                        <div className="text-xs font-semibold opacity-95">AI-Powered Healthcare</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Next-gen medical management</div>
                      </div>
                    </div>
                    
                    {/* Subtle animation dots */}
                    <div className="absolute top-4 left-4 flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-card-foreground/60 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-card-foreground/60 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-card-foreground/60 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Floating decorations */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/30 to-primary-hover/30 rounded-full blur-2xl animate-pulse delay-300" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-accent/20 to-accent-hover/20 rounded-full blur-2xl animate-pulse delay-700" />
            
            {/* Additional floating tech elements */}
            <div className="absolute top-1/4 right-0 w-16 h-16 bg-gradient-to-br from-success/40 to-success-hover/40 rounded-full blur-xl animate-pulse delay-1000" />
            <div className="absolute bottom-1/3 left-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-primary-hover/30 rounded-full blur-xl animate-pulse delay-500" />
            
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)_/_0.05)_0%,transparent_50%)] pointer-events-none" />
            
            {/* Main Authentication Card */}
            <Card className="relative w-full max-w-lg mx-auto backdrop-blur-xl bg-card/95 shadow-2xl border border-border rounded-3xl overflow-hidden z-10">
              {/* Header gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-hover to-accent" />
              
              <CardHeader className="text-center space-y-6 pt-10 pb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center shadow-xl shadow-primary/25"
                >
                  <SparklesIcon className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-card-foreground">Welcome to Tiqora</h2>
                  <p className="text-muted-foreground mt-3 text-lg">Your healthcare management journey starts here</p>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/80 backdrop-blur-sm h-12">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-base h-10"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-base h-10"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm mb-6 flex items-center gap-3"
                      >
                        <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-destructive text-xs font-bold">!</span>
                        </div>
                        {error}
                      </motion.div>
                    )}

                    {resetEmailSent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-sm mb-6 flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Email sent!</div>
                          <div>Check your inbox for password reset instructions.</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activeTab === "reset" ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleResetPassword} 
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">Reset Password</h3>
                        <p className="text-muted-foreground dark:text-muted-foreground">Enter your email to receive reset instructions</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground dark:text-foreground">
                          Email Address
                        </Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl bg-card/80 backdrop-blur-sm"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setActiveTab("login");
                            setError(null);
                            setResetEmailSent(false);
                          }}
                          className="flex-1 h-12 font-semibold rounded-xl"
                        >
                          Back to Login
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isLoading ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Email"
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <>
                      <TabsContent value="login">
                        <motion.form 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleLogin} 
                          className="space-y-6"
                        >
                          <div className="space-y-3">
                            <Label htmlFor="login-email" className="text-sm font-semibold text-foreground dark:text-foreground">
                              Email Address
                            </Label>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="doctor@hospital.com"
                              value={loginData.email}
                              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                              disabled={isLoading}
                              required
                              className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl bg-card/80 backdrop-blur-sm"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="login-password" className="text-sm font-semibold text-foreground dark:text-foreground">
                                Password
                              </Label>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("reset");
                                  setError(null);
                                }}
                                className="text-sm text-primary hover:text-primary/80 font-medium hover:underline"
                              >
                                Forgot password?
                              </button>
                            </div>
                            <div className="relative">
                              <Input
                                id="login-password"
                                type={loginData.showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                disabled={isLoading}
                                required
                                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl pr-12 bg-card/80 backdrop-blur-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setLoginData({...loginData, showPassword: !loginData.showPassword})}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {loginData.showPassword ? (
                                  <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                  <EyeIcon className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                          >
                            {isLoading ? (
                              <>
                                <Spinner className="mr-2 h-5 w-5" />
                                Signing In...
                              </>
                            ) : (
                              <>
                                Sign In to Dashboard
                                <ArrowRightIcon className="ml-2 w-5 h-5" />
                              </>
                            )}
                          </Button>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="signup">
                        <motion.form 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleSignUp} 
                          className="space-y-6"
                        >
                          <div className="space-y-3">
                            <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground dark:text-foreground">
                              Email Address
                            </Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="doctor@hospital.com"
                              value={signupData.email}
                              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                              disabled={isLoading}
                              required
                              className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl bg-card/80 backdrop-blur-sm"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground dark:text-foreground">
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                type={signupData.showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={signupData.password}
                                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                disabled={isLoading}
                                required
                                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl pr-12 bg-card/80 backdrop-blur-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setSignupData({...signupData, showPassword: !signupData.showPassword})}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {signupData.showPassword ? (
                                  <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                  <EyeIcon className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="signup-repeat-password" className="text-sm font-semibold text-foreground dark:text-foreground">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-repeat-password"
                                type={signupData.showRepeatPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={signupData.repeatPassword}
                                onChange={(e) => setSignupData({...signupData, repeatPassword: e.target.value})}
                                disabled={isLoading}
                                required
                                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl pr-12 bg-card/80 backdrop-blur-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setSignupData({...signupData, showRepeatPassword: !signupData.showRepeatPassword})}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {signupData.showRepeatPassword ? (
                                  <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                  <EyeIcon className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                          >
                            {isLoading ? (
                              <>
                                <Spinner className="mr-2 h-5 w-5" />
                                Creating Account...
                              </>
                            ) : (
                              <>
                                Create Account
                                <ArrowRightIcon className="ml-2 w-5 h-5" />
                              </>
                            )}
                          </Button>
                        </motion.form>
                      </TabsContent>
                    </>
                  )}
                </Tabs>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign-in */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 font-semibold border-border hover:bg-muted rounded-xl transition-colors text-base"
                  disabled={isLoading}
                  onClick={() => authService.signInWithOAuth('google')}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

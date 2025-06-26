"use client";

import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LogOutIcon,
} from "lucide-react"

export function LogoutButton({ className = "", showIcon = true, showText = true }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await authService.signOut();
      
      if (!error) {
        // Force a hard navigation to ensure middleware processes the logout
        window.location.href = "/";
      } else {
        console.error("Logout error:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`flex items-center cursor-pointer hover:text-foreground transition-colors duration-200 
                  ${isMobile ? 'w-full justify-center min-h-[44px]' : 'w-full'} ${className}`}
      onClick={logout}
    >
      {showIcon && (
        <LogOutIcon className={`${showText ? (isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-2 h-4 w-4') : 'h-4 w-4'} ${isLoading ? 'animate-spin' : ''}`} />
      )}
      {showText && (
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
          {isLoading ? "Logging out..." : "Logout"}
        </span>
      )}
    </div>
  );
}

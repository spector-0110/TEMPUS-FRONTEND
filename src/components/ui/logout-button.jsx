"use client";

import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LogOutIcon,
} from "lucide-react"

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      className="flex items-center w-full cursor-pointer"
      onClick={logout}
    >
      <LogOutIcon className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? "Logging out..." : "Logout"}
    </div>
  );
}

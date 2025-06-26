"use client";

import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LogoutButton } from '@/components/ui/logout-button';
import { Menu, Palette, LogOut } from 'lucide-react';

export function MobileNavigation({ className = "", position = "absolute", variant = "default" }) {
  const isMobile = useIsMobile();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="bg-background/80 backdrop-blur-sm rounded-md p-2 
                       border border-border/50 hover:border-border/80
                       shadow-sm hover:shadow-md transition-all duration-200
                       h-8 w-8"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 mt-1"
          sideOffset={4}
        >
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ThemeSwitcher variant="compact" size="sm" />
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-destructive hover:text-destructive/80 focus:text-destructive/80"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <LogoutButton showIcon={false} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default MobileNavigation;

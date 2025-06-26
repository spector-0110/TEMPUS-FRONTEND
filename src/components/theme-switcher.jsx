"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Laptop, Moon, Sun, Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeSwitcher = ({ variant = "default", showLabel = false, size = "sm" }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Enhanced theme setter that preserves cursor functionality
  const setThemeWithCursorFix = (newTheme) => {
    // Ensure cursor remains active during theme change
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
      document.body.style.pointerEvents = 'auto';
    }
    
    setTheme(newTheme);
    
    // Ensure cursor stays active after theme change
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
        document.body.style.pointerEvents = 'auto';
      }
    }, 100);
  };

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size={size} className="w-9 h-9">
        <Palette size={16} className="animate-pulse" />
      </Button>
    );
  }

  const ICON_SIZE = 16;

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      value: "dark", 
      label: "Dark",
      description: "Easy on the eyes",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follows device preference",
      icon: Laptop,
    },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  const renderTriggerContent = () => {
    if (variant === "compact") {
      return <CurrentIcon size={ICON_SIZE} className="text-muted-foreground" />;
    }

    if (variant === "expanded") {
      return (
        <div className="flex items-center gap-2">
          <CurrentIcon size={ICON_SIZE} className="text-muted-foreground" />
          {showLabel && <span className="text-sm">{currentTheme?.label}</span>}
          {resolvedTheme && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {resolvedTheme}
            </Badge>
          )}
        </div>
      );
    }

    // Default variant
    return <CurrentIcon size={ICON_SIZE} className="text-muted-foreground" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTriggerContent()}
            </motion.div>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 font-medium">
          <Palette size={14} />
          Theme Preference
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setThemeWithCursorFix(value)}
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            const isResolved = resolvedTheme === option.value;
            
            return (
              <DropdownMenuRadioItem 
                key={option.value}
                value={option.value}
                className="flex items-center gap-3 py-2.5 cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon 
                    size={ICON_SIZE} 
                    className={`${isActive ? 'text-primary' : 'text-muted-foreground'} 
                              group-hover:text-foreground transition-colors`} 
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {isResolved && option.value !== 'system' && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      Active
                    </Badge>
                  )}
                  {isActive && (
                    <Check size={12} className="text-primary" />
                  )}
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            Current: <span className="font-medium text-foreground">{resolvedTheme}</span>
            {theme === 'system' && (
              <span className="text-muted-foreground"> (auto)</span>
            )}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };

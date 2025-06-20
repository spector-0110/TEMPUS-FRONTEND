"use client";

import { useState } from "react";
import AnimatedLogo from "@/components/ui/animated-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Logo() {
  const [size, setSize] = useState("large");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Button 
            variant={size === "large" ? "default" : "outline"}
            onClick={() => setSize("large")}
            className="h-16"
          >
            Large
          </Button>
          <Button 
            variant={size === "medium" ? "default" : "outline"}
            onClick={() => setSize("medium")} 
            className="h-16"
          >
            Medium
          </Button>
          <Button 
            variant={size === "small" ? "default" : "outline"}
            onClick={() => setSize("small")} 
            className="h-16"
          >
            Small
          </Button>
        </div>
        
        <Card className="p-16 flex items-center justify-center bg-muted/50 border-border min-h-[300px]">
          <motion.div
            key={size}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-full"
          >
            <AnimatedLogo 
              width={size === "large" ? 350 : size === "medium" ? 250 : 150} 
              height={size === "large" ? 100 : size === "medium" ? 70 : 50} 
            />
          </motion.div>
        </Card>
        
       
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * AnimatedLogo component - Creates a professional animation for the Tiqora logo
 * with frequent transitions
 * 
 * @param {Object} props
 * @param {number} props.width - Width of the logo (default: 150)
 * @param {number} props.height - Height of the logo (default: 50)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Animated Tiqora logo with frequent transitions
 */
export function AnimatedLogo({
  width = 150, 
  height = 50, 
  className = "",
  onAnimationComplete,
}) {
  const [animationState, setAnimationState] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
    
    // Create transition effect by cycling through animation states
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev) % 4);
    }, 1000); // Change animation every 1 second
    
    return () => clearInterval(interval);
  }, []);

  // Animation variants for different elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        duration: 0.5,
      }
    }
  };

  // Several different animation states for the icon to transition between
  const getIconAnimation = () => {
    switch(animationState) {

      case 0:
        return {
          scale: [1, 1.1, 1],
          y: [0, -3, 0],
          transition: { 
            duration: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
          }
        };
      case 1:
        return {
          scale: [1, 0.92, 1],
          transition: { 
            duration: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }
        };
      default:
        return {
          scale: 1,
          transition: { duration: 0.5 }
        };
    }
  };

  // Shimmer effect for the logo - even more frequent
  const shimmerVariants = {
    initial: {
      x: "-100%",
      opacity: 0.3,
    },
    animate: {
      x: "100%",
      opacity: 0.7,
      transition: {
        repeat: Infinity,
        repeatDelay: 0.4, // Even shorter delay between shimmers
        duration: 0.8, // Faster shimmer movement
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className={`relative flex items-center gap-3 ${className}`}
      style={{ width, height }}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
      onAnimationComplete={() => {
        if (onAnimationComplete) onAnimationComplete();
      }}
    >
      {/* Logo Icon with animation - using dynamic animation state */}
      <motion.div 
        className="relative overflow-hidden"
        animate={getIconAnimation()}
        style={{ width: height, height: height }}
      >
        <Image
          src="/tiqoraLogo1.png"
          alt="Tiqora Logo"
          width={height}
          height={height}
          className="object-contain z-10 relative"
        />
        
        {/* Shimmer effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent z-20"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          style={{ 
            mixBlendMode: "overlay",
            width: "100%",
            height: "100%"
          }}
        />
      </motion.div>

      
    </motion.div>
  );
}

export default AnimatedLogo;

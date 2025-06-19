/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			/* Border & Structural */
  			border: 'hsl(var(--border))',
  			'border-strong': 'hsl(var(--border-strong))',
  			'border-subtle': 'hsl(var(--border-subtle))',
  			
  			/* Core Foundation */
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			surface: 'hsl(var(--surface))',
  			'surface-variant': 'hsl(var(--surface-variant))',
  			'surface-elevated': 'hsl(var(--surface-elevated))',
  			
  			/* Text Hierarchy */
  			'text-primary': 'hsl(var(--text-primary))',
  			'text-secondary': 'hsl(var(--text-secondary))',
  			'text-tertiary': 'hsl(var(--text-tertiary))',
  			'text-disabled': 'hsl(var(--text-disabled))',
  			'text-placeholder': 'hsl(var(--text-placeholder))',
  			
  			/* Card System */
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				hover: 'hsl(var(--card-hover))',
  				border: 'hsl(var(--card-border))',
  				elevated: 'hsl(var(--card-elevated))',
  				pressed: 'hsl(var(--card-pressed))'
  			},
  			
  			/* Interactive Elements - Primary */
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))',
  				active: 'hsl(var(--primary-active))',
  				subtle: 'hsl(var(--primary-subtle))'
  			},
  			
  			/* Interactive Elements - Secondary */
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				hover: 'hsl(var(--secondary-hover))',
  				active: 'hsl(var(--secondary-active))',
  				subtle: 'hsl(var(--secondary-subtle))'
  			},
  			
  			/* Accent Colors */
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				hover: 'hsl(var(--accent-hover))',
  				active: 'hsl(var(--accent-active))',
  				subtle: 'hsl(var(--accent-subtle))'
  			},
  			
  			/* Status Colors - Success */
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  				hover: 'hsl(var(--success-hover))',
  				active: 'hsl(var(--success-active))',
  				muted: 'hsl(var(--success-muted))',
  				subtle: 'hsl(var(--success-subtle))'
  			},
  			
  			/* Status Colors - Warning */
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  				hover: 'hsl(var(--warning-hover))',
  				active: 'hsl(var(--warning-active))',
  				muted: 'hsl(var(--warning-muted))',
  				subtle: 'hsl(var(--warning-subtle))'
  			},
  			
  			/* Status Colors - Error/Destructive */
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  				hover: 'hsl(var(--destructive-hover))',
  				active: 'hsl(var(--destructive-active))',
  				muted: 'hsl(var(--destructive-muted))',
  				subtle: 'hsl(var(--destructive-subtle))'
  			},
  			
  			/* Status Colors - Info */
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))',
  				hover: 'hsl(var(--info-hover))',
  				active: 'hsl(var(--info-active))',
  				muted: 'hsl(var(--info-muted))',
  				subtle: 'hsl(var(--info-subtle))'
  			},
  			
  			/* Neutral Colors */
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  				hover: 'hsl(var(--muted-hover))'
  			},
  			subtle: {
  				DEFAULT: 'hsl(var(--subtle))',
  				foreground: 'hsl(var(--subtle-foreground))',
  				hover: 'hsl(var(--subtle-hover))'
  			},
  			
  			/* Form Elements */
  			input: {
  				DEFAULT: 'hsl(var(--input))',
  				background: 'hsl(var(--input-background))',
  				focus: 'hsl(var(--input-focus))',
  				hover: 'hsl(var(--input-hover))'
  			},
  			ring: 'hsl(var(--ring))',
  			
  			/* Overlays & Modals */
  			overlay: {
  				DEFAULT: 'hsl(var(--overlay))',
  				foreground: 'hsl(var(--overlay-foreground))'
  			},
  			backdrop: 'hsl(var(--backdrop))',
  			
  			/* Popover & Tooltips */
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  				border: 'hsl(var(--popover-border))'
  			},
  			tooltip: {
  				DEFAULT: 'hsl(var(--tooltip))',
  				foreground: 'hsl(var(--tooltip-foreground))'
  			},
  			
  			/* Navigation & Sidebar */
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				hover: 'hsl(var(--sidebar-hover))'
  			},
  			
  			/* Chart & Data Visualization */
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  				'6': 'hsl(var(--chart-6))',
  				'7': 'hsl(var(--chart-7))',
  				'8': 'hsl(var(--chart-8))'
  			}
  		},
  		
  		/* Border Radius System */
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'calc(var(--radius-xl) + 0.5rem)'
  		},
  		
  		/* Enhanced Box Shadows */
  		boxShadow: {
  			'theme-sm': 'var(--shadow-sm)',
  			'theme': 'var(--shadow)',
  			'theme-md': 'var(--shadow-md)',
  			'theme-lg': 'var(--shadow-lg)',
  			'theme-xl': 'var(--shadow-xl)',
  		},
  		
  		/* Animation Extensions */
  		animation: {
  			'gradient': 'gradient 6s ease-in-out infinite',
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  		},
  		
  		/* Keyframes */
  		keyframes: {
  			gradient: {
  				'0%, 100%': { 'background-position': '0% 50%' },
  				'50%': { 'background-position': '100% 50%' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideUp: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			scaleIn: {
  				'0%': { opacity: '0', transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' },
  			},
  		},
  		
  		/* Typography */
  		fontSize: {
  			'xs': ['0.75rem', { lineHeight: '1rem' }],
  			'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  			'base': ['1rem', { lineHeight: '1.5rem' }],
  			'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  			'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  		},
  		
  		/* Spacing Extensions */
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
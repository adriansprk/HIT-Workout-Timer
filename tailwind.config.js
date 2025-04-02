/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define semantic color tokens
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          dark: 'var(--color-primary-dark)',
          darkHover: 'var(--color-primary-dark-hover)',
        },
        exercise: {
          DEFAULT: 'var(--color-exercise)',
          light: 'var(--color-exercise-light)',
          dark: 'var(--color-exercise-dark)',
        },
        rest: {
          DEFAULT: 'var(--color-rest)',
          light: 'var(--color-rest-light)',
          dark: 'var(--color-rest-dark)',
        },
        recovery: {
          DEFAULT: 'var(--color-recovery)',
          light: 'var(--color-recovery-light)',
          dark: 'var(--color-recovery-dark)',
        },
        ui: {
          background: {
            light: 'var(--color-background-light)',
            dark: 'var(--color-background-dark)',
          },
          card: {
            light: 'var(--color-card-light)',
            dark: 'var(--color-card-dark)',
          },
          text: {
            primary: {
              light: 'var(--color-text-primary-light)',
              dark: 'var(--color-text-primary-dark)',
            },
            secondary: {
              light: 'var(--color-text-secondary-light)',
              dark: 'var(--color-text-secondary-dark)',
            },
          },
        },
        // Add border colors
        border: {
          DEFAULT: 'var(--color-border-light)',
          light: 'var(--color-border-light)',
          dark: 'var(--color-border-dark)',
        },
        // Define colors using HSL values directly
        // These are the system colors used by the base design system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        'pill': '9999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        'timer': '6rem', // For the primary timer display
      },
      spacing: {
        'timer-container': '6rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}


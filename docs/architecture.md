# HIIT Timer Architecture

This document provides a detailed overview of the HIIT Timer application's architecture, design patterns, and technical decisions.

## Architectural Overview

The HIIT Timer is built with a modern React-based architecture using Next.js as the framework. The application follows these key architectural principles:

1. **Component-Based Architecture**: UI is broken down into reusable, composable components
2. **Context-Based State Management**: Global state is managed via React Context API
3. **Hooks-Based Logic**: Business logic is abstracted into custom hooks
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with JS
5. **Responsive Design**: Mobile-first approach with adaptive layouts
6. **Offline Capability**: Works offline with local storage persistence
7. **Accessibility First**: ARIA compliant with keyboard navigation support

## Technologies

The application is built with the following key technologies:

### Core Framework
- **Next.js 15**: React framework for production applications
- **React 19**: UI component library
- **TypeScript**: Static type checking

### UI Components and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components 
- **Lucide React**: Icon library
- **Class Variance Authority & clsx**: For managing component variants
- **Tailwind Merge**: Utility for merging Tailwind classes

### State Management
- **React Context API**: For global state management
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Testing
- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing framework
- **Percy**: Visual regression testing

### Audio and Visual Effects
- **Web Audio API**: For reliable audio playback
- **React Confetti**: Visual celebration effect

### Storage and Persistence
- **LocalStorage API**: Client-side data persistence

## Directory Structure

```
HIIT-Timer/
├── app/                      # Next.js application routes and pages
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Main application page
│   ├── globals.css           # Global CSS styles
│   ├── audio-test/           # Audio testing route
│   └── audio-debug/          # Audio debugging route
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components (buttons, inputs, etc.)
│   ├── workout-timer.tsx     # Main timer component
│   ├── workout-setup.tsx     # Workout configuration component
│   ├── settings-modal.tsx    # Settings configuration modal
│   ├── AudioUnlocker.tsx     # Mobile audio unlocking component
│   ├── ThemeToggle.tsx       # Theme switching component
│   ├── MuteButton.tsx        # Audio mute toggle
│   ├── WakeLockIndicator.tsx # Wake lock status indicator
│   ├── edit-counter-modal.tsx # Number counter edit modal
│   ├── edit-slider-modal.tsx # Slider-based edit modal
│   ├── edit-duration-modal.tsx # Duration edit modal
│   ├── edit-exercises-modal.tsx # Exercise list edit modal
│   └── theme-provider.tsx    # Theme provider wrapper
├── contexts/                 # React Context providers
│   ├── AudioContext.tsx      # Audio system state management
│   └── ThemeContext.tsx      # Theme state management
├── hooks/                    # Custom React hooks
│   ├── useWakeLock.ts        # Screen wake lock functionality
│   ├── use-mobile.tsx        # Mobile detection hook
│   └── use-toast.ts          # Toast notification system
├── lib/                      # Utility functions and services
│   ├── audio.ts              # Audio playback utilities
│   ├── settings.ts           # Settings persistence
│   ├── utils.ts              # General utilities
│   └── wakeLock.ts           # Wake lock implementation
├── styles/                   # Global styles and theme definitions
├── public/                   # Static assets
│   ├── audio/                # Voice announcement audio files
│   └── placeholder images    # Various placeholder images
├── __tests__/                # Test files organized by module type
│   ├── components/           # Component tests
│   ├── contexts/             # Context tests
│   ├── hooks/                # Hook tests
│   ├── integration/          # Integration tests
│   └── lib/                  # Utility tests
└── cypress/                  # End-to-end tests
```

## Core Components

### Main Application Page (`app/page.tsx`)

The main page handles:
- Configuration of workout parameters
- Workout state management
- Modal dialogs for adjusting settings
- Starting and ending workouts

### Workout Timer (`components/workout-timer.tsx`)

The central timer component responsible for:
- Managing timer state and phases
- Rendering the countdown display
- Playing audio announcements
- Handling pause/resume functionality
- Managing forward/backward navigation
- Displaying the completion screen

### Settings Modal (`components/settings-modal.tsx`)

Provides user configuration for:
- Dark/Light theme switching
- Audio announcement toggling
- Additional settings

### Workout Setup (`components/workout-setup.tsx`)

Handles the initial workout configuration:
- Exercise count setting
- Duration adjustments
- Rest period configuration

### Audio Components

The application includes specialized audio handling components:
- `AudioUnlocker.tsx`: Ensures audio works on mobile devices
- `MuteButton.tsx`: Toggles audio mute state

## State Management

### Context Providers

The application uses React Context for global state management:

1. **AudioContext** (`contexts/AudioContext.tsx`)
   - Manages audio playback state
   - Controls mute/unmute functionality
   - Handles audio file loading and playback
   - Provides audio announcement functions

2. **ThemeContext** (`contexts/ThemeContext.tsx`)
   - Manages dark/light theme state
   - Syncs theme preference with localStorage
   - Provides theme toggle function

### Local Storage

Client-side persistence is managed through localStorage for:
- Workout parameters (exercise time, rest time, etc.)
- Theme preferences
- Mute state
- Workout streak data
- Audio unlock status

## Key Features Implementation

### Timer System

The timer implementation uses a combination of:
- `useState` for managing timer state
- `useEffect` for setting up interval timers
- `useRef` for referencing the latest state in callback functions
- Careful management of timer phases (exercise, rest, round rest)

### Audio System

The audio system leverages the Web Audio API with:
- Preloaded audio files for announcements
- Special handling for mobile device audio unlocking
- Mute/unmute functionality
- Dynamic audio cues based on workout phase

For more details on the audio implementation, see [docs/audio-system.md](docs/audio-system.md).

### Wake Lock

Screen wake lock prevents the device screen from turning off:
- Primary implementation using the Wake Lock API (`lib/wakeLock.ts`)
- Fallback implementation for iOS using a hidden video element
- Automatic reacquisition on visibility changes
- Status indicator component (`WakeLockIndicator.tsx`)

### Dark Mode

Theme switching is implemented using:
- CSS variables for theme colors
- React Context for state management
- Tailwind CSS for dark mode styling
- LocalStorage for persistence
- UI toggling through `ThemeToggle.tsx`

### Responsive Design

The application uses a mobile-first approach with:
- Tailwind CSS for responsive styling
- Viewport-relative units for scaling
- Media queries for layout adjustments
- Touch-friendly controls for mobile
- Mobile detection via `use-mobile.tsx` hook

## Testing Architecture

The application uses a comprehensive testing strategy that includes:

### Unit Tests

Unit tests focus on testing individual components and functions in isolation using Jest and React Testing Library:
- Component rendering tests
- Hook behavior tests
- Utility function tests

### Integration Tests

Integration tests verify interactions between components:
- Context provider integration
- Component interaction tests
- State persistence tests

### End-to-End Tests

Cypress tests simulate real user journeys through the application:
- Complete workout cycle tests
- UI interaction tests (pause/resume, dark mode toggle)
- Mobile viewport simulation

### Visual Testing

Percy is used for visual regression testing to ensure UI consistency:
- Captures screenshots during Cypress test runs
- Compares against baseline images
- Highlights visual differences

For detailed testing information, see [TESTING.md](TESTING.md) and [docs/test-reference.md](docs/test-reference.md).

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and delivery with two main workflows:

### Main Test Workflow (`.github/workflows/test.yml`)

This comprehensive workflow runs on pushes to `main` and pull requests:

- **Environment**: Runs on Ubuntu with Node.js 18.x
- **Dependencies Management**:
  - Uses PNPM for package management
  - Implements caching for PNPM store and Cypress binary
  - Installs all dependencies including testing tools
- **Testing Phases**:
  - Runs Jest tests with coverage reporting
  - Builds the Next.js application
  - Starts the application and waits for it to be ready
  - Conditionally runs Cypress tests if configuration exists
  - Uploads code coverage to Codecov
- **Artifacts**:
  - Preserves Cypress videos and screenshots on test failure
  - Detailed logging for debugging CI issues

### Dedicated Cypress Workflow (`.github/workflows/cypress.yml`)

A focused workflow specifically for Cypress end-to-end tests:

- **Trigger Events**: Runs on pushes to `main` and `refactor/tailwind-v4-prep` branches and PRs to `main`
- **Setup**: Uses Node.js 20 with npm caching
- **Build Process**:
  - Verifies Cypress installation
  - Builds the Next.js application
  - Starts the server and waits for it to be ready
- **Test Execution**:
  - Runs Cypress tests in Chrome browser
  - Uses the `cypress.config.ts` configuration
- **Failure Handling**: Uploads screenshots as artifacts when tests fail

This dual-workflow approach ensures thorough testing with specialized configurations for different testing requirements.

## Performance Optimizations

Several strategies ensure optimal performance:
- Component memoization for expensive renders
- Audio file preloading
- Efficient state updates to minimize re-renders
- Throttled event handlers
- Optimized wake lock implementation
- Runtime caching for static assets
- Client-side data persistence

## Accessibility

The application prioritizes accessibility through:
- Semantic HTML structure
- ARIA attributes for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly announcements
- Focus management
- Responsive text sizing

## Documentation

The project includes several documentation files:

- **README.md**: Main project documentation and setup instructions
- **TESTING.md**: Testing strategy and execution instructions
- **docs/audio-system.md**: Detailed explanation of the audio system
- **docs/test-reference.md**: Reference guide for testing implementations
- **docs/test-implementation-plan.md**: Detailed plan for implementing tests

## Future Architecture Considerations

Potential architectural enhancements include:
- Server-side user profiles for cross-device settings
- Progressive Web App (PWA) capabilities with service worker
- Workout templates/presets
- Analytics integration
- More advanced audio capabilities with synthesized speech
- Enhanced mobile features with device motion/orientation API 
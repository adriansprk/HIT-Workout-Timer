# HIIT Timer [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-blue)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/) [![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT) [![Live App](https://img.shields.io/badge/live-timer.adriancares.com-brightgreen)](https://timer.adriancares.com)

A modern, customizable High-Intensity Interval Training timer web application built with Next.js and TypeScript.

**[Try it now: timer.adriancares.com](https://timer.adriancares.com)**

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/images/config-screen.png" alt="Workout Configuration Screen" width="300" />
        <br />
        <em>Workout Configuration</em>
      </td>
      <td align="center">
        <img src="docs/images/timer-screen.png" alt="Active Workout Timer" width="300" />
        <br />
        <em>Active Workout Timer</em>
      </td>
    </tr>
  </table>
</div>

## Features

- **Fully Customizable Workouts**: Configure exercise time, rest periods, number of exercises, and rounds
- **Audio Announcements**: Voice prompts for workout phases including "halfway there", "round complete", and "workout complete"
- **Intuitive Timer Interface**: Visual circular progress indicator with clear time display
- **Skip Controls**: Navigate forward and backward through workout phases
- **Screen Wake Lock**: Prevents device screen from turning off during workouts
- **Dark Mode Support**: Toggle between light and dark themes
- **Progress Tracking**: Workout streak counter to maintain motivation
- **Mobile Friendly**: Responsive design that works on all devices
- **Offline Support**: Works without an internet connection
- **Settings Persistence**: Saves your workout preferences

## Getting Started

### Prerequisites

- Node.js 16.8.0 or newer
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adriansprk/HIIT-Timer.git
   cd HIIT-Timer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configure Your Workout**:
   - Set exercise duration (in seconds)
   - Set rest period duration (in seconds)
   - Set round rest duration (in seconds)
   - Choose number of exercises per round
   - Choose number of rounds

2. **Start Your Workout**:
   - Press the "Start Workout" button
   - Follow the visual and audio cues
   - Use pause/play and skip controls as needed

3. **Complete Workout**:
   - Receive congratulations and workout statistics
   - View your streak progress
   - Start a new workout or return to the configuration screen

## Technology Stack

- **Framework**: Next.js 15.x with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.x
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **Theme Switching**: next-themes
- **Audio**: Web Audio API
- **Screen Wake Lock**: Web Wake Lock API with video fallback for iOS

## Project Structure

```
HIIT-Timer/
├── app/             # Next.js App Router pages
├── components/      # React components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── public/          # Static assets
│   └── audio/       # Voice announcements
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## License

This project is licensed under the MIT License 
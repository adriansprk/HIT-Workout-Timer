# HIIT Timer Test Reference

This document provides a comprehensive overview of all tests in the HIIT Timer application, organized by test type and component. Use this as a quick reference for understanding test coverage and for maintaining tests as the application evolves.

## Table of Contents

- [Unit Tests](#unit-tests)
  - [Lib Module Tests](#lib-module-tests)
  - [Hook Tests](#hook-tests)
- [Component Tests](#component-tests)
  - [UI Components](#ui-components)
  - [Context Providers](#context-providers)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Test Coverage Gaps](#test-coverage-gaps)
- [Troubleshooting Common Test Issues](#troubleshooting-common-test-issues)

## Unit Tests

### Lib Module Tests

#### `settings.test.ts`

Tests for the settings module that handles user preferences and workout configurations.

| Test | Description | Status |
|------|-------------|--------|
| `should return default settings when nothing is saved` | Verifies default settings are returned when localStorage is empty | ✅ Passing |
| `should save and load settings` | Tests saving settings to localStorage and loading them back | ✅ Passing |
| `should update partial workout params` | Verifies that partial parameter updates work correctly | ✅ Passing |
| `should calculate workout streak correctly` | Tests streak calculation logic | ✅ Passing |

### Hook Tests

#### `useWakeLock.test.tsx`

Tests for the wake lock hook that keeps the screen on during workouts.

| Test | Description | Status |
|------|-------------|--------|
| `should request wake lock` | Verifies wake lock is requested correctly | ✅ Passing |
| `should handle errors when requesting wake lock` | Tests error handling when wake lock fails | ⏭️ Skipped |
| `should release wake lock on unmount` | Ensures wake lock is released when component unmounts | ✅ Passing |

## Component Tests

### UI Components

#### `WorkoutTimer.test.tsx`

Tests for the main workout timer component that controls exercise flow.

| Test | Description | Status |
|------|-------------|--------|
| `should render with initial exercise state` | Verifies initial render state | ✅ Passing |
| `should transition from exercise to rest state` | Tests exercise to rest transition | ✅ Passing |
| `should pause and resume timer` | Tests pause/resume functionality | ✅ Passing |

#### `SettingsModal.test.tsx`

Tests for the settings modal component where users configure preferences.

| Test | Description | Status |
|------|-------------|--------|
| `should render with current settings` | Verifies modal renders with correct settings | ✅ Passing |
| `should toggle dark mode setting` | Tests dark mode toggle functionality | ✅ Passing |
| `should close when close button is clicked` | Tests modal close behavior | ✅ Passing |

#### `AudioUnlocker.test.tsx`

Tests for the audio unlocker component that handles audio permissions on mobile.

| Test | Description | Status |
|------|-------------|--------|
| `does not render on desktop devices` | Verifies component doesn't show on desktop | ✅ Passing |
| `does not render if audio is already unlocked` | Tests that modal is hidden when audio is already unlocked | ✅ Passing |
| `renders on mobile devices if audio needs unlocking` | Verifies proper rendering on mobile when unlocking is needed | ✅ Passing |
| `attempts to unlock audio when button is clicked` | Tests audio unlock functionality on button click | ✅ Passing |
| `closes on second click even if unlock fails` | Tests fallback behavior for failed unlocks | ⏭️ Skipped |

#### `MuteButton.test.tsx`

Tests for the mute button component.

| Test | Description | Status |
|------|-------------|--------|
| `should toggle mute state when clicked` | Verifies mute toggle functionality | ✅ Passing |
| `should display correct icon based on mute state` | Tests icon display logic | ✅ Passing |

#### `ThemeToggle.test.tsx`

Tests for the theme toggle component.

| Test | Description | Status |
|------|-------------|--------|
| `should toggle theme when clicked` | Verifies theme switching functionality | ✅ Passing |
| `should display correct icon based on theme` | Tests icon display logic | ✅ Passing |

#### `WakeLockIndicator.test.tsx`

Tests for the wake lock indicator that shows screen lock status.

| Test | Description | Status |
|------|-------------|--------|
| `should render active indicator when wake lock is active` | Verifies active state display | ✅ Passing |
| `should render inactive indicator when wake lock is not active` | Tests inactive state display | ✅ Passing |

### Context Providers

#### `AudioContext.test.tsx`

Tests for the audio context provider that manages sound settings.

| Test | Description | Status |
|------|-------------|--------|
| `should provide audio context values` | Verifies context provides expected values | ✅ Passing |
| `should toggle mute state` | Tests mute toggling functionality | ✅ Passing |
| `should play sounds when not muted` | Tests sound playback when unmuted | ✅ Passing |

#### `ThemeContext.test.tsx`

Tests for the theme context provider that manages dark/light mode.

| Test | Description | Status |
|------|-------------|--------|
| `should initialize with system preference` | Tests system preference detection | ✅ Passing |
| `should toggle theme` | Verifies theme toggle functionality | ✅ Passing |
| `should persist theme preference` | Tests theme persistence in localStorage | ✅ Passing |

## Integration Tests

#### `SettingsPersistence.test.tsx`

Tests for settings persistence between user sessions.

| Test | Description | Status |
|------|-------------|--------|
| `saves settings when dark mode is toggled` | Verifies settings are saved when dark mode is toggled | ✅ Passing |

#### `WorkoutFlow.test.tsx`

Tests for the complete workout flow from start to finish.

| Test | Description | Status |
|------|-------------|--------|
| `should complete workout and show completion screen` | Tests full workout cycle from start to completion | ⏭️ Skipped |

## E2E Tests

*Note: No Cypress E2E tests have been implemented yet. Consider adding these for full workflow testing.*

## Test Coverage Gaps

The following areas would benefit from additional test coverage:

1. **E2E Workflow Tests**: Complete end-to-end tests using Cypress for full user flows
2. **Streak Calculation Edge Cases**: Additional tests for workout streak logic corner cases
3. **Mobile-specific Behaviors**: More thorough testing of mobile-specific features
4. **Error Recovery Scenarios**: Tests for error recovery paths, especially network issues
5. **Accessibility Testing**: Tests to verify accessibility compliance

## Troubleshooting Common Test Issues

### 1. Wake Lock API Testing

For tests involving the Wake Lock API:
- Ensure proper mocking in `jest.setup.js`
- Use `await act()` when testing wake lock requests
- Consider skipping on CI environments where Wake Lock API mocking may be problematic

### 2. Audio Unlocking Tests

For tests involving audio unlocking:
- Create a separate test environment for mobile device simulation
- Consider using dependency injection for easier mocking
- Extract audio unlock logic into a separate hook for better testability

### 3. Workout Timer Tests

For workout timer tests:
- Use `jest.useFakeTimers()` consistently
- Be cautious with rapid timer advancements
- Mock audio to prevent playback issues
- Consider separating state logic for better unit testing

### 4. React State Update Warnings

To resolve "not wrapped in act()" warnings:
- Wrap state updates in `act()`
- Use `await waitFor()` for asynchronous state changes
- Consider refactoring components to have more predictable state updates

## Refactoring Plans

The following components have been identified for refactoring to improve testability:

### AudioUnlocker Refactoring

Planned improvements:
- Extract audio unlock logic into a custom hook (`useAudioUnlock`)
- Implement dependency injection for easier testing
- Add data-testid attributes to key elements
- Create test-specific props for controlling component state

### WorkoutTimer Refactoring

Planned improvements:
- Extract workout state management into a custom hook (`useWorkoutState`)
- Break down the component into smaller, more testable sub-components
- Create explicit phases (ready, active, complete) for clearer testing
- Add data-testid attributes to all important UI elements

## Implementation Timeline

| Phase | Component | Target Date | Status |
|-------|-----------|-------------|--------|
| 1 | Extract custom hooks | Apr 30, 2023 | 🔄 In Progress |
| 2 | Update test infrastructure | May 5, 2023 | 📅 Planned |
| 3 | Refactor components | May 15, 2023 | 📅 Planned |
| 4 | Add E2E tests | May 30, 2023 | 📅 Planned |

---

Last updated: April 24, 2023 
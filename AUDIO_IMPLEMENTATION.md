# HIIT Timer Audio Countdown Implementation

## Phase 1: Audio Files Setup
- [x] 1. Create `public/audio/` directory
- [x] 2. Add `three.mp3` file
- [x] 3. Add `two.mp3` file
- [x] 4. Add `one.mp3` file
- [x] 5. Add `rest.mp3` file
- [ ] 6. Test audio files in browser
      - Play each file manually
      - Check audio quality
      - Verify file sizes are optimized

## Phase 2: Audio Utility Implementation
- [ ] 7. Create `lib/audio.ts` (following Next.js convention)
- [ ] 8. Add TypeScript types:
      ```typescript
      type CountdownSound = 'three' | 'two' | 'one' | 'rest';
      interface AudioUtils {
        playSound: (sound: CountdownSound) => Promise<void>;
        preloadSounds: () => Promise<void>;
        isMuted: boolean;
        toggleMute: () => void;
      }
      ```
- [ ] 9. Implement `preloadSounds` function
- [ ] 10. Implement `playSound` function with mute check
- [ ] 11. Add error handling for audio loading (with console warnings)
- [ ] 12. Add error handling for audio playback
- [ ] 13. Test audio utility functions

## Phase 3: Context Management
- [ ] 14. Create `contexts` directory at project root
- [ ] 15. Create `contexts/AudioContext.tsx` for audio state management
- [ ] 16. Implement context with:
      - `isMuted` state
      - `toggleMute` function
      - localStorage persistence
      - Provider component
- [ ] 17. Add context provider to `app/layout.tsx`
- [ ] 18. Test context functionality

## Phase 4: Mute Button Component
- [ ] 19. Create `components/MuteButton.tsx`
- [ ] 20. Import speaker icons from heroicons
      - Speaker wave icon for unmuted
      - Speaker x-mark icon for muted
- [ ] 21. Style button to be accessible and visible near timer controls
      - Position next to other playback controls (pause/resume)
      - Match visual style of other controls
      - Ensure tap area is easy to access
- [ ] 22. Implement icon transition animation
      - 300ms duration
      - Rotate transform
      - Fade effect
- [ ] 23. Test button rendering
- [ ] 24. Test button animations

## Phase 5: Timer Integration
- [ ] 25. Modify `components/workout-timer.tsx`
- [ ] 26. Add AudioContext consumer
- [ ] 27. Add MuteButton to the controls area
- [ ] 28. Implement countdown audio logic:
      ```typescript
      // In a separate useEffect watching timeRemaining
      useEffect(() => {
        if (timerState === "exercise" && !isPaused) {
          if (timeRemaining === 3) playSound('three');
          else if (timeRemaining === 2) playSound('two');
          else if (timeRemaining === 1) playSound('one');
          else if (timeRemaining === 0) playSound('rest');
        }
      }, [timeRemaining, timerState, isPaused]);
      ```
- [ ] 29. Add audio cleanup in component unmount
- [ ] 30. Test timer integration
- [ ] 31. Test cleanup functions

## Phase 6: Error Handling & Edge Cases
- [ ] 32. Add fallback for browsers with audio restrictions
- [ ] 33. Add detection for audio playback issues
- [ ] 34. Log errors to console for debugging
- [ ] 35. Test error scenarios

## Phase 7: Settings Persistence
- [ ] 36. Create `lib/settings.ts` for managing user preferences
- [ ] 37. Implement localStorage with namespaced key: "hiit-timer-settings"
- [ ] 38. Structure as an object to accommodate future settings:
      ```typescript
      interface UserSettings {
        muted: boolean;
        // Future settings can be added here
      }
      ```
- [ ] 39. Test settings persistence

## Testing Checklist
- [ ] 40. Audio countdown sequence
      - Plays at correct times (3,2,1,rest)
      - Correct timing between numbers
      - Audio quality is good
- [ ] 41. Mute functionality
      - Button toggles audio
      - State persists after refresh
      - Visual feedback is clear
- [ ] 42. Workout integration
      - Stops on workout end
      - Stops on workout pause
      - Resumes correctly
- [ ] 43. Mobile testing
      - Works on iOS Safari
      - Works on Android Chrome
      - Works with screen locked
- [ ] 44. Browser compatibility
      - Chrome
      - Firefox
      - Safari
      - Edge

## Notes
- Complete tasks in order - they build on each other
- Check off tasks as they're completed
- Test thoroughly before marking complete
- Document any issues or blockers
- Ask for help if stuck on any task

## Definition of Done
- All checkboxes are checked
- All tests pass
- No console errors
- Works on all target browsers
- Code reviewed and approved 
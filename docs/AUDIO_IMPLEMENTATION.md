# HIIT Timer Audio Countdown Implementation

## Phase 1: Audio Files Setup
- [ ] 1. Create `public/audio/` directory
- [ ] 2. Add `three.mp3` file
- [ ] 3. Add `two.mp3` file
- [ ] 4. Add `one.mp3` file
- [ ] 5. Add `rest.mp3` file
- [ ] 6. Test audio files in browser
      - Play each file manually
      - Check audio quality
      - Verify file sizes are optimized

## Phase 2: Audio Utility Implementation
- [ ] 7. Create `src/utils/audio.ts`
- [ ] 8. Add TypeScript types:
      ```typescript
      type CountdownSound = 'three' | 'two' | 'one' | 'rest';
      interface AudioUtils {
        playSound: (sound: CountdownSound) => Promise<void>;
        preloadSounds: () => Promise<void>;
      }
      ```
- [ ] 9. Implement `preloadSounds` function
- [ ] 10. Implement `playSound` function
- [ ] 11. Add error handling for audio loading
- [ ] 12. Add error handling for audio playback
- [ ] 13. Test audio utility functions

## Phase 3: Mute Button Component
- [ ] 14. Create `src/components/MuteButton.tsx`
- [ ] 15. Import speaker icons from heroicons
      - Speaker wave icon for unmuted
      - Speaker x-mark icon for muted
- [ ] 16. Style button to match close button
      - Same size and padding
      - Same hover effects
      - Same positioning
- [ ] 17. Implement icon transition animation
      - 300ms duration
      - Rotate transform
      - Fade effect
- [ ] 18. Test button rendering
- [ ] 19. Test button animations

## Phase 4: State Management
- [ ] 20. Open `src/contexts/WorkoutContext.tsx`
- [ ] 21. Add `isMuted` state
- [ ] 22. Add `toggleMute` action
- [ ] 23. Implement localStorage persistence
      - Save mute preference
      - Load preference on init
- [ ] 24. Test state persistence
- [ ] 25. Test state updates

## Phase 5: Timer Integration
- [ ] 26. Add countdown trigger logic
      - Check for 3-second threshold
      - Verify not muted
- [ ] 27. Implement audio cleanup
      - On component unmount
      - On workout end
      - On workout pause
- [ ] 28. Test timer integration
- [ ] 29. Test cleanup functions

## Phase 6: Error Handling & Edge Cases
- [ ] 30. Implement audio loading error handling
- [ ] 31. Implement audio playback error handling
- [ ] 32. Add browser audio blocking detection
- [ ] 33. Test error scenarios

## Testing Checklist
- [ ] 34. Audio countdown sequence
      - Plays at correct times (3,2,1,rest)
      - Correct timing between numbers
      - Audio quality is good
- [ ] 35. Mute functionality
      - Button toggles audio
      - State persists after refresh
      - Visual feedback is clear
- [ ] 36. Workout integration
      - Stops on workout end
      - Stops on workout pause
      - Resumes correctly
- [ ] 37. Mobile testing
      - Works on iOS Safari
      - Works on Android Chrome
      - Works with screen locked
- [ ] 38. Browser compatibility
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
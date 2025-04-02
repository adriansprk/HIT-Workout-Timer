# Audio System Documentation for HIIT Timer

## Overview

The HIIT Timer app uses a modern Web Audio API approach for reliable sound playback, particularly critical for mobile devices. This document explains the architecture, how it works, and provides guidance for future development.

## Architecture

Our audio system is built on the Web Audio API rather than HTML Audio elements because it provides:

1. More precise timing control
2. Better mobile compatibility (especially on iOS)
3. Lower latency playback
4. Buffer-based approach that's more reliable

### Key Components

- **AudioContext**: Single shared audio context for all sounds
- **AudioBuffers**: Pre-decoded sound data stored in memory
- **BufferSourceNodes**: Used for actual sound playback
- **GainNodes**: Control volume

## How the System Works

### Initialization and Unlocking

```typescript
// Initialize all audio systems
initAudio();

// When user interacts (e.g., clicks Start button)
await forceUnlockAudio();
```

Mobile browsers require user interaction before allowing audio playback. We address this by:

1. Attempting to "unlock" audio when the app loads (`initAudio()`)
2. Force-unlocking when the user starts the workout (`forceUnlockAudio()`)
3. Storing unlock status in localStorage for persistence

### Sound Playback

```typescript
// Play a countdown sound
playCountdownSound('three');
```

Behind the scenes, this:
1. Creates a source node from a pre-loaded audio buffer
2. Connects it to the audio graph
3. Starts playback
4. Handles cleanup when playback completes

## Common Pitfalls to Avoid

1. **Never change audio implementation without testing on iOS/Android**
   - Mobile audio has unique constraints that aren't apparent in desktop testing

2. **Keep user interaction before audio playback**
   - Always maintain the pattern where audio is unlocked by user action

3. **Don't create multiple AudioContext instances**
   - Always use the shared context via the provided functions

4. **Avoid direct Audio element creation**
   - The Web Audio API approach was chosen specifically for reliability

5. **Beware of timing issues**
   - Sound playback should be synchronous with visual timer changes

## Adding New Sounds

To add a new countdown sound:

1. Add the sound file to `/public/audio/` (MP3 format recommended)
2. Update the `CountdownSound` type in `lib/audio.ts`:
   ```typescript
   export type CountdownSound = 'three' | 'two' | 'one' | 'rest' | 'go' | 'your-new-sound';
   ```
3. Make sure to include it in preloading:
   ```typescript
   const sounds: CountdownSound[] = ['three', 'two', 'one', 'rest', 'go', 'your-new-sound'];
   ```

## Troubleshooting

### If sounds don't play on mobile:

1. Ensure `forceUnlockAudio()` is called from a user interaction
2. Check browser console for "Audio:" log messages
3. Verify the files exist in `/public/audio/` and are accessible

### If timing is off:

1. Make sure sounds are played at the exact time the display changes
2. The timer component should call audio functions at precise moments

## Testing Recommendations

Always test audio changes on:
1. Desktop browsers (Chrome, Firefox, Safari)
2. iOS devices (both Safari and Chrome)
3. Android devices
4. With various network conditions

## Future Improvements

If enhancing the audio system, consider:

1. Adding sound sprites for faster loading
2. Supporting customizable sounds
3. Implementing volume controls
4. Adding haptic feedback alongside audio

## Timer Integration

The audio system is tightly integrated with the workout timer. The key points of integration are:

1. **Initialization**: Audio is initialized when the app loads and unlocked when the workout starts
2. **Countdown Sounds**: Played at exactly 3, 2, and 1 seconds remaining
3. **Transition Sounds**: 'rest' and 'go' sounds play at phase transitions

The timer uses a reference-based approach to ensure accurate timing:

```typescript
// This setup ensures sounds play at the right visual moment
const tickAndUpdateDisplay = () => {
  // Display current time
  setTimeRemaining(currentTime);
  
  // Play appropriate sound based on the displayed time
  if (currentTime === 3) {
    playCountdownSound('three');
  } 
  // ... other time checks
};
```

## Final Notes

The audio system is designed to be reliable across different devices. The Web Audio API approach solves many common issues with mobile audio playback, but always test thoroughly when making changes to ensure compatibility. 
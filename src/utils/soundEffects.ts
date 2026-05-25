
/**
 * Utility for playing sound effects in the application
 */

// Define the sound types
export type SoundType = "success" | "error" | "scan" | "notification";

// Sound URLs mapping - in a real project these should point to actual sound files
const soundUrls: Record<SoundType, string> = {
  success: "https://assets.mixkit.co/active_storage/sfx/2001/2001.wav",
  error: "https://assets.mixkit.co/active_storage/sfx/2054/2054.wav",
  scan: "https://assets.mixkit.co/active_storage/sfx/1994/1994.wav",
  notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav"
};

/**
 * Play a sound effect with optional volume control
 * 
 * @param soundType - Type of sound to play
 * @param volume - Volume level (0.0 to 1.0), defaults to 0.5
 * @returns Promise that resolves when sound plays or rejects on error
 */
export const playSound = (soundType: SoundType, volume: number = 0.5): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (volume < 0 || volume > 1) {
        volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
      }
      
      const sound = new Audio(soundUrls[soundType]);
      sound.volume = volume;
      
      // Set up event listeners
      sound.onended = () => resolve();
      sound.onerror = (error) => reject(new Error(`Sound playback error: ${error}`));
      
      const playPromise = sound.play();
      
      // Handle promise rejection (playback issues)
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch(error => {
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if the device supports audio playback
 * @returns boolean indicating audio support
 */
export const isAudioSupported = (): boolean => {
  try {
    return typeof Audio !== 'undefined';
  } catch (e) {
    return false;
  }
};

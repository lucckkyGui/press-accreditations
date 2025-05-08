
/**
 * Utility for playing sound effects in the application
 */
export const playSound = (soundType: "success" | "error" | "scan" | "notification") => {
  try {
    let sound: HTMLAudioElement;
    
    // Sound URLs - in a real project these should point to actual sound files
    const soundUrls = {
      success: "https://assets.mixkit.co/active_storage/sfx/2001/2001.wav",
      error: "https://assets.mixkit.co/active_storage/sfx/2054/2054.wav",
      scan: "https://assets.mixkit.co/active_storage/sfx/1994/1994.wav",
      notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav"
    };
    
    sound = new Audio(soundUrls[soundType]);
    sound.volume = 0.5; // 50% volume
    
    const playPromise = sound.play();
    
    // Handle promise rejection (playback issues)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Cannot play sound:", error);
      });
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

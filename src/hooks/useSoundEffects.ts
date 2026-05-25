
import { useCallback } from 'react';
import { playSound, SoundType, isAudioSupported } from '@/utils/soundEffects';

export const useSoundEffects = () => {
  const playSoundEffect = useCallback((soundType: SoundType, volume: number = 0.5) => {
    // Check if audio is supported in the current browser
    if (isAudioSupported()) {
      return playSound(soundType, volume).catch(error => {
      });
    }
    return Promise.resolve();
  }, []);

  return { playSoundEffect };
};

export default useSoundEffects;

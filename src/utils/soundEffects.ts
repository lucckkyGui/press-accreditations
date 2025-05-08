
// Funkcja do odtwarzania dźwięków
export const playSound = (soundType: "success" | "error" | "scan" | "notification") => {
  try {
    let sound: HTMLAudioElement;
    
    // W prawdziwym projekcie te URL-e powinny wskazywać na pliki dźwiękowe
    const soundUrls = {
      success: "https://assets.mixkit.co/active_storage/sfx/2001/2001.wav",
      error: "https://assets.mixkit.co/active_storage/sfx/2054/2054.wav",
      scan: "https://assets.mixkit.co/active_storage/sfx/1994/1994.wav",
      notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav"
    };
    
    sound = new Audio(soundUrls[soundType]);
    sound.volume = 0.5; // 50% głośności
    
    const playPromise = sound.play();
    
    // Obsługa odrzucenia obietnicy (problemy z odtwarzaniem)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Nie można odtworzyć dźwięku:", error);
      });
    }
  } catch (error) {
    console.error("Błąd podczas odtwarzania dźwięku:", error);
  }
};

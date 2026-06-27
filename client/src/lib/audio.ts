let audioCtx: AudioContext | null = null;
let alarmInterval: any = null;

export function playAlarm() {
  if (alarmInterval) return; // Already playing
  
  if (typeof window === "undefined") return;

  try {
    // Initialize Web Audio API context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    // Play double-beep oscillator tone every 1.5 seconds
    alarmInterval = setInterval(() => {
      if (!audioCtx || audioCtx.state === "closed") return;
      
      // First beep
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5 note (clear alert pitch)
      gain1.gain.setValueAtTime(0, audioCtx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.3);
      
      // Second beep (300ms later)
      setTimeout(() => {
        if (!audioCtx || audioCtx.state === "closed") return;
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0, audioCtx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.3);
      }, 300);
      
    }, 1500);
  } catch (e) {
    console.error("Web Audio API not supported or blocked by autoplay restrictions:", e);
  }
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

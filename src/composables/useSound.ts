import { ref } from 'vue'

export function useSound() {
  const audioContext = ref<AudioContext | null>(null)

  function getContext(): AudioContext {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }
    return audioContext.value
  }

  function playBeep(frequency: number, duration: number, volume: number = 0.3) {
    try {
      const ctx = getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Failed to play sound:', e)
    }
  }

  function playCountdownBeep() {
    playBeep(880, 0.15, 0.4)
  }

  function playTransitionBeep() {
    playBeep(1200, 0.25, 0.5)
  }

  function playCompletionSound() {
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        const startTime = now + i * 0.15
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.4)
      })
    } catch (e) {
      console.warn('Failed to play completion sound:', e)
    }
  }

  function resumeContext() {
    if (audioContext.value && audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }
  }

  return {
    playCountdownBeep,
    playTransitionBeep,
    playCompletionSound,
    resumeContext
  }
}

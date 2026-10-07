import { ref } from 'vue'
import NoSleep from 'nosleep.js'

// Shared singleton: the timer and the UI indicator must talk to the same instance.
let noSleep: NoSleep | null = null
const isActive = ref(false)

function getNoSleep(): NoSleep | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  if (!noSleep) {
    try {
      noSleep = new NoSleep()
    } catch (e) {
      console.warn('Failed to initialize wake lock:', e)
      return null
    }
  }
  return noSleep
}

/**
 * Keeps the screen lit while a routine is running.
 *
 * Uses NoSleep.js under the hood, which prefers the native Screen Wake Lock
 * API (supported on modern iPhones) and falls back to a hidden looping
 * video on older iOS versions where the API is unavailable.
 *
 * Must be requested from a user gesture (e.g. the Start button) for the
 * iOS fallback to be allowed to play video.
 */
export function useWakeLock() {
  async function requestWakeLock(): Promise<void> {
    const ns = getNoSleep()
    if (!ns || isActive.value) return
    try {
      await ns.enable()
      isActive.value = ns.isEnabled
    } catch (e) {
      console.warn('Failed to acquire wake lock:', e)
    }
  }

  function releaseWakeLock(): void {
    if (!noSleep || !isActive.value) return
    try {
      noSleep.disable()
    } catch (e) {
      console.warn('Failed to release wake lock:', e)
    }
    isActive.value = false
  }

  return {
    isWakeLockActive: isActive,
    requestWakeLock,
    releaseWakeLock,
  }
}

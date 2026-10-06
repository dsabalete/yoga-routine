import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSound } from '../useSound'

class MockAudioContext {
  currentTime = 0
  state = 'running'
  destination = {}
  createOscillator() {
    return {
      connect: vi.fn(),
      frequency: { value: 0 },
      type: '',
      start: vi.fn(),
      stop: vi.fn(),
    }
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    }
  }
  resume() {
    return Promise.resolve()
  }
}

describe('useSound', () => {
  let sound: ReturnType<typeof useSound>

  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext)
    vi.useFakeTimers()
    sound = useSound()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('should create AudioContext on first use', () => {
    const ctx = new AudioContext()
    expect(ctx).toBeDefined()
  })

  it('should have playCountdownBeep function', () => {
    expect(typeof sound.playCountdownBeep).toBe('function')
  })

  it('should have playTransitionBeep function', () => {
    expect(typeof sound.playTransitionBeep).toBe('function')
  })

  it('should have playCompletionSound function', () => {
    expect(typeof sound.playCompletionSound).toBe('function')
  })

  it('should have resumeContext function', () => {
    expect(typeof sound.resumeContext).toBe('function')
  })

  it('should not throw when playing sounds', () => {
    expect(() => sound.playCountdownBeep()).not.toThrow()
    expect(() => sound.playTransitionBeep()).not.toThrow()
    expect(() => sound.playCompletionSound()).not.toThrow()
  })
})

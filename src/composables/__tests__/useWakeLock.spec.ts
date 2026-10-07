import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  enable: vi.fn(),
  disable: vi.fn(),
}))

vi.mock('nosleep.js', () => ({
  default: class MockNoSleep {
    enable = mocks.enable
    disable = mocks.disable
    isEnabled = true
  },
}))

import { useWakeLock } from '../useWakeLock'
import { useYogaRoutine } from '../useYogaRoutine'

describe('useWakeLock', () => {
  beforeEach(() => {
    mocks.enable.mockReset().mockResolvedValue(undefined)
    mocks.disable.mockReset()
    // Reset the shared singleton state between tests
    useWakeLock().releaseWakeLock()
    mocks.disable.mockClear()
  })

  it('should acquire the wake lock on request', async () => {
    const { isWakeLockActive, requestWakeLock } = useWakeLock()
    await requestWakeLock()
    expect(mocks.enable).toHaveBeenCalledOnce()
    expect(isWakeLockActive.value).toBe(true)
  })

  it('should not re-acquire when already active', async () => {
    const { requestWakeLock } = useWakeLock()
    await requestWakeLock()
    await requestWakeLock()
    expect(mocks.enable).toHaveBeenCalledOnce()
  })

  it('should release the wake lock', async () => {
    const { isWakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock()
    await requestWakeLock()
    releaseWakeLock()
    expect(mocks.disable).toHaveBeenCalledOnce()
    expect(isWakeLockActive.value).toBe(false)
  })

  it('should stay inactive when acquiring fails', async () => {
    mocks.enable.mockRejectedValueOnce(new Error('denied'))
    const { isWakeLockActive, requestWakeLock } = useWakeLock()
    await requestWakeLock()
    expect(isWakeLockActive.value).toBe(false)
  })
})

describe('wake lock timer integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    mocks.enable.mockReset().mockResolvedValue(undefined)
    mocks.disable.mockReset()
    useWakeLock().releaseWakeLock()
    mocks.disable.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should acquire wake lock on start and release on stop', async () => {
    const routine = useYogaRoutine()
    routine.addExercise({
      id: 'pose-1',
      name: 'Mountain Pose',
      sanskrit: 'Tadasana',
      description: 'Stand tall',
      category: 'standing',
      difficulty: 'beginner',
      defaultDuration: 30,
    })
    routine.startTimer()
    await vi.waitFor(() => {
      expect(mocks.enable).toHaveBeenCalled()
    })
    routine.stopTimer()
    expect(mocks.disable).toHaveBeenCalled()
    routine.cleanup()
  })
})

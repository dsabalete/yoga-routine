import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useYogaRoutine } from '../useYogaRoutine'

// Wake lock is irrelevant to routine logic; stub it so jsdom doesn't hit
// the real NoSleep video fallback (HTMLMediaElement.play is unimplemented).
vi.mock('nosleep.js', () => ({
  default: class MockNoSleep {
    enable = vi.fn().mockResolvedValue(undefined)
    disable = vi.fn()
    isEnabled = true
  },
}))

const mockExercises = [
  {
    id: 'pose-1',
    name: 'Mountain Pose',
    sanskrit: 'Tadasana',
    description: 'Stand tall',
    category: 'standing',
    difficulty: 'beginner',
    defaultDuration: 30,
  },
  {
    id: 'pose-2',
    name: 'Downward Dog',
    sanskrit: 'Adho Mukha Svanasana',
    description: 'Inverted V',
    category: 'inversion',
    difficulty: 'beginner',
    defaultDuration: 45,
  },
  {
    id: 'pose-3',
    name: 'Child Pose',
    sanskrit: 'Balasana',
    description: 'Rest',
    category: 'restorative',
    difficulty: 'beginner',
    defaultDuration: 60,
  },
]

describe('useYogaRoutine', () => {
  let routine: ReturnType<typeof useYogaRoutine>

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    routine = useYogaRoutine()
    routine.initializeExercises(mockExercises)
  })

  afterEach(() => {
    vi.useRealTimers()
    routine.cleanup()
  })

  describe('initialization', () => {
    it('should initialize with empty routine', () => {
      expect(routine.routineExercises.value).toEqual([])
      expect(routine.currentIndex.value).toBe(0)
      expect(routine.isRunning.value).toBe(false)
      expect(routine.isPaused.value).toBe(false)
    })

    it('should load exercises from JSON', () => {
      expect(routine.allExercises.value).toHaveLength(3)
      expect(routine.allExercises.value[0].name).toBe('Mountain Pose')
    })
  })

  describe('addExercise', () => {
    it('should add exercise to routine with default duration', () => {
      routine.addExercise(mockExercises[0])
      expect(routine.routineExercises.value).toHaveLength(1)
      expect(routine.routineExercises.value[0].name).toBe('Mountain Pose')
      expect(routine.routineExercises.value[0].duration).toBe(30)
    })

    it('should add multiple exercises in order', () => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
      expect(routine.routineExercises.value).toHaveLength(2)
      expect(routine.routineExercises.value[0].order).toBe(0)
      expect(routine.routineExercises.value[1].order).toBe(1)
    })

    it('should persist routine to localStorage', () => {
      routine.addExercise(mockExercises[0])
      const stored = localStorage.getItem('yoga-routine')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('pose-1')
    })
  })

  describe('removeExercise', () => {
    beforeEach(() => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
      routine.addExercise(mockExercises[2])
    })

    it('should remove exercise at index', () => {
      routine.removeExercise(1)
      expect(routine.routineExercises.value).toHaveLength(2)
      expect(routine.routineExercises.value[1].name).toBe('Child Pose')
    })

    it('should reorder after removal', () => {
      routine.removeExercise(0)
      expect(routine.routineExercises.value[0].order).toBe(0)
      expect(routine.routineExercises.value[1].order).toBe(1)
    })
  })

  describe('moveExercise', () => {
    beforeEach(() => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
      routine.addExercise(mockExercises[2])
    })

    it('should move exercise from one position to another', () => {
      routine.moveExercise(0, 2)
      expect(routine.routineExercises.value[0].name).toBe('Downward Dog')
      expect(routine.routineExercises.value[2].name).toBe('Mountain Pose')
    })

    it('should update order after move', () => {
      routine.moveExercise(0, 1)
      expect(routine.routineExercises.value[0].order).toBe(0)
      expect(routine.routineExercises.value[1].order).toBe(1)
      expect(routine.routineExercises.value[2].order).toBe(2)
    })
  })

  describe('updateExerciseDuration', () => {
    beforeEach(() => {
      routine.addExercise(mockExercises[0])
    })

    it('should update duration', () => {
      routine.updateExerciseDuration(0, 60)
      expect(routine.routineExercises.value[0].duration).toBe(60)
    })

    it('should not allow duration less than 1', () => {
      routine.updateExerciseDuration(0, 0)
      expect(routine.routineExercises.value[0].duration).toBe(1)
    })
  })

  describe('timer', () => {
    beforeEach(() => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
    })

    it('should start timer and set first exercise', () => {
      routine.startTimer()
      expect(routine.isRunning.value).toBe(true)
      expect(routine.currentIndex.value).toBe(0)
      expect(routine.timeRemaining.value).toBe(30)
    })

    it('should countdown time remaining', () => {
      routine.startTimer()
      vi.advanceTimersByTime(5000)
      expect(routine.timeRemaining.value).toBe(25)
      expect(routine.elapsedTime.value).toBe(5)
    })

    it('should pause timer', () => {
      routine.startTimer()
      vi.advanceTimersByTime(3000)
      routine.pauseTimer()
      expect(routine.isPaused.value).toBe(true)
      const timeAtPause = routine.timeRemaining.value
      vi.advanceTimersByTime(5000)
      expect(routine.timeRemaining.value).toBe(timeAtPause)
    })

    it('should resume timer', () => {
      routine.startTimer()
      routine.pauseTimer()
      routine.resumeTimer()
      expect(routine.isPaused.value).toBe(false)
      expect(routine.isRunning.value).toBe(true)
    })

    it('should advance to next exercise when time expires', () => {
      routine.startTimer()
      vi.advanceTimersByTime(31000)
      expect(routine.currentIndex.value).toBe(1)
      expect(routine.timeRemaining.value).toBe(45)
    })

    it('should stop timer and reset', () => {
      routine.startTimer()
      vi.advanceTimersByTime(5000)
      routine.stopTimer()
      expect(routine.isRunning.value).toBe(false)
      expect(routine.currentIndex.value).toBe(0)
      expect(routine.timeRemaining.value).toBe(30)
    })

    it('should complete routine after last exercise', () => {
      routine.startTimer()
      vi.advanceTimersByTime(77000)
      expect(routine.isRunning.value).toBe(false)
      expect(routine.currentIndex.value).toBe(0)
    })
  })

  describe('clearRoutine', () => {
    it('should clear all exercises', () => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
      routine.clearRoutine()
      expect(routine.routineExercises.value).toHaveLength(0)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      routine.addExercise(mockExercises[0])
      routine.addExercise(mockExercises[1])
    })

    it('should calculate total duration', () => {
      expect(routine.totalDuration.value).toBe(75)
    })

    it('should format time remaining', () => {
      routine.startTimer()
      vi.advanceTimersByTime(5000)
      expect(routine.formattedTimeRemaining.value).toBe('0:25')
    })

    it('should calculate progress', () => {
      routine.startTimer()
      vi.advanceTimersByTime(15000)
      expect(routine.progress.value).toBeCloseTo(20, 0)
    })
  })

  describe('localStorage persistence', () => {
    it('should load routine from localStorage on init', () => {
      const stored = [
        { ...mockExercises[0], duration: 45, order: 0 },
        { ...mockExercises[1], duration: 60, order: 1 },
      ]
      localStorage.setItem('yoga-routine', JSON.stringify(stored))
      const newRoutine = useYogaRoutine()
      expect(newRoutine.routineExercises.value).toHaveLength(2)
      expect(newRoutine.routineExercises.value[0].duration).toBe(45)
    })
  })
})

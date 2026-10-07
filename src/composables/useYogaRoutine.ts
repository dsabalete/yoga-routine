import { ref, computed, watch } from 'vue'
import { useSound } from './useSound'
import { useWakeLock } from './useWakeLock'

export interface Exercise {
  id: string
  name: string
  sanskrit: string
  description: string
  category: string
  difficulty: string
  defaultDuration: number
}

export interface RoutineExercise extends Exercise {
  duration: number
  order: number
}

export interface RoutineState {
  exercises: RoutineExercise[]
  currentIndex: number
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number
  totalDuration: number
  elapsedTime: number
}

const STORAGE_KEY = 'yoga-routine'

// Transition break between poses, giving the user time to move into the next pose.
export const TRANSITION_BREAK_SECONDS = 3

// Load exercises from JSON file
export async function loadExercises(): Promise<Exercise[]> {
  const response = await fetch('/exercises.json')
  if (!response.ok) {
    throw new Error('Failed to load exercises')
  }
  return response.json()
}

// Load routine from localStorage
function loadRoutineFromStorage(): RoutineExercise[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load routine from storage:', e)
  }
  return []
}

// Save routine to localStorage
function saveRoutineToStorage(exercises: RoutineExercise[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises))
  } catch (e) {
    console.warn('Failed to save routine to storage:', e)
  }
}

export function useYogaRoutine() {
  const { playCountdownBeep, playTransitionBeep, playCompletionSound, resumeContext } = useSound()
  const { isWakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock()
  const allExercises = ref<Exercise[]>([])
  const routineExercises = ref<RoutineExercise[]>(loadRoutineFromStorage())
  const currentIndex = ref(0)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const timeRemaining = ref(0)
  const elapsedTime = ref(0)
  const isResting = ref(false)
  const restRemaining = ref(0)

  let timerInterval: ReturnType<typeof setInterval> | null = null

  // Computed properties
  const currentExercise = computed(() => routineExercises.value[currentIndex.value] || null)
  const totalDuration = computed(() => routineExercises.value.reduce((sum, ex) => sum + ex.duration, 0))
  const progress = computed(() => {
    if (routineExercises.value.length === 0) return 0
    const completedTime = routineExercises.value.slice(0, currentIndex.value).reduce((sum, ex) => sum + ex.duration, 0)
    const currentProgress = currentExercise.value ? (currentExercise.value.duration - timeRemaining.value) : 0
    return Math.min(100, ((completedTime + currentProgress) / totalDuration.value) * 100)
  })
  const isComplete = computed(() => currentIndex.value >= routineExercises.value.length)
  const upcomingExercise = computed(() =>
    isResting.value ? routineExercises.value[currentIndex.value + 1] || null : null
  )
  const formattedTimeRemaining = computed(() => formatTime(timeRemaining.value))
  const formattedRestRemaining = computed(() => formatTime(restRemaining.value))
  const formattedTotalDuration = computed(() => formatTime(totalDuration.value))
  const formattedElapsedTime = computed(() => formatTime(elapsedTime.value))

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function tick() {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      elapsedTime.value++
      if (timeRemaining.value <= 3 && timeRemaining.value > 0) {
        playCountdownBeep()
      }
    } else {
      nextExercise()
    }
  }

  function initializeExercises(exercises: Exercise[]) {
    allExercises.value = exercises
    // Initialize duration for routine exercises if not set
    routineExercises.value = routineExercises.value.map((ex, index) => ({
      ...ex,
      duration: ex.duration || allExercises.value.find(e => e.id === ex.id)?.defaultDuration || 30,
      order: index
    }))
  }

  function addExercise(exercise: Exercise) {
    const newRoutineExercise: RoutineExercise = {
      ...exercise,
      duration: exercise.defaultDuration,
      order: routineExercises.value.length
    }
    routineExercises.value = [...routineExercises.value, newRoutineExercise]
    saveRoutineToStorage(routineExercises.value)
  }

  function removeExercise(index: number) {
    routineExercises.value = routineExercises.value.filter((_, i) => i !== index)
    // Reorder
    routineExercises.value = routineExercises.value.map((ex, i) => ({ ...ex, order: i }))
    saveRoutineToStorage(routineExercises.value)
    // Adjust current index if needed
    if (currentIndex.value >= routineExercises.value.length) {
      currentIndex.value = Math.max(0, routineExercises.value.length - 1)
    }
  }

  function moveExercise(fromIndex: number, toIndex: number) {
    const newExercises = [...routineExercises.value]
    const [moved] = newExercises.splice(fromIndex, 1)
    newExercises.splice(toIndex, 0, moved)
    routineExercises.value = newExercises.map((ex, i) => ({ ...ex, order: i }))
    saveRoutineToStorage(routineExercises.value)
  }

  function updateExerciseDuration(index: number, duration: number) {
    routineExercises.value = routineExercises.value.map((ex, i) =>
      i === index ? { ...ex, duration: Math.max(1, duration) } : ex
    )
    saveRoutineToStorage(routineExercises.value)
    // Update time remaining if it's the current exercise
    if (index === currentIndex.value && !isRunning.value) {
      timeRemaining.value = routineExercises.value[index]?.duration || 0
    }
  }

  function clearRoutine() {
    routineExercises.value = []
    saveRoutineToStorage([])
    resetTimer()
  }

  function startTimer() {
    if (routineExercises.value.length === 0) return

    resumeContext()

    if (!isRunning.value && !isPaused.value) {
      currentIndex.value = 0
      timeRemaining.value = routineExercises.value[0]?.duration || 0
      elapsedTime.value = 0
    }

    isRunning.value = true
    isPaused.value = false

    // Keep the screen lit while the routine runs (e.g. iPhone auto-lock).
    // Fire-and-forget: a wake lock failure must never break the timer.
    void requestWakeLock()

    timerInterval = setInterval(tick, 1000)
  }

  function pauseTimer() {
    if (isRunning.value && !isPaused.value) {
      isPaused.value = true
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }

  function resumeTimer() {
    if (isRunning.value && isPaused.value) {
      resumeContext()
      isPaused.value = false
      void requestWakeLock()
      timerInterval = setInterval(tick, 1000)
    }
  }

  function stopTimer() {
    isRunning.value = false
    isPaused.value = false
    releaseWakeLock()
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    currentIndex.value = 0
    timeRemaining.value = routineExercises.value[0]?.duration || 0
    elapsedTime.value = 0
  }

  function resetTimer() {
    stopTimer()
    currentIndex.value = 0
    timeRemaining.value = routineExercises.value[0]?.duration || 0
    elapsedTime.value = 0
  }

  function nextExercise() {
    if (currentIndex.value < routineExercises.value.length - 1) {
      playTransitionBeep()
      currentIndex.value++
      timeRemaining.value = routineExercises.value[currentIndex.value]?.duration || 0
    } else {
      stopTimer()
      playCompletionSound()
    }
  }

  function previousExercise() {
    if (currentIndex.value > 0) {
      currentIndex.value--
      timeRemaining.value = routineExercises.value[currentIndex.value]?.duration || 0
      elapsedTime.value = Math.max(0, elapsedTime.value - (routineExercises.value[currentIndex.value + 1]?.duration || 0))
    }
  }

  function jumpToExercise(index: number) {
    if (index >= 0 && index < routineExercises.value.length) {
      const wasRunning = isRunning.value
      if (wasRunning) {
        pauseTimer()
      }
      currentIndex.value = index
      timeRemaining.value = routineExercises.value[index]?.duration || 0
      // Recalculate elapsed time
      elapsedTime.value = routineExercises.value.slice(0, index).reduce((sum, ex) => sum + ex.duration, 0)
      if (wasRunning) {
        resumeTimer()
      }
    }
  }

  // Watch for routine changes to save
  watch(routineExercises, (newExercises) => {
    saveRoutineToStorage(newExercises)
  }, { deep: true })

  // Cleanup on unmount
  function cleanup() {
    releaseWakeLock()
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  return {
    // State
    allExercises,
    routineExercises,
    currentIndex,
    isRunning,
    isPaused,
    timeRemaining,
    elapsedTime,
    isWakeLockActive,

    // Computed
    currentExercise,
    totalDuration,
    progress,
    isComplete,
    formattedTimeRemaining,
    formattedTotalDuration,
    formattedElapsedTime,

    // Methods
    initializeExercises,
    addExercise,
    removeExercise,
    moveExercise,
    updateExerciseDuration,
    clearRoutine,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    nextExercise,
    previousExercise,
    jumpToExercise,
    cleanup
  }
}
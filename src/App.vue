<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useYogaRoutine } from './composables/useYogaRoutine'
import ExerciseList from './components/ExerciseList.vue'
import RoutineBuilder from './components/RoutineBuilder.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import TimerControls from './components/TimerControls.vue'

const {
  allExercises,
  routineExercises,
  currentIndex,
  isRunning,
  isPaused,
  timeRemaining,
  currentExercise,
  upcomingExercise,
  totalDuration,
  progress,
  isComplete,
  isWakeLockActive,
  isResting,
  formattedTimeRemaining,
  formattedRestRemaining,
  formattedTotalDuration,
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
  cleanup
} = useYogaRoutine()

onMounted(async () => {
  try {
    const response = await fetch('/exercises.json')
    if (!response.ok) throw new Error('Failed to load exercises')
    const exercises = await response.json()
    initializeExercises(exercises)
  } catch (e) {
    console.error('Failed to load exercises:', e)
  }
})

onUnmounted(() => {
  cleanup()
})

function handleAddExercise(exercise: typeof allExercises.value[0]) {
  addExercise(exercise)
}

function handleMoveExercise(from: number, to: number) {
  moveExercise(from, to)
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Yoga Routine</h1>
      <p class="subtitle">Build your perfect yoga sequence</p>
      <p v-if="isWakeLockActive" class="wake-lock-badge">Screen will stay awake</p>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <ExerciseList
          :exercises="allExercises"
          :routine-exercises="routineExercises"
          @add="handleAddExercise"
        />
      </div>

      <div class="center-panel">
        <TimerDisplay
          :current-exercise="currentExercise"
          :upcoming-exercise="upcomingExercise"
          :time-remaining="timeRemaining"
          :total-duration="totalDuration"
          :current-index="currentIndex"
          :total-exercises="routineExercises.length"
          :is-running="isRunning"
          :is-paused="isPaused"
          :is-complete="isComplete"
          :is-resting="isResting"
          :formatted-time-remaining="formattedTimeRemaining"
          :formatted-rest-remaining="formattedRestRemaining"
          :formatted-total-duration="formattedTotalDuration"
          :progress="progress"
        />

        <TimerControls
          :is-running="isRunning"
          :is-paused="isPaused"
          :is-complete="isComplete"
          :has-exercises="routineExercises.length > 0"
          @start="startTimer"
          @pause="pauseTimer"
          @resume="resumeTimer"
          @stop="stopTimer"
        />
      </div>

      <div class="right-panel">
        <RoutineBuilder
          :routine-exercises="routineExercises"
          :current-index="currentIndex"
          :is-running="isRunning"
          :on-remove="removeExercise"
          :on-move="handleMoveExercise"
          :on-update-duration="updateExerciseDuration"
          :on-clear="clearRoutine"
        />
      </div>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f7fafc;
  color: #2d3748;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  text-align: center;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.wake-lock-badge {
  display: inline-block;
  margin: 0.5rem 0 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.center-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .center-panel {
    order: -1;
  }
}
</style>
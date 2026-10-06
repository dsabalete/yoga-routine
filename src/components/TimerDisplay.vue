<script setup lang="ts">
import { computed } from 'vue'
import type { RoutineExercise } from '../composables/useYogaRoutine'

interface Props {
  currentExercise: RoutineExercise | null
  timeRemaining: number
  totalDuration: number
  currentIndex: number
  totalExercises: number
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  formattedTimeRemaining: string
  formattedTotalDuration: string
  progress: number
}

const props = defineProps<Props>()

const progressDegrees = computed(() => (props.progress / 100) * 360)

const statusText = computed(() => {
  if (props.isComplete) return 'Routine Complete!'
  if (props.isPaused) return 'Paused'
  if (props.isRunning) return 'In Progress'
  return 'Ready'
})
</script>

<template>
  <div class="timer-display" :class="{ 'is-running': isRunning, 'is-paused': isPaused, 'is-complete': isComplete }">
    <div class="status-badge">{{ statusText }}</div>

    <div v-if="currentExercise" class="current-pose-info">
      <h2 class="pose-name">{{ currentExercise.name }}</h2>
      <p class="pose-sanskrit">{{ currentExercise.sanskrit }}</p>
      <p class="pose-description">{{ currentExercise.description }}</p>
    </div>

    <div v-else class="no-pose">
      <p>No pose selected</p>
    </div>

    <div class="timer-circle">
      <svg class="progress-ring" viewBox="0 0 200 200">
        <circle
          class="progress-ring-bg"
          cx="100"
          cy="100"
          r="90"
        />
        <circle
          class="progress-ring-fill"
          cx="100"
          cy="100"
          r="90"
          :stroke-dasharray="565.48"
          :stroke-dashoffset="565.48 - (565.48 * progressDegrees / 360)"
        />
      </svg>
      <div class="timer-text">
        <span class="time-remaining">{{ formattedTimeRemaining }}</span>
        <span class="time-total">/ {{ formattedTotalDuration }}</span>
      </div>
    </div>

    <div class="pose-counter">
      Pose {{ currentIndex + 1 }} of {{ totalExercises }}
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<style scoped>
.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.timer-display.is-running {
  box-shadow: 0 4px 30px rgba(66, 153, 225, 0.2);
}

.timer-display.is-paused {
  box-shadow: 0 4px 30px rgba(237, 137, 54, 0.2);
}

.timer-display.is-complete {
  box-shadow: 0 4px 30px rgba(72, 187, 120, 0.3);
}

.status-badge {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #edf2f7;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.is-running .status-badge {
  background: #ebf8ff;
  color: #2b6cb0;
}

.is-paused .status-badge {
  background: #fffaf0;
  color: #c05621;
}

.is-complete .status-badge {
  background: #f0fff4;
  color: #276749;
}

.current-pose-info {
  text-align: center;
  margin-bottom: 2rem;
}

.pose-name {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  color: #1a202c;
}

.pose-sanskrit {
  margin: 0 0 0.75rem;
  font-style: italic;
  font-size: 1.1rem;
  color: #718096;
}

.pose-description {
  margin: 0;
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  max-width: 400px;
}

.no-pose {
  text-align: center;
  color: #a0aec0;
  margin-bottom: 2rem;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 1.5rem;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 12;
}

.progress-ring-fill {
  fill: none;
  stroke: #4299e1;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.is-paused .progress-ring-fill {
  stroke: #ed8936;
}

.is-complete .progress-ring-fill {
  stroke: #48bb78;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-remaining {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #1a202c;
  font-family: monospace;
  line-height: 1;
}

.time-total {
  display: block;
  font-size: 1rem;
  color: #a0aec0;
  margin-top: 0.25rem;
}

.pose-counter {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 1rem;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #48bb78);
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>
<script setup lang="ts">
interface Props {
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  hasExercises: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  start: []
  pause: []
  resume: []
  stop: []
}>()
</script>

<template>
  <div class="timer-controls">
    <button
      v-if="!isRunning && !isPaused"
      class="control-btn start-btn"
      :disabled="!hasExercises || isComplete"
      @click="$emit('start')"
    >
      <span class="btn-icon">▶</span>
      <span class="btn-label">Start</span>
    </button>

    <template v-else>
      <button
        v-if="!isPaused"
        class="control-btn pause-btn"
        @click="$emit('pause')"
      >
        <span class="btn-icon">⏸</span>
        <span class="btn-label">Pause</span>
      </button>

      <button
        v-else
        class="control-btn resume-btn"
        @click="$emit('resume')"
      >
        <span class="btn-icon">▶</span>
        <span class="btn-label">Resume</span>
      </button>

      <button
        class="control-btn stop-btn"
        @click="$emit('stop')"
      >
        <span class="btn-icon">⏹</span>
        <span class="btn-label">Stop</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 120px;
  height: 120px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.control-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 2rem;
  line-height: 1;
}

.btn-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.start-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
}

.pause-btn {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.4);
}

.resume-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
}

.stop-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
}
</style>
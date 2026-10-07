<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoutineExercise } from '../composables/useYogaRoutine'
import PoseImage from './PoseImage.vue'

interface Props {
  routineExercises: RoutineExercise[]
  onRemove: (index: number) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onUpdateDuration: (index: number, duration: number) => void
  onClear: () => void
  currentIndex: number
  isRunning: boolean
}

const props = defineProps<Props>()

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function handleDragStart(index: number) {
  draggedIndex.value = index
}

function handleDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  dragOverIndex.value = index
}

function handleDragLeave() {
  dragOverIndex.value = null
}

function handleDrop(index: number) {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    props.onMove(draggedIndex.value, index)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

function handleDurationChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const duration = parseInt(target.value, 10)
  if (!isNaN(duration) && duration > 0) {
    props.onUpdateDuration(index, duration)
  }
}

const totalDuration = computed(() =>
  props.routineExercises.reduce((sum, ex) => sum + ex.duration, 0)
)

function formatTotalTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="routine-builder">
    <div class="builder-header">
      <h2>Your Routine</h2>
      <div class="routine-summary">
        <span>{{ routineExercises.length }} poses</span>
        <span class="total-time">{{ formatTotalTime(totalDuration) }}</span>
      </div>
    </div>

    <div v-if="routineExercises.length === 0" class="empty-routine">
      <p>No poses in your routine yet.</p>
      <p class="hint">Add poses from the list on the left to build your sequence.</p>
    </div>

    <div v-else class="routine-list">
      <div
        v-for="(exercise, index) in routineExercises"
        :key="exercise.id"
        class="routine-item"
        :class="{
          'current-pose': index === currentIndex && isRunning,
          'completed': index < currentIndex && isRunning,
          'dragging': draggedIndex === index,
          'drag-over': dragOverIndex === index
        }"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover="handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(index)"
        @dragend="() => { draggedIndex = null; dragOverIndex = null }"
      >
        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
        <PoseImage :id="exercise.id" :name="exercise.name" :image="exercise.image" size="small" />
        <div class="pose-info">
          <div class="pose-header">
            <span class="pose-number">{{ index + 1 }}</span>
            <h3>{{ exercise.name }}</h3>
            <span class="pose-sanskrit">{{ exercise.sanskrit }}</span>
          </div>
          <div class="pose-duration">
            <label>
              Duration:
              <input
                type="number"
                :value="exercise.duration"
                @change="handleDurationChange(index, $event)"
                min="1"
                max="600"
                class="duration-input"
              />
              <span class="unit">seconds</span>
            </label>
          </div>
        </div>
        <button
          class="remove-btn"
          @click="onRemove(index)"
          :disabled="isRunning"
          title="Remove from routine"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="routineExercises.length > 0" class="builder-actions">
      <button class="clear-btn" @click="onClear" :disabled="isRunning">
        Clear Routine
      </button>
    </div>
  </div>
</template>

<style scoped>
.routine-builder {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f7fafc;
  border-left: 1px solid #e2e8f0;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.builder-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.routine-summary {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.total-time {
  font-weight: 600;
  color: #4299e1;
  font-family: monospace;
}

.empty-routine {
  text-align: center;
  padding: 3rem 1rem;
  color: #a0aec0;
}

.empty-routine .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.routine-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.routine-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.routine-item:hover {
  border-color: #cbd5e0;
}

.routine-item.current-pose {
  border-color: #4299e1;
  background: #ebf8ff;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.routine-item.completed {
  opacity: 0.6;
  border-color: #48bb78;
  background: #f0fff4;
}

.routine-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.routine-item.drag-over {
  border-color: #4299e1;
  background: #ebf8ff;
}

.drag-handle {
  cursor: grab;
  color: #a0aec0;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.pose-info {
  flex: 1;
  min-width: 0;
}

.pose-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.pose-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
}

.routine-item.current-pose .pose-number {
  background: #4299e1;
  color: white;
}

.routine-item.completed .pose-number {
  background: #48bb78;
  color: white;
}

.pose-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1a202c;
  flex: 1;
}

.pose-sanskrit {
  font-style: italic;
  font-size: 0.8rem;
  color: #718096;
}

.pose-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pose-duration label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #4a5568;
  cursor: pointer;
}

.duration-input {
  width: 60px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.duration-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.unit {
  font-size: 0.75rem;
  color: #a0aec0;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: #fed7d7;
  color: #c53030;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover:not(:disabled) {
  background: #fc8181;
  color: white;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.builder-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.clear-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #fed7d7;
  color: #c53030;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover:not(:disabled) {
  background: #fc8181;
  color: white;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
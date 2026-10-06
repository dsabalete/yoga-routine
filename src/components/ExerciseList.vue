<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Exercise } from '../composables/useYogaRoutine'

interface Props {
  exercises: Exercise[]
  routineExercises: { id: string }[]
  onAdd: (exercise: Exercise) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{ filter: [value: string] }>()

const searchQuery = ref('')

const filteredExercises = computed(() => {
  if (!searchQuery.value.trim()) return props.exercises
  const query = searchQuery.value.toLowerCase()
  return props.exercises.filter(ex =>
    ex.name.toLowerCase().includes(query) ||
    ex.sanskrit.toLowerCase().includes(query) ||
    ex.category.toLowerCase().includes(query)
  )
})

const isInRoutine = (exercise: Exercise) => {
  return props.routineExercises.some(re => re.id === exercise.id)
}
</script>

<template>
  <div class="exercise-list">
    <div class="list-header">
      <h2>Available Poses</h2>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search poses..."
        class="search-input"
        @input="$emit('filter', searchQuery)"
      />
    </div>

    <div class="exercises-grid">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="exercise-card"
        :class="{ 'in-routine': isInRoutine(exercise) }"
      >
        <div class="exercise-info">
          <h3>{{ exercise.name }}</h3>
          <p class="sanskrit">{{ exercise.sanskrit }}</p>
          <p class="description">{{ exercise.description }}</p>
          <div class="exercise-meta">
            <span class="category">{{ exercise.category }}</span>
            <span class="difficulty">{{ exercise.difficulty }}</span>
            <span class="duration">{{ exercise.defaultDuration }}s default</span>
          </div>
        </div>
        <button
          class="add-button"
          :class="{ added: isInRoutine(exercise) }"
          @click="onAdd(exercise)"
          :disabled="isInRoutine(exercise)"
        >
          <span v-if="isInRoutine(exercise)">✓ Added</span>
          <span v-else>+ Add</span>
        </button>
      </div>
    </div>

    <p v-if="filteredExercises.length === 0" class="no-results">No poses match your search.</p>
  </div>
</template>

<style scoped>
.exercise-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 200px;
  max-width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.exercise-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.exercise-card:hover {
  border-color: #4299e1;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.1);
}

.exercise-card.in-routine {
  border-color: #48bb78;
  background: #f0fff4;
}

.exercise-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  color: #1a202c;
}

.sanskrit {
  margin: 0 0 0.5rem;
  font-style: italic;
  color: #718096;
  font-size: 0.875rem;
}

.description {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;
}

.exercise-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.exercise-meta span {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #edf2f7;
  color: #4a5568;
}

.add-button {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #4299e1;
  color: white;
}

.add-button:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.add-button:disabled {
  background: #48bb78;
  cursor: default;
}

.add-button.added {
  background: #48bb78;
}

.no-results {
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
}
</style>
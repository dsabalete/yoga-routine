<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  id: string
  name: string
  image?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), { size: 'medium' })

// Two-stage fallback: remote photo -> local SVG illustration -> initials.
// Local illustrations live in public/images/<id>.svg and double as the
// offline fallback when the remote photo can't load.
const fallbackSrc = computed(() => `/images/${props.id}.svg`)
const failedSources = ref<string[]>([])

const src = computed(() => {
  const candidates = [props.image, fallbackSrc.value].filter(Boolean) as string[]
  return candidates.find((s) => !failedSources.value.includes(s)) ?? null
})

function onError() {
  if (src.value) failedSources.value = [...failedSources.value, src.value]
}

// Fallback: initials avatar with app gradient, so old localStorage
// routines (without image) and missing files still look intentional.
const initials = computed(() =>
  props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>

<template>
  <div class="pose-image" :class="`pose-image--${size}`" role="img" :aria-label="name">
    <img
      v-if="src"
      :src="src"
      :alt="`${name} photo`"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="onError"
    />
    <div v-else class="pose-fallback" aria-hidden="true">{{ initials }}</div>
  </div>
</template>

<style scoped>
.pose-image {
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #ebf4ff 0%, #e9d8fd 100%);
  flex-shrink: 0;
}

.pose-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pose-image--small {
  width: 56px;
  height: 56px;
}

.pose-image--medium {
  width: 100%;
  height: 160px;
}

.pose-image--large {
  width: 100%;
  max-width: 320px;
  height: 220px;
  margin: 0 auto 1rem;
}

.pose-fallback {
  width: 100%;
  height: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pose-image--small .pose-fallback {
  font-size: 1rem;
  border-radius: 12px;
}
</style>

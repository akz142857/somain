<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  current: number;
  desired: number;
}>();

const percentage = computed(() =>
  props.desired > 0 ? (props.current / props.desired) * 100 : 0
);

const barColor = computed(() => {
  if (percentage.value >= 100) return 'var(--color-success)';
  if (percentage.value >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
});
</script>

<template>
  <div class="progress-bar-widget">
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: Math.min(percentage, 100) + '%', background: barColor }"
      ></div>
    </div>
    <span class="progress-text">{{ current }} / {{ desired }}</span>
  </div>
</template>

<style scoped>
.progress-bar-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s, background 0.3s;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  white-space: nowrap;
}
</style>

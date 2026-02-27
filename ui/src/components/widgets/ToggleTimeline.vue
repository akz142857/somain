<script setup lang="ts">
defineProps<{
  history: string[];
}>();
</script>

<template>
  <div class="toggle-timeline">
    <div
      v-for="(h, i) in history"
      :key="i"
      class="toggle-bar"
      :class="h"
    ></div>
  </div>
</template>

<style scoped>
.toggle-timeline {
  display: flex;
  gap: 2px;
  height: 8px;
  margin-top: 8px;
  width: 100%;
  align-items: flex-end;
}

.toggle-bar {
  flex: 1;
  border-radius: 2px;
  transition: height 0.2s;
}

.toggle-bar.on {
  height: 100%;
  background: var(--color-success);
}

.toggle-bar.off {
  height: 50%;
  background: #d9d9d9;
}
</style>

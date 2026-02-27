<script setup lang="ts">
const props = defineProps<{
  status: string;
}>();

const isOn = () => props.status === 'on';
</script>

<template>
  <div class="switch-indicator" :class="{ on: isOn(), off: !isOn() }">
    <div class="switch-track">
      <div class="switch-thumb"></div>
    </div>
  </div>
</template>

<style scoped>
.switch-indicator {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.switch-track {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  position: relative;
  transition: background 0.2s;
}

.switch-indicator.on .switch-track {
  background: var(--color-success);
}

.switch-indicator.off .switch-track {
  background: #d9d9d9;
}

.switch-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  transition: left 0.2s;
}

.switch-indicator.on .switch-thumb {
  left: 14px;
}

.switch-indicator.off .switch-thumb {
  left: 2px;
}
</style>

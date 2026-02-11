<script setup lang="ts">
import type { FlowStepDetail } from '../services/mockData';

const props = defineProps<{
  steps: FlowStepDetail[];
  selectedIndex: number | null;
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
}>();

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ok': return '🟢';
    case 'error': return '🔴';
    default: return '⚪';
  }
};
</script>

<template>
  <div class="flow-viz">
    <div class="flow-container">
      <template v-for="(step, idx) in steps" :key="idx">
        <div v-if="idx > 0" class="flow-connector">
          <div class="connector-line"></div>
        </div>

        <div
          class="flow-step"
          :class="[step.status, { selected: selectedIndex === idx }]"
          @click="emit('select', idx)"
        >
          <div class="step-status">{{ getStatusIcon(step.status) }}</div>
          <div class="step-content">
            <div class="step-name">{{ step.name }}</div>
            <div v-if="step.duration" class="step-duration">{{ step.duration }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.flow-viz {
  width: 100%;
  overflow-x: auto;
  padding: 32px 24px;
  background: #0d1117;
  border-radius: 8px;
}

.flow-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: max-content;
}

.flow-step {
  background: rgba(22, 27, 34, 0.8);
  border: 2px solid #30363d;
  border-radius: 8px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 160px;
  cursor: pointer;
  transition: all 0.2s;
}

.flow-step:hover {
  border-color: #8b949e;
  transform: translateY(-2px);
}

.flow-step.selected {
  border-color: #58a6ff;
  box-shadow: 0 0 0 1px #58a6ff, 0 4px 16px rgba(88, 166, 255, 0.15);
}

.flow-step.error {
  border-color: #f85149;
}

.flow-step.error.selected {
  border-color: #f85149;
  box-shadow: 0 0 0 1px #f85149, 0 4px 16px rgba(248, 81, 73, 0.15);
}

.flow-step.ok {
  border-color: #238636;
}

.flow-step.ok.selected {
  border-color: #238636;
  box-shadow: 0 0 0 1px #238636, 0 4px 16px rgba(35, 134, 54, 0.15);
}

.step-status {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  display: flex;
  flex-direction: column;
}

.step-name {
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 600;
}

.step-duration {
  color: #8b949e;
  font-size: 12px;
  margin-top: 2px;
}

.flow-connector {
  width: 60px;
  height: 2px;
  display: flex;
  align-items: center;
}

.connector-line {
  flex: 1;
  height: 2px;
  background: #30363d;
  position: relative;
}

.connector-line::after {
  content: '';
  position: absolute;
  right: -2px;
  top: -4px;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid #30363d;
}
</style>

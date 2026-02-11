<script setup lang="ts">
import { computed } from 'vue';

interface FlowStep {
  name: string;
  status: 'ok' | 'error' | 'pending';
  duration?: string;
}

const props = defineProps<{
  steps: FlowStep[];
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
  <div class="business-flow">
    <div class="flow-container">
      <template v-for="(step, idx) in steps" :key="idx">
        <!-- Connecting Line (except for the first one) -->
        <div v-if="idx > 0" class="flow-connector">
          <div class="connector-line"></div>
        </div>

        <!-- Step Node -->
        <div class="flow-step" :class="step.status">
          <div class="step-status">{{ getStatusIcon(step.status) }}</div>
          <div class="step-content">
            <div class="step-name">{{ step.name }}</div>
            <div v-if="step.duration" class="step-meta">{{ step.duration }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.business-flow {
  width: 100%;
  overflow-x: auto;
  padding: 20px 10px;
  background: #0d1117; /* GitHub Dark Theme feel */
  border-radius: 8px;
}

.flow-container {
  display: flex;
  align-items: center;
  min-width: max-content;
}

.flow-step {
  background: rgba(22, 27, 34, 0.8);
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
  transition: all 0.2s;
}

.flow-step:hover {
  border-color: #8b949e;
}

.flow-step.error {
  border-color: #f85149;
}

.flow-step.ok {
  border-color: #238636;
}

.step-status {
  font-size: 16px;
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
  font-size: 13px;
  font-weight: 500;
}

.step-meta {
  color: #8b949e;
  font-size: 11px;
}

.flow-connector {
  width: 40px;
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
  top: -3px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid #30363d;
}
</style>

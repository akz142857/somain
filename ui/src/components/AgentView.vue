<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  steps?: { title: string; desc: string }[];
  rootCause?: { title: string; desc: string; confidence?: string };
}>();

const { t } = useI18n();
</script>

<template>
  <div class="agent-view">
    <div class="agent-header">
      <div class="agent-pulse"></div>
      <span>{{ t('tab.agent') }}</span>
    </div>

    <div v-if="steps && steps.length" class="agent-step" v-for="(step, index) in steps" :key="index">
      <div class="step-icon">{{ index + 1 }}</div>
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div class="step-desc">{{ step.desc }}</div>
      </div>
    </div>

    <div v-if="rootCause" class="root-cause-box">
      <div style="font-weight: 600; margin-bottom: 4px">
        {{ rootCause.title }} <span v-if="rootCause.confidence">({{ rootCause.confidence }})</span>
      </div>
      <div style="font-size: 13px">{{ rootCause.desc }}</div>
    </div>

    <slot name="actions"></slot>
  </div>
</template>

<style scoped>
.agent-view {
  background: #f8faff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e6f0ff;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--color-primary);
}

.agent-pulse {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: agent-pulse-blue 2s infinite;
}

@keyframes agent-pulse-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.agent-step {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e6f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 10px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.step-desc {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.root-cause-box {
  background: #fff1f0;
  border-left: 4px solid var(--color-error);
  padding: 12px;
  margin: 16px 0;
  border-radius: 4px;
}
</style>

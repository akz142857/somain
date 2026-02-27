<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { FlowStepDetail } from '../services/mockData';

const props = defineProps<{
  step: FlowStepDetail;
}>();

const { t } = useI18n();

const statusClass = (status: string) => {
  switch (status) {
    case 'ok': return 'status-ok';
    case 'error': return 'status-error';
    default: return 'status-pending';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'ok': return t('status.ok');
    case 'error': return t('status.error');
    default: return t('status.pending');
  }
};
</script>

<template>
  <div class="step-detail">
    <div class="detail-header">
      <span class="detail-name">{{ step.name }}</span>
      <span class="detail-status" :class="statusClass(step.status)">{{ statusLabel(step.status) }}</span>
    </div>
    <div class="detail-grid">
      <div v-if="step.endpoint" class="detail-row">
        <span class="detail-label">{{ t('flow.endpoint') }}</span>
        <span class="detail-value mono">{{ step.endpoint }}</span>
      </div>
      <div v-if="step.duration" class="detail-row">
        <span class="detail-label">{{ t('flow.duration') }}</span>
        <span class="detail-value">
          {{ step.duration }}
          <span v-if="step.threshold" class="threshold">({{ t('flow.threshold') }}: {{ step.threshold }})</span>
        </span>
      </div>
      <div v-if="step.startedAt" class="detail-row">
        <span class="detail-label">{{ t('flow.startedAt') }}</span>
        <span class="detail-value">{{ step.startedAt }}</span>
      </div>
      <div v-if="step.retries !== undefined" class="detail-row">
        <span class="detail-label">{{ t('flow.retries') }}</span>
        <span class="detail-value">{{ step.retries }}</span>
      </div>
      <div v-if="step.throughput" class="detail-row">
        <span class="detail-label">{{ t('flow.throughput') }}</span>
        <span class="detail-value">{{ step.throughput }}</span>
      </div>
      <div v-if="step.p99" class="detail-row">
        <span class="detail-label">{{ t('flow.p99') }}</span>
        <span class="detail-value">{{ step.p99 }}</span>
      </div>
      <div v-if="step.errorMessage" class="detail-row error-row">
        <span class="detail-label">{{ t('flow.error') }}</span>
        <span class="detail-value error-text">{{ step.errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-detail {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.detail-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
}

.status-ok {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.1);
}

.status-error {
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
}

.status-pending {
  color: #999;
  background: #f5f5f5;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.detail-label {
  font-size: 13px;
  color: #999;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.detail-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #555;
}

.threshold {
  color: #999;
  font-weight: 400;
  margin-left: 4px;
}

.error-row {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #fff0f0;
}

.error-text {
  color: var(--color-error);
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { AlertEvent } from '../services/mockData';

defineProps<{
  events: AlertEvent[];
}>();

const { t } = useI18n();

const formatTime = (iso: string) => {
  return iso.replace('T', ' ').substring(0, 19);
};
</script>

<template>
  <div class="alert-history">
    <div v-if="events.length" class="timeline">
      <div v-for="evt in events" :key="evt.id" class="timeline-item" :class="evt.status">
        <div class="timeline-dot" :class="evt.severity"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="severity-badge" :class="evt.severity">{{ t(`alert.${evt.severity}`) }}</span>
            <span class="status-badge" :class="evt.status">{{ t(`alert.${evt.status}`) }}</span>
            <span class="timeline-rule">{{ evt.ruleName }}</span>
          </div>
          <div class="timeline-message">{{ evt.message }}</div>
          <div class="timeline-meta">
            <span>{{ t('alert.monitor') }}: {{ evt.monitorName }}</span>
            <span>{{ t('alert.value') }}: {{ evt.value }} | {{ t('alert.threshold') }}: {{ evt.threshold }}</span>
          </div>
          <div class="timeline-times">
            <span>{{ t('alert.firedAt') }}: {{ formatTime(evt.firedAt) }}</span>
            <span v-if="evt.resolvedAt">{{ t('alert.resolvedAt') }}: {{ formatTime(evt.resolvedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">{{ t('alert.noEvents') }}</div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.timeline-dot.critical { background: var(--color-error); }
.timeline-dot.warning { background: var(--color-warning); }
.timeline-dot.info { background: var(--color-primary); }

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.severity-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
}

.severity-badge.critical { color: var(--color-error); background: rgba(255, 77, 79, 0.1); }
.severity-badge.warning { color: var(--color-warning); background: rgba(250, 173, 20, 0.1); }
.severity-badge.info { color: var(--color-primary); background: rgba(24, 144, 255, 0.1); }

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
}

.status-badge.firing {
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
}

.status-badge.resolved {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.1);
}

.timeline-rule {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.timeline-message {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.4;
}

.timeline-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.timeline-times {
  font-size: 11px;
  color: #bbb;
  display: flex;
  gap: 16px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}
</style>

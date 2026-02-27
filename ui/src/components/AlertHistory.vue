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

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
</script>

<template>
  <div class="alert-history">
    <div v-if="events.length" class="timeline">
      <div
        v-for="(evt, idx) in events"
        :key="evt.id"
        class="timeline-item"
      >
        <!-- Timeline track -->
        <div class="timeline-track">
          <div class="timeline-dot" :class="evt.severity" />
          <div v-if="idx < events.length - 1" class="timeline-line" />
        </div>

        <!-- Card -->
        <div class="event-card" :class="[evt.severity, evt.status]">
          <div class="card-header">
            <div class="header-left">
              <span class="rule-name">{{ evt.ruleName }}</span>
              <span class="severity-badge" :class="evt.severity">{{ t(`alert.${evt.severity}`) }}</span>
              <span class="status-badge" :class="evt.status">{{ t(`alert.${evt.status}`) }}</span>
            </div>
            <span class="time-ago">{{ relativeTime(evt.firedAt) }}</span>
          </div>

          <div class="card-message">{{ evt.message }}</div>

          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">{{ t('alert.monitor') }}</span>
              <span class="detail-value">{{ evt.monitorName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('alert.value') }}</span>
              <span class="detail-value value-highlight" :class="evt.severity">{{ evt.value }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ t('alert.threshold') }}</span>
              <span class="detail-value">{{ evt.threshold }}</span>
            </div>
          </div>

          <div class="card-times">
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
}

.timeline-item {
  display: flex;
  gap: 16px;
}

/* Timeline track: dot + line */
.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
  padding-top: 2px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}

.timeline-dot.critical { background: var(--color-error); box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.15); }
.timeline-dot.warning { background: var(--color-warning); box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.15); }
.timeline-dot.info { background: var(--color-primary); box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15); }

.timeline-line {
  width: 2px;
  flex: 1;
  background: #e8e8e8;
  margin: 4px 0;
}

/* Event card */
.event-card {
  flex: 1;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 12px;
  border-left: 3px solid #e8e8e8;
  transition: box-shadow 0.2s;
}

.event-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.event-card.critical { border-left-color: var(--color-error); }
.event-card.warning { border-left-color: var(--color-warning); }
.event-card.info { border-left-color: var(--color-primary); }

.event-card.resolved {
  opacity: 0.75;
}

/* Card header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.severity-badge,
.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 3px;
}

.severity-badge.critical { color: var(--color-error); background: rgba(255, 77, 79, 0.1); }
.severity-badge.warning { color: var(--color-warning); background: rgba(250, 173, 20, 0.1); }
.severity-badge.info { color: var(--color-primary); background: rgba(24, 144, 255, 0.1); }

.status-badge.firing { color: #fff; background: var(--color-error); }
.status-badge.resolved { color: var(--color-success); background: rgba(82, 196, 26, 0.1); }

.time-ago {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

/* Message */
.card-message {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
}

/* Details row */
.card-details {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.value-highlight.critical { color: var(--color-error); font-weight: 700; }
.value-highlight.warning { color: var(--color-warning); font-weight: 700; }
.value-highlight.info { color: var(--color-primary); font-weight: 700; }

/* Times */
.card-times {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #b0b0b0;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}
</style>

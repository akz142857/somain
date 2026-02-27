<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { AlertChannel } from '../services/mockData';

defineProps<{
  channels: AlertChannel[];
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const { t } = useI18n();

const typeClass = (type: string) => type;

const configSummary = (ch: AlertChannel) => {
  const entries = Object.entries(ch.config);
  if (entries.length === 0) return '-';
  return entries.map(([k, v]) => `${k}: ${v.length > 30 ? v.slice(0, 30) + '...' : v}`).join(', ');
};
</script>

<template>
  <div class="channel-list">
    <div v-if="channels.length" class="channel-grid">
      <div v-for="ch in channels" :key="ch.id" class="channel-card">
        <div class="channel-header">
          <span class="channel-name">{{ ch.name }}</span>
          <span class="type-badge" :class="typeClass(ch.type)">{{ t(`alert.${ch.type}`) }}</span>
        </div>
        <div class="channel-config">{{ configSummary(ch) }}</div>
        <div class="channel-footer">
          <span class="channel-date">{{ ch.createdAt.split('T')[0] }}</span>
          <button class="delete-btn" @click="emit('delete', ch.id)">Delete</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">{{ t('alert.noChannels') }}</div>
  </div>
</template>

<style scoped>
.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.channel-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.channel-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.channel-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}

.type-badge.feishu {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
}

.type-badge.webhook {
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
}

.type-badge.email {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.1);
}

.channel-config {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
  word-break: break-all;
}

.channel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.channel-date {
  font-size: 11px;
  color: #bbb;
}

.delete-btn {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: rgba(255, 77, 79, 0.1);
  color: var(--color-error);
  transition: background 0.2s;
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 0.2);
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}
</style>

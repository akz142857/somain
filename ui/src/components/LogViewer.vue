<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMockService } from '../services/mockService';
import type { LogEntry, LogLevel } from '../services/mockData';

const props = defineProps<{
  monitorId: string;
}>();

const { t } = useI18n();
const { getLogs } = useMockService();

const logs = ref<LogEntry[]>([]);
const activeLevel = ref<LogLevel | null>(null);
const keyword = ref('');
const loading = ref(false);

let debounceTimer: number | null = null;

const fetchLogs = async () => {
  loading.value = true;
  try {
    logs.value = await getLogs(props.monitorId, {
      level: activeLevel.value ?? undefined,
      keyword: keyword.value || undefined
    });
  } finally {
    loading.value = false;
  }
};

const setLevel = (level: LogLevel | null) => {
  activeLevel.value = level;
  fetchLogs();
};

const onKeywordInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    fetchLogs();
  }, 300);
};

onMounted(fetchLogs);

watch(() => props.monitorId, fetchLogs);
</script>

<template>
  <div class="log-viewer">
    <div class="log-toolbar">
      <div class="level-filters">
        <button class="level-btn" :class="{ active: activeLevel === null }" @click="setLevel(null)">{{ t('log.all') }}</button>
        <button class="level-btn error" :class="{ active: activeLevel === 'error' }" @click="setLevel('error')">{{ t('log.error') }}</button>
        <button class="level-btn warn" :class="{ active: activeLevel === 'warn' }" @click="setLevel('warn')">{{ t('log.warn') }}</button>
        <button class="level-btn info" :class="{ active: activeLevel === 'info' }" @click="setLevel('info')">{{ t('log.info') }}</button>
        <button class="level-btn debug" :class="{ active: activeLevel === 'debug' }" @click="setLevel('debug')">{{ t('log.debug') }}</button>
      </div>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        :placeholder="t('log.search')"
        @input="onKeywordInput"
      />
    </div>

    <div class="log-list">
      <div
        v-for="log in logs"
        :key="log.id"
        class="log-entry"
        :class="log.level"
      >
        <span class="log-time">{{ log.time }}</span>
        <span class="log-level-badge" :class="log.level">{{ log.level.toUpperCase() }}</span>
        <span class="log-source">{{ log.source }}</span>
        <span class="log-message">{{ log.message }}</span>
        <span v-if="log.traceId" class="log-trace">{{ log.traceId }}</span>
      </div>
      <div v-if="logs.length === 0 && !loading" class="empty-state">{{ t('log.noLogs') }}</div>
    </div>
  </div>
</template>

<style scoped>
.log-viewer {
  width: 100%;
}

.log-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.level-filters {
  display: flex;
  gap: 6px;
}

.level-btn {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.level-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.05);
}

.level-btn.error.active {
  border-color: var(--color-error);
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.05);
}

.level-btn.warn.active {
  border-color: var(--color-warning);
  color: var(--color-warning);
  background: rgba(250, 173, 20, 0.05);
}

.level-btn.info.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.05);
}

.level-btn.debug.active {
  border-color: #722ed1;
  color: #722ed1;
  background: rgba(114, 46, 209, 0.05);
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.search-input::placeholder {
  color: #bfbfbf;
}

.log-list {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 500px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 12px;
  border-bottom: 1px solid #f9f9f9;
  transition: background 0.15s;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry:hover {
  background: #fafafa;
}

.log-entry.error {
  background: rgba(255, 77, 79, 0.03);
}

.log-entry.error:hover {
  background: rgba(255, 77, 79, 0.06);
}

.log-entry.warn {
  background: rgba(250, 173, 20, 0.03);
}

.log-entry.warn:hover {
  background: rgba(250, 173, 20, 0.06);
}

.log-time {
  color: #999;
  min-width: 140px;
  font-size: 11px;
}

.log-level-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  min-width: 42px;
  text-align: center;
}

.log-level-badge.error {
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
}

.log-level-badge.warn {
  color: var(--color-warning);
  background: rgba(250, 173, 20, 0.1);
}

.log-level-badge.info {
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.1);
}

.log-level-badge.debug {
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
}

.log-source {
  color: #888;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-message {
  flex: 1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-trace {
  color: #bbb;
  font-size: 10px;
  white-space: nowrap;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}
</style>

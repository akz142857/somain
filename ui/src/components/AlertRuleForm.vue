<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Drawer from './Drawer.vue';
import type { AlertRule, AlertChannel, AlertSeverity } from '../services/mockData';

const props = defineProps<{
  visible: boolean;
  rule?: AlertRule | null;
  channels: AlertChannel[];
  monitors: { id: string; name: string; nameKey: string; metricKeys?: string[] }[];
}>();

const emit = defineEmits<{
  close: [];
  save: [data: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const { t } = useI18n();

const form = ref({
  name: '',
  monitorId: '',
  monitorName: '',
  metricKey: 'latency',
  operator: '>' as AlertRule['operator'],
  threshold: 0,
  unit: 'ms',
  severity: 'warning' as AlertSeverity,
  status: 'enabled' as AlertRule['status'],
  channelIds: [] as string[]
});

const isEdit = computed(() => !!props.rule);

watch(() => props.visible, (v) => {
  if (v && props.rule) {
    form.value = {
      name: props.rule.name,
      monitorId: props.rule.monitorId,
      monitorName: props.rule.monitorName,
      metricKey: props.rule.metricKey,
      operator: props.rule.operator,
      threshold: props.rule.threshold,
      unit: props.rule.unit,
      severity: props.rule.severity,
      status: props.rule.status,
      channelIds: [...props.rule.channelIds]
    };
  } else if (v) {
    form.value = {
      name: '', monitorId: '', monitorName: '', metricKey: 'latency',
      operator: '>', threshold: 0, unit: 'ms', severity: 'warning',
      status: 'enabled', channelIds: []
    };
  }
  monitorDropdownOpen.value = false;
  monitorSearch.value = '';
});

const defaultMetricOptions = ['latency', 'uptime', 'successRate', 'avgDuration', 'throughput', 'errorRate'];

const metricOptions = computed(() => {
  if (form.value.monitorId) {
    const monitor = props.monitors.find(m => m.id === form.value.monitorId);
    if (monitor?.metricKeys?.length) return monitor.metricKeys;
  }
  return defaultMetricOptions;
});

watch(() => form.value.monitorId, () => {
  // Reset metric key when monitor changes if current selection is not in new options
  if (!metricOptions.value.includes(form.value.metricKey)) {
    form.value.metricKey = metricOptions.value[0] || 'latency';
  }
});
const operatorOptions: AlertRule['operator'][] = ['>', '<', '>=', '<=', '=='];
const severityOptions: AlertSeverity[] = ['critical', 'warning', 'info'];

const severityColors: Record<AlertSeverity, string> = {
  critical: '#ff4d4f',
  warning: '#faad14',
  info: '#1890ff'
};

const enabledChannels = computed(() => props.channels.filter(ch => ch.enabled));

// Searchable monitor dropdown
const monitorSearch = ref('');
const monitorDropdownOpen = ref(false);
const monitorSearchInput = ref<HTMLInputElement | null>(null);

const filteredMonitors = computed(() => {
  const q = monitorSearch.value.toLowerCase();
  if (!q) return props.monitors;
  return props.monitors.filter(m => t(m.nameKey).toLowerCase().includes(q));
});

const selectedMonitorLabel = computed(() => {
  const m = props.monitors.find(m => m.id === form.value.monitorId);
  return m ? t(m.nameKey) : '';
});

const openMonitorDropdown = () => {
  monitorDropdownOpen.value = true;
  monitorSearch.value = '';
  nextTick(() => monitorSearchInput.value?.focus());
};

const selectMonitor = (m: { id: string; nameKey: string }) => {
  form.value.monitorId = m.id;
  form.value.monitorName = t(m.nameKey);
  monitorDropdownOpen.value = false;
  monitorSearch.value = '';
};

const toggleChannel = (id: string) => {
  const idx = form.value.channelIds.indexOf(id);
  if (idx === -1) form.value.channelIds.push(id);
  else form.value.channelIds.splice(idx, 1);
};

const channelIcon = (type: string) => {
  if (type === 'feishu') return '💬';
  if (type === 'webhook') return '🔗';
  return '✉️';
};

// Click-outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    (el as any)._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value();
    };
    document.addEventListener('click', (el as any)._clickOutside);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside);
  }
};

const handleSave = () => {
  if (!form.value.name.trim()) return;
  emit('save', { ...form.value });
};
</script>

<template>
  <Drawer
    :visible="visible"
    :title="isEdit ? t('alert.editRule') : t('alert.addRule')"
    width="480px"
    @close="emit('close')"
    @confirm="handleSave"
  >
    <div class="rule-form">
      <!-- Basic -->
      <div class="form-section">
        <div class="section-title">{{ t('alert.basic') }}</div>
        <div class="form-item">
          <label>{{ t('alert.ruleName') }}</label>
          <input v-model="form.name" type="text" class="input" :placeholder="t('alert.ruleName')" />
        </div>
      </div>

      <!-- Condition -->
      <div class="form-section">
        <div class="section-title">{{ t('alert.condition') }}</div>
        <div class="form-item">
          <label>{{ t('alert.monitor') }}</label>
          <div class="searchable-select" v-click-outside="() => monitorDropdownOpen = false">
            <div class="select-trigger input" @click="openMonitorDropdown">
              <span :class="{ placeholder: !form.monitorId }">
                {{ selectedMonitorLabel || 'Select...' }}
              </span>
              <span class="select-arrow">▾</span>
            </div>
            <div v-if="monitorDropdownOpen" class="select-dropdown">
              <input
                ref="monitorSearchInput"
                v-model="monitorSearch"
                type="text"
                class="search-input"
                :placeholder="t('action.search')"
                @click.stop
              />
              <div class="select-options">
                <div
                  v-for="m in filteredMonitors"
                  :key="m.id"
                  class="select-option"
                  :class="{ active: form.monitorId === m.id }"
                  @click="selectMonitor(m)"
                >
                  {{ t(m.nameKey) }}
                </div>
                <div v-if="!filteredMonitors.length" class="select-empty">{{ t('form.noMatches') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>{{ t('alert.metric') }}</label>
            <select v-model="form.metricKey" class="input">
              <option v-for="mk in metricOptions" :key="mk" :value="mk">{{ t(`metric.${mk}`) }}</option>
            </select>
          </div>
          <div class="form-item">
            <label>{{ t('alert.operator') }}</label>
            <select v-model="form.operator" class="input">
              <option v-for="op in operatorOptions" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>
          <div class="form-item">
            <label>{{ t('alert.threshold') }}</label>
            <input v-model.number="form.threshold" type="number" class="input" />
          </div>
        </div>
      </div>

      <!-- Severity -->
      <div class="form-section">
        <div class="section-title">{{ t('alert.severity') }}</div>
        <div class="pill-group">
          <button
            v-for="s in severityOptions"
            :key="s"
            class="pill"
            :class="{ active: form.severity === s }"
            :style="form.severity === s ? { background: severityColors[s], borderColor: severityColors[s], color: '#fff' } : {}"
            @click="form.severity = s"
          >
            {{ t(`alert.${s}`) }}
          </button>
        </div>
      </div>

      <!-- Notification -->
      <div class="form-section" v-if="enabledChannels.length">
        <div class="section-title">{{ t('alert.notification') }}</div>
        <div class="channel-cards">
          <div
            v-for="ch in enabledChannels"
            :key="ch.id"
            class="channel-card"
            :class="{ selected: form.channelIds.includes(ch.id) }"
            @click="toggleChannel(ch.id)"
          >
            <span class="channel-icon">{{ channelIcon(ch.type) }}</span>
            <div class="channel-info">
              <span class="channel-name">{{ ch.name }}</span>
              <span class="channel-type">{{ t(`alert.${ch.type}`) }}</span>
            </div>
            <div class="toggle-indicator">
              <div class="toggle-track" :class="{ on: form.channelIds.includes(ch.id) }">
                <div class="toggle-thumb" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
.rule-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-item {
  flex: 1;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* Searchable select */
.searchable-select {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.select-trigger .placeholder {
  color: #bbb;
}

.select-arrow {
  color: #bbb;
  font-size: 12px;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.search-input {
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;
  box-sizing: border-box;
  outline: none;
}

.select-options {
  max-height: 180px;
  overflow-y: auto;
}

.select-option {
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}

.select-option:hover {
  background: #f5f5f5;
}

.select-option.active {
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(24, 144, 255, 0.06);
}

.select-empty {
  padding: 12px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

/* Severity pill buttons */
.pill-group {
  display: flex;
  gap: 8px;
}

.pill {
  padding: 6px 18px;
  border: 1.5px solid #d9d9d9;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.pill:hover:not(.active) {
  border-color: #bbb;
  color: #333;
}

/* Channel toggle cards */
.channel-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.channel-card:hover {
  border-color: #d0d0d0;
}

.channel-card.selected {
  border-color: var(--color-primary);
  background: rgba(24, 144, 255, 0.04);
}

.channel-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.channel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.channel-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.channel-type {
  font-size: 11px;
  color: #999;
}

.toggle-indicator {
  flex-shrink: 0;
}

.toggle-track {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: #d9d9d9;
  position: relative;
  transition: background 0.2s;
}

.toggle-track.on {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-track.on .toggle-thumb {
  transform: translateX(16px);
}
</style>

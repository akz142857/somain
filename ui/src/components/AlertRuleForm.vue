<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from './Modal.vue';
import type { AlertRule, AlertChannel, AlertSeverity } from '../services/mockData';

const props = defineProps<{
  visible: boolean;
  rule?: AlertRule | null;
  channels: AlertChannel[];
  monitors: { id: string; name: string }[];
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
});

const metricOptions = ['latency', 'uptime', 'successRate', 'avgDuration', 'throughput', 'errorRate'];
const operatorOptions: AlertRule['operator'][] = ['>', '<', '>=', '<=', '=='];
const severityOptions: AlertSeverity[] = ['critical', 'warning', 'info'];

const onMonitorChange = () => {
  const m = props.monitors.find(m => m.id === form.value.monitorId);
  if (m) form.value.monitorName = m.name;
};

const toggleChannel = (id: string) => {
  const idx = form.value.channelIds.indexOf(id);
  if (idx === -1) form.value.channelIds.push(id);
  else form.value.channelIds.splice(idx, 1);
};

const handleSave = () => {
  if (!form.value.name.trim()) return;
  emit('save', { ...form.value });
};
</script>

<template>
  <Modal
    :visible="visible"
    :title="isEdit ? t('alert.editRule') : t('alert.addRule')"
    @close="emit('close')"
    @confirm="handleSave"
  >
    <div class="form-grid">
      <div class="form-item">
        <label>{{ t('alert.ruleName') }}</label>
        <input v-model="form.name" type="text" class="input" />
      </div>
      <div class="form-item">
        <label>{{ t('alert.monitor') }}</label>
        <select v-model="form.monitorId" class="input" @change="onMonitorChange">
          <option value="" disabled>Select...</option>
          <option v-for="m in monitors" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>{{ t('alert.metric') }}</label>
          <select v-model="form.metricKey" class="input">
            <option v-for="mk in metricOptions" :key="mk" :value="mk">{{ mk }}</option>
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
      <div class="form-item">
        <label>{{ t('alert.severity') }}</label>
        <select v-model="form.severity" class="input">
          <option v-for="s in severityOptions" :key="s" :value="s">{{ t(`alert.${s}`) }}</option>
        </select>
      </div>
      <div class="form-item" v-if="channels.length">
        <label>{{ t('alert.notifyChannels') }}</label>
        <div class="channel-checks">
          <label v-for="ch in channels" :key="ch.id" class="check-label">
            <input
              type="checkbox"
              :checked="form.channelIds.includes(ch.id)"
              @change="toggleChannel(ch.id)"
            />
            {{ ch.name }}
          </label>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.channel-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}
</style>

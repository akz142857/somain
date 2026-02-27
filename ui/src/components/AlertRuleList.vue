<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { AlertRule } from '../services/mockData';

defineProps<{
  rules: AlertRule[];
}>();

const emit = defineEmits<{
  edit: [rule: AlertRule];
  delete: [id: string];
  toggleStatus: [id: string, status: 'enabled' | 'disabled'];
}>();

const { t } = useI18n();

const severityClass = (s: string) => s;
</script>

<template>
  <div class="rule-list">
    <table v-if="rules.length" class="data-table">
      <thead>
        <tr>
          <th>{{ t('alert.ruleName') }}</th>
          <th>{{ t('alert.monitor') }}</th>
          <th>{{ t('alert.metric') }}</th>
          <th>{{ t('alert.threshold') }}</th>
          <th>{{ t('alert.severity') }}</th>
          <th>{{ t('alert.status') }}</th>
          <th>{{ t('alert.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rule in rules" :key="rule.id">
          <td class="rule-name">{{ rule.name }}</td>
          <td>{{ rule.monitorName }}</td>
          <td>{{ rule.metricKey }}</td>
          <td><code>{{ rule.operator }} {{ rule.threshold }}{{ rule.unit }}</code></td>
          <td><span class="severity-badge" :class="severityClass(rule.severity)">{{ t(`alert.${rule.severity}`) }}</span></td>
          <td>
            <button
              class="toggle-btn"
              :class="rule.status"
              @click="emit('toggleStatus', rule.id, rule.status === 'enabled' ? 'disabled' : 'enabled')"
            >{{ t(`alert.${rule.status}`) }}</button>
          </td>
          <td class="actions-cell">
            <button class="action-btn edit" @click="emit('edit', rule)">Edit</button>
            <button class="action-btn delete" @click="emit('delete', rule.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-state">{{ t('alert.noRules') }}</div>
  </div>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.data-table th {
  background: #fafafa;
  padding: 10px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.data-table td {
  padding: 10px 14px;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #f9f9f9;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: #fafafa;
}

.rule-name {
  font-weight: 500;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.severity-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}

.severity-badge.critical {
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
}

.severity-badge.warning {
  color: var(--color-warning);
  background: rgba(250, 173, 20, 0.1);
}

.severity-badge.info {
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.1);
}

.toggle-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid #d9d9d9;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.toggle-btn.enabled {
  color: var(--color-success);
  border-color: var(--color-success);
}

.toggle-btn.disabled {
  color: #999;
  border-color: #d9d9d9;
}

.actions-cell {
  display: flex;
  gap: 6px;
}

.action-btn {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background: rgba(24, 144, 255, 0.1);
  color: var(--color-primary);
}

.action-btn.edit:hover {
  background: rgba(24, 144, 255, 0.2);
}

.action-btn.delete {
  background: rgba(255, 77, 79, 0.1);
  color: var(--color-error);
}

.action-btn.delete:hover {
  background: rgba(255, 77, 79, 0.2);
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}
</style>

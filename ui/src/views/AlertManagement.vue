<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMockService, getMonitorIdsForProject, getMonitorsForProject } from '../services/mockService';
import { useProject } from '../composables/useProject';
import AlertRuleList from '../components/AlertRuleList.vue';
import AlertRuleForm from '../components/AlertRuleForm.vue';
import AlertHistory from '../components/AlertHistory.vue';
import type { AlertRule, AlertChannel, AlertEvent } from '../services/mockData';

const { t } = useI18n();
const {
  getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule,
  getAlertChannels,
  getAlertEvents
} = useMockService();
const { activeProjectId } = useProject();

const activeTab = ref<'rules' | 'history'>('rules');
const rules = ref<AlertRule[]>([]);
const channels = ref<AlertChannel[]>([]);
const events = ref<AlertEvent[]>([]);

const showRuleForm = ref(false);
const editingRule = ref<AlertRule | null>(null);

// Monitors list dynamically based on active project
const monitors = computed(() => getMonitorsForProject(activeProjectId.value));

const loadData = async () => {
  const monitorIds = getMonitorIdsForProject(activeProjectId.value);
  const allRules = (await getAlertRules()).value;
  rules.value = allRules.filter(r => monitorIds.has(r.monitorId));
  channels.value = (await getAlertChannels()).value; // channels stay global for rule form
  const allEvents = (await getAlertEvents()).value;
  events.value = allEvents.filter(e => monitorIds.has(e.monitorId));
};

onMounted(loadData);
watch(activeProjectId, loadData);

const handleAddRule = () => {
  editingRule.value = null;
  showRuleForm.value = true;
};

const handleEditRule = (rule: AlertRule) => {
  editingRule.value = rule;
  showRuleForm.value = true;
};

const handleSaveRule = async (data: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingRule.value) {
    await updateAlertRule(editingRule.value.id, data);
  } else {
    await createAlertRule(data);
  }
  showRuleForm.value = false;
  await loadData();
};

const handleToggleRuleStatus = async (id: string, status: 'enabled' | 'disabled') => {
  await updateAlertRule(id, { status });
};

const handleDeleteRule = async (id: string) => {
  await deleteAlertRule(id);
  await loadData();
};
</script>

<template>
  <div class="alert-management">
    <div class="tab-bar">
      <div class="tab" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">{{ t('alert.rules') }}</div>
      <div class="tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">{{ t('alert.history') }}</div>
    </div>

    <!-- Rules Tab -->
    <div v-if="activeTab === 'rules'" class="tab-content">
      <div class="tab-toolbar">
        <button class="add-btn" @click="handleAddRule">+ {{ t('alert.addRule') }}</button>
      </div>
      <AlertRuleList
        :rules="rules"
        @edit="handleEditRule"
        @delete="handleDeleteRule"
        @toggle-status="handleToggleRuleStatus"
      />
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <AlertHistory :events="events" />
    </div>

    <!-- Forms -->
    <AlertRuleForm
      :visible="showRuleForm"
      :rule="editingRule"
      :channels="channels"
      :monitors="monitors"
      @close="showRuleForm = false"
      @save="handleSaveRule"
    />
  </div>
</template>

<style scoped>
.alert-management {
  width: 100%;
}

.tab-bar {
  display: inline-flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 3px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tab {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 6px;
  transition: all 0.15s;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #1a1a1a;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-content {
  min-height: 300px;
}

.tab-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.add-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #40a9ff;
}
</style>

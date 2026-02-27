<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMockService, getMonitorIdsForProject, getMonitorsForProject } from '../services/mockService';
import { useProject } from '../composables/useProject';
import AlertRuleList from '../components/AlertRuleList.vue';
import AlertRuleForm from '../components/AlertRuleForm.vue';
import AlertChannelList from '../components/AlertChannelList.vue';
import AlertChannelForm from '../components/AlertChannelForm.vue';
import AlertHistory from '../components/AlertHistory.vue';
import type { AlertRule, AlertChannel, AlertEvent } from '../services/mockData';

const { t } = useI18n();
const {
  getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule,
  getAlertChannels, createAlertChannel, deleteAlertChannel,
  getAlertEvents
} = useMockService();
const { activeProjectId } = useProject();

const activeTab = ref<'rules' | 'channels' | 'history'>('rules');
const rules = ref<AlertRule[]>([]);
const channels = ref<AlertChannel[]>([]);
const events = ref<AlertEvent[]>([]);

const showRuleForm = ref(false);
const editingRule = ref<AlertRule | null>(null);
const showChannelForm = ref(false);

// Monitors list dynamically based on active project
const monitors = computed(() => getMonitorsForProject(activeProjectId.value));

const loadData = async () => {
  const monitorIds = getMonitorIdsForProject(activeProjectId.value);
  const allRules = (await getAlertRules()).value;
  rules.value = allRules.filter(r => monitorIds.has(r.monitorId));
  channels.value = (await getAlertChannels()).value; // channels stay global
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

const handleSaveChannel = async (data: { name: string; type: any; config: Record<string, string> }) => {
  await createAlertChannel(data);
  showChannelForm.value = false;
};

const handleDeleteChannel = async (id: string) => {
  await deleteAlertChannel(id);
};
</script>

<template>
  <div class="alert-management">
    <div class="tab-bar">
      <div class="tab" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">{{ t('alert.rules') }}</div>
      <div class="tab" :class="{ active: activeTab === 'channels' }" @click="activeTab = 'channels'">{{ t('alert.channels') }}</div>
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

    <!-- Channels Tab -->
    <div v-if="activeTab === 'channels'" class="tab-content">
      <div class="tab-toolbar">
        <button class="add-btn" @click="showChannelForm = true">+ {{ t('alert.addChannel') }}</button>
      </div>
      <AlertChannelList
        :channels="channels"
        @delete="handleDeleteChannel"
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

    <AlertChannelForm
      :visible="showChannelForm"
      @close="showChannelForm = false"
      @save="handleSaveChannel"
    />
  </div>
</template>

<style scoped>
.alert-management {
  max-width: 1200px;
}

.tab-bar {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.tab {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding-bottom: 10px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #666;
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
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

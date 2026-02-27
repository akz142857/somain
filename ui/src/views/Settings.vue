<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMockService } from '../services/mockService';
import AlertChannelList from '../components/AlertChannelList.vue';
import AlertChannelForm from '../components/AlertChannelForm.vue';
import type { AlertChannel } from '../services/mockData';

const { t, locale } = useI18n();
const { getAlertChannels, createAlertChannel, updateAlertChannel, deleteAlertChannel } = useMockService();

const activeSection = ref('general');
const sections = ['general', 'notifications', 'about'] as const;

const channels = ref<AlertChannel[]>([]);
const showChannelForm = ref(false);
const editingChannel = ref<AlertChannel | null>(null);

const loadChannels = async () => {
  channels.value = (await getAlertChannels()).value;
};

onMounted(loadChannels);

const setLocale = (lang: string) => {
  locale.value = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('locale', lang);
};

const scrollTo = (id: string) => {
  activeSection.value = id;
  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' });
};

const handleAddChannel = () => {
  editingChannel.value = null;
  showChannelForm.value = true;
};

const handleEditChannel = (channel: AlertChannel) => {
  editingChannel.value = channel;
  showChannelForm.value = true;
};

const handleSaveChannel = async (data: { name: string; type: any; config: Record<string, string> }) => {
  if (editingChannel.value) {
    await updateAlertChannel(editingChannel.value.id, data);
  } else {
    await createAlertChannel(data);
  }
  showChannelForm.value = false;
  editingChannel.value = null;
  await loadChannels();
};

const handleToggleChannel = async (id: string, enabled: boolean) => {
  await updateAlertChannel(id, { enabled });
  await loadChannels();
};

const handleDeleteChannel = async (id: string) => {
  await deleteAlertChannel(id);
  await loadChannels();
};
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">{{ t('settings.pageTitle') }}</h1>

    <div class="settings-layout">
      <!-- Left nav -->
      <nav class="settings-nav">
        <div
          v-for="s in sections"
          :key="s"
          class="nav-item"
          :class="{ active: activeSection === s }"
          @click="scrollTo(s)"
        >
          {{ s === 'general' ? t('settings.general') : s === 'notifications' ? t('nav.notifications') : t('settings.about') }}
        </div>
      </nav>

      <!-- Right content -->
      <div class="settings-content">
        <!-- General -->
        <div id="section-general" class="settings-section">
          <h2 class="section-title">{{ t('settings.general') }}</h2>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ t('settings.language') }}</div>
              <div class="setting-desc">{{ t('settings.languageDesc') }}</div>
            </div>
          </div>
          <div class="lang-options">
            <div class="lang-option" :class="{ active: locale === 'en' }" @click="setLocale('en')">
              <span class="lang-label">English</span>
              <svg v-if="locale === 'en'" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-primary)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div class="lang-option" :class="{ active: locale === 'zh' }" @click="setLocale('zh')">
              <span class="lang-label">中文</span>
              <svg v-if="locale === 'zh'" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-primary)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ t('settings.simulation') }}</div>
              <div class="setting-desc">{{ t('settings.simulationDesc') }}</div>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ t('settings.theme') }}</div>
              <div class="setting-desc">{{ t('settings.themeDesc') }}</div>
            </div>
            <span class="setting-value">Dark sidebar + Light content</span>
          </div>
        </div>

        <!-- Notification Channels -->
        <div id="section-notifications" class="settings-section">
          <h2 class="section-title">{{ t('settings.notifications') }}</h2>
          <p class="section-desc">{{ t('settings.notificationsDesc') }}</p>
          <div class="section-toolbar">
            <button class="add-btn" @click="handleAddChannel">+ {{ t('alert.addChannel') }}</button>
          </div>
          <AlertChannelList
            :channels="channels"
            @edit="handleEditChannel"
            @delete="handleDeleteChannel"
            @toggle-enabled="handleToggleChannel"
          />
        </div>

        <!-- About -->
        <div id="section-about" class="settings-section">
          <h2 class="section-title">{{ t('settings.about') }}</h2>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ t('settings.version') }}</div>
            </div>
            <span class="setting-value">0.1.0</span>
          </div>
        </div>
      </div>
    </div>

    <AlertChannelForm
      :visible="showChannelForm"
      :channel="editingChannel"
      @close="showChannelForm = false"
      @save="handleSaveChannel"
    />
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 900px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 28px;
}

.settings-layout {
  display: flex;
  gap: 32px;
}

.settings-nav {
  width: 160px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}

.nav-item {
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.nav-item:hover {
  color: #333;
  background: #f5f5f5;
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.06);
  font-weight: 600;
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-section {
  margin-bottom: 36px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.section-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 12px;
}

.section-toolbar {
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

.lang-options {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.2s;
}

.lang-option:hover {
  border-color: var(--color-primary);
}

.lang-option.active {
  border-color: var(--color-primary);
  background: rgba(24, 144, 255, 0.04);
}

.lang-label {
  font-size: 14px;
  color: #333;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-name {
  font-size: 14px;
  color: #333;
}

.setting-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.setting-value {
  font-size: 13px;
  color: #999;
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const setLocale = (lang: string) => {
  locale.value = lang;
  document.documentElement.lang = lang;
};
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">{{ t('settings.pageTitle') }}</h1>

    <div class="settings-section">
      <h2 class="section-title">{{ t('settings.language') }}</h2>
      <p class="section-desc">{{ t('settings.languageDesc') }}</p>
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
    </div>

    <div class="settings-section">
      <h2 class="section-title">{{ t('settings.general') }}</h2>
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

    <div class="settings-section">
      <h2 class="section-title">{{ t('settings.about') }}</h2>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">{{ t('settings.version') }}</div>
        </div>
        <span class="setting-value">0.1.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 720px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 28px;
}

.settings-section {
  margin-bottom: 32px;
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

.lang-options {
  display: flex;
  gap: 12px;
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

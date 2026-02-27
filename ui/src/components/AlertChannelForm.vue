<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from './Modal.vue';
import type { AlertChannelType } from '../services/mockData';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: { name: string; type: AlertChannelType; config: Record<string, string> }];
}>();

const { t } = useI18n();

const name = ref('');
const channelType = ref<AlertChannelType>('feishu');
const config = ref<Record<string, string>>({});

const typeOptions: AlertChannelType[] = ['feishu', 'webhook', 'email'];

const configFields = computed(() => {
  switch (channelType.value) {
    case 'feishu': return [{ key: 'webhookUrl', label: t('alert.webhookUrl') }];
    case 'webhook': return [
      { key: 'url', label: 'URL' },
      { key: 'secret', label: 'Secret' }
    ];
    case 'email': return [{ key: 'emailAddress', label: t('alert.emailAddress') }];
    default: return [];
  }
});

watch(() => props.visible, (v) => {
  if (v) {
    name.value = '';
    channelType.value = 'feishu';
    config.value = {};
  }
});

watch(channelType, () => {
  config.value = {};
});

const handleSave = () => {
  if (!name.value.trim()) return;
  emit('save', { name: name.value, type: channelType.value, config: { ...config.value } });
};
</script>

<template>
  <Modal
    :visible="visible"
    :title="t('alert.addChannel')"
    @close="emit('close')"
    @confirm="handleSave"
  >
    <div class="form-grid">
      <div class="form-item">
        <label>{{ t('alert.channelName') }}</label>
        <input v-model="name" type="text" class="input" />
      </div>
      <div class="form-item">
        <label>{{ t('alert.channelType') }}</label>
        <select v-model="channelType" class="input">
          <option v-for="tp in typeOptions" :key="tp" :value="tp">{{ t(`alert.${tp}`) }}</option>
        </select>
      </div>
      <div v-for="field in configFields" :key="field.key" class="form-item">
        <label>{{ field.label }}</label>
        <input v-model="config[field.key]" type="text" class="input" />
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
</style>

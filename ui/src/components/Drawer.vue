<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  visible: boolean;
  title: string;
}>();

const emit = defineEmits(['close', 'confirm']);

const close = () => emit('close');
const confirm = () => emit('confirm');
</script>

<template>
  <div class="drawer-overlay" :class="{ show: visible }" @click.self="close">
    <div class="drawer-content" :class="{ show: visible }">
      <div class="drawer-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="drawer-body">
        <slot></slot>
      </div>
      <div class="drawer-footer">
        <button class="btn" @click="close">Cancel</button>
        <button class="btn btn-primary" @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.drawer-overlay.show {
  opacity: 1;
  visibility: visible;
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90%;
  height: 100%;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;
}

.drawer-content.show {
  transform: translateX(0);
}

.drawer-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #666;
}

.drawer-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: white;
}

.btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: #40a9ff;
  color: white;
}
</style>

<template>
  <div class="toast-host" aria-live="polite" aria-atomic="true">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :class="`toast-${toast.type}`"
      role="status"
    >
      <div class="toast-header">
        <strong class="toast-title">{{ toast.title }}</strong>
        <button class="toast-close" type="button" @click="dismiss(toast.id)">x</button>
      </div>
      <div class="toast-body">{{ toast.message }}</div>
    </div>
  </div>
</template>

<script>
import { useToasts, removeToast } from '@/utils/notify'

export default {
  name: 'ToastHost',
  computed: {
    toasts() {
      return useToasts().toasts
    }
  },
  methods: {
    dismiss(id) {
      removeToast(id)
    }
  }
}
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

.toast-item {
  min-width: 240px;
  max-width: 360px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.toast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 0.9rem;
}

.toast-title {
  font-weight: 700;
}

.toast-body {
  padding: 10px 12px;
  font-size: 0.9rem;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
}

.toast-success {
  border-color: #bbf7d0;
}

.toast-error {
  border-color: #fecaca;
}

.toast-info {
  border-color: #bfdbfe;
}
</style>

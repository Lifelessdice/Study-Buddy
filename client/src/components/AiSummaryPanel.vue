<template>
  <div>
    <BaseButton
      :class="buttonClass"
      :variant="variant"
      :size="size"
      :outline="outline"
      :loading="loading"
      :disabled="disabled || loading"
      @click.stop="$emit('generate')"
    >
      Generate Summary
    </BaseButton>

    <div v-if="loading" :class="loadingClass">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Generating summary, please wait...</p>
    </div>

    <div v-if="summary && !loading">{{ summary }}</div>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  components: { BaseButton },
  props: {
    summary: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: null
    },
    outline: {
      type: Boolean,
      default: false
    },
    buttonClass: {
      type: String,
      default: 'mb-2'
    },
    loadingClass: {
      type: String,
      default: 'text-center my-2'
    }
  }
}
</script>

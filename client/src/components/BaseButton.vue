<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :class="[
      'btn',
      variantClass,
      sizeClass,
      outline ? `btn-outline-${variant}` : `btn-${variant}`,
      { disabled: disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
    <slot />
  </component>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    to: [String, Object],
    variant: {
      type: String,
      default: 'primary'
    },
    outline: {
      type: Boolean,
      default: false
    },
    size: {
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
    type: {
      type: String,
      default: 'button'
    }
  },
  computed: {
    tag() {
      return this.to ? 'router-link' : 'button'
    },
    linkAttrs() {
      return this.to
        ? { to: this.to }
        : { type: this.type }
    },
    variantClass() {
      return this.outline ? '' : ''
    },
    sizeClass() {
      if (this.size === 'sm') return 'btn-sm'
      if (this.size === 'lg') return 'btn-lg'
      return ''
    }
  },
  methods: {
    handleClick(event) {
      if (this.loading || this.disabled) {
        event.preventDefault()
        return
      }
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease, color 0.12s ease;
}

.btn.btn-sm {
  padding: 0.35rem 0.8rem;
}

.btn:not(.disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}
</style>

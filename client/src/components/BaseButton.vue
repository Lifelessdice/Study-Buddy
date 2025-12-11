<template>
  <component
    :is="componentTag"
    v-bind="$attrs"
    :type="componentTag === 'button' ? type : undefined"
    :to="to"
    :href="href"
    :target="href ? target : undefined"
    :rel="href ? rel : undefined"
    class="sb-btn"
    :class="btnClasses"
    :aria-disabled="componentTag !== 'button' ? isDisabled : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="sb-btn__spinner" aria-hidden="true"></span>
    <span class="sb-btn__content">
      <slot />
    </span>
  </component>
</template>

<script>
export default {
  name: 'BaseButton',
  inheritAttrs: false,
  props: {
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
      default: 'md' // sm | md | lg
    },
    block: {
      type: Boolean,
      default: false
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
    },
    to: [String, Object],
    href: String,
    target: String,
    rel: String
  },
  computed: {
    componentTag() {
      if (this.to) return 'router-link'
      if (this.href) return 'a'
      return 'button'
    },
    isDisabled() {
      return this.disabled || this.loading
    },
    btnClasses() {
      return [
        this.outline ? `sb-btn--outline-${this.variant}` : `sb-btn--${this.variant}`,
        `sb-btn--${this.size}`,
        {
          'sb-btn--block': this.block,
          'is-loading': this.loading,
          'is-disabled': this.isDisabled && this.componentTag !== 'button'
        }
      ]
    }
  },
  methods: {
    handleClick(evt) {
      if (this.isDisabled) {
        evt.preventDefault()
        evt.stopImmediatePropagation?.()
        return
      }
      this.$emit('click', evt)
    }
  }
}
</script>

<style scoped>
:global(:root) {
  --sb-primary: #2563eb;
  --sb-primary-strong: #1d4ed8;
  --sb-secondary: #334155;
  --sb-secondary-strong: #1f2937;
  --sb-success: #16a34a;
  --sb-success-strong: #15803d;
  --sb-warning: #d97706;
  --sb-warning-strong: #b45309;
  --sb-danger: #dc2626;
  --sb-danger-strong: #b91c1c;
}

.sb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.6rem 1.1rem;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.12s ease, background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  user-select: none;
}

.sb-btn--sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.9rem;
}

.sb-btn--md {
  font-size: 1rem;
}

.sb-btn--lg {
  padding: 0.8rem 1.4rem;
  font-size: 1.05rem;
}

.sb-btn--block {
  width: 100%;
}

.sb-btn--primary {
  background: var(--sb-primary);
  color: #fff;
}

.sb-btn--secondary {
  background: var(--sb-secondary);
  color: #fff;
}

.sb-btn--success {
  background: var(--sb-success);
  color: #fff;
}

.sb-btn--warning {
  background: var(--sb-warning);
  color: #fff;
}

.sb-btn--danger {
  background: var(--sb-danger);
  color: #fff;
}

.sb-btn--outline-primary {
  background: #fff;
  color: var(--sb-primary);
  border: 2px solid rgba(37, 99, 235, 0.4);
  box-shadow: none;
}

.sb-btn--outline-secondary {
  background: #fff;
  color: var(--sb-secondary);
  border: 2px solid rgba(51, 65, 85, 0.35);
  box-shadow: none;
}

.sb-btn--outline-success {
  background: #fff;
  color: var(--sb-success);
  border: 2px solid rgba(22, 163, 74, 0.35);
  box-shadow: none;
}

.sb-btn--outline-warning {
  background: #fff;
  color: var(--sb-warning);
  border: 2px solid rgba(217, 119, 6, 0.35);
  box-shadow: none;
}

.sb-btn--outline-danger {
  background: #fff;
  color: var(--sb-danger);
  border: 2px solid rgba(220, 38, 38, 0.35);
  box-shadow: none;
}

.sb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.sb-btn--primary:hover {
  background: var(--sb-primary-strong);
}

.sb-btn--secondary:hover {
  background: var(--sb-secondary-strong);
}

.sb-btn--success:hover {
  background: var(--sb-success-strong);
}

.sb-btn--warning:hover {
  background: var(--sb-warning-strong);
}

.sb-btn--danger:hover {
  background: var(--sb-danger-strong);
}

.sb-btn--outline-primary:hover {
  color: #fff;
  background: var(--sb-primary);
  border-color: var(--sb-primary);
}

.sb-btn--outline-secondary:hover {
  color: #fff;
  background: var(--sb-secondary);
  border-color: var(--sb-secondary);
}

.sb-btn--outline-success:hover {
  color: #fff;
  background: var(--sb-success);
  border-color: var(--sb-success);
}

.sb-btn--outline-warning:hover {
  color: #fff;
  background: var(--sb-warning);
  border-color: var(--sb-warning);
}

.sb-btn--outline-danger:hover {
  color: #fff;
  background: var(--sb-danger);
  border-color: var(--sb-danger);
}

.sb-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.sb-btn.is-disabled,
.sb-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.sb-btn__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: sb-spin 0.9s linear infinite;
}

.sb-btn--outline-primary .sb-btn__spinner,
.sb-btn--outline-secondary .sb-btn__spinner,
.sb-btn--outline-success .sb-btn__spinner,
.sb-btn--outline-warning .sb-btn__spinner,
.sb-btn--outline-danger .sb-btn__spinner {
  border-color: rgba(51, 65, 85, 0.25);
  border-top-color: currentColor;
}

.sb-btn__content {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.sb-btn.is-loading {
  cursor: wait;
}

@keyframes sb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <button
    class="btn"
    v-bind="$attrs"
    type="button"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton'
}
</script>

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
      Generate Quiz
    </BaseButton>

    <div v-if="loading" :class="loadingClass">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Generating quiz, please wait...</p>
    </div>

    <ul v-if="quiz.length && !loading" class="list-group">
      <li v-for="(q, index) in quiz" :key="index" class="list-group-item">
        <strong>Q{{ index + 1 }}: {{ q.question }}</strong>
        <ul class="list-group mt-2">
          <li
            v-for="(opt, i) in q.options"
            :key="i"
            class="list-group-item"
            :class="{
              'list-group-item-success': q.selectedIndex !== null && i === q.correctIndex,
              'list-group-item-danger': q.selectedIndex === i && i !== q.correctIndex
            }"
            style="cursor: pointer"
            @click.stop="$emit('select', q, i)"
          >
            {{ opt }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  components: { BaseButton },
  props: {
    quiz: {
      type: Array,
      default: () => []
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
      default: 'success'
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

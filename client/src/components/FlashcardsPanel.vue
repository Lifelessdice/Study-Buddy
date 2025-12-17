<template>
  <div>
    <BaseButton
      class="mb-3"
      :variant="variant"
      :loading="loading"
      :disabled="loading"
      @click.stop="$emit('generate')"
    >
      <span v-if="loading">Generating...</span>
      <span v-else>Generate Flashcards</span>
    </BaseButton>

    <div v-if="loading" class="text-center my-3">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Generating flashcards, please wait...</p>
    </div>

    <div v-if="flashcards.length && !loading" class="flashcards-container">
      <div
        class="flashcard"
        v-for="(fc, index) in flashcards"
        :key="index"
        :class="{ flipped: fc.flipped }"
        @click.stop="$emit('toggle', index)"
      >
        <div class="front">
          Q: {{ fc.question }}
        </div>
        <div class="back">
          A: {{ fc.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  components: { BaseButton },
  props: {
    flashcards: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'warning'
    }
  }
}
</script>

<style scoped>
.flashcards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.flashcard {
  width: 250px;
  height: 160px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
}

.flashcard .front,
.flashcard .back {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  backface-visibility: hidden;
  transition: transform 0.6s;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
}

.flashcard .back {
  background: #f8f9fa;
  transform: rotateY(180deg);
}

.flashcard.flipped .front {
  transform: rotateY(180deg);
}

.flashcard.flipped .back {
  transform: rotateY(0deg);
}

@media (max-width: 576px) {
  .flashcards-container {
    gap: 0.75rem;
  }

  .flashcard {
    width: 100%;
    height: 150px;
  }
}
</style>

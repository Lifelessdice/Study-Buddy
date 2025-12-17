<template>
  <div class="container mt-5">
    <h2 class="mb-4">{{ note.topic }}</h2>

    <div class="card shadow-sm">
      <div class="card-body text-start" style="white-space: pre-line;">
        <p class="mb-0">{{ note.content }}</p>
      </div>
    </div>

    <!-- AI Feature Tabs -->
    <ul class="nav nav-tabs mt-4" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-bs-toggle="tab" href="#summary">Summary</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#quiz">Quiz</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#flashcards">Flashcards</a>
      </li>
    </ul>

    <div class="tab-content p-3 border border-top-0">
      <div v-if="aiError" class="alert alert-warning mb-3">{{ aiError }}</div>

      <!-- Summary -->
      <div class="tab-pane fade show active" id="summary">
        <BaseButton
          class="mb-3"
          variant="primary"
          :loading="loadingSummary"
          :disabled="loadingSummary"
          @click="generateSummary"
        >
          Generate Summary
        </BaseButton>

        <div v-if="loadingSummary" class="text-center my-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Generating summary, please wait...</p>
        </div>

        <div v-if="summary && !loadingSummary">{{ summary }}</div>
      </div>

      <!-- Quiz -->
      <div class="tab-pane fade" id="quiz">
        <BaseButton
          class="mb-3"
          variant="success"
          :loading="loadingQuiz"
          :disabled="loadingQuiz"
          @click="generateQuiz"
        >
          Generate Quiz
        </BaseButton>

        <div v-if="loadingQuiz" class="text-center my-3">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Generating quiz, please wait...</p>
        </div>

        <ul v-if="quiz.length && !loadingQuiz" class="list-group">
          <li v-for="(q, index) in quiz" :key="index" class="list-group-item">
            <strong>Q{{ index + 1 }}: {{ q.question }}</strong>
            <ul class="list-group mt-2">
              <li
                v-for="(opt, i) in q.options"
                :key="i"
                class="list-group-item"
                :class="{
                  'list-group-item-success':
                    q.selectedIndex !== null && i === q.correctIndex,
                  'list-group-item-danger':
                    q.selectedIndex === i && i !== q.correctIndex
                }"
                style="cursor: pointer"
                @click="selectOption(q, i)"
              >
                {{ opt }}
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Flashcards Tab -->
      <div class="tab-pane fade" id="flashcards">
        <FlashcardsPanel
          :flashcards="flashcards"
          :loading="loadingFlashcards"
          @generate="generateFlashcards"
          @toggle="toggleFlashcard"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from '../Api'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'
import { normalizeAiFlashcards, toggleFlashcard } from '@/utils/aiFlashcards'
import { normalizeAiQuiz } from '@/utils/aiQuiz'

export default {
  props: ['id'],
  components: { FlashcardsPanel },
  data() {
    return {
      note: {},
      summary: '',
      quiz: [],
      flashcards: [],
      aiError: '',
      loadingSummary: false,
      loadingQuiz: false,
      loadingFlashcards: false
    }
  },
  async created() {
    try {
      const res = await api.get(`/notes/${this.id}`)
      this.note = res.data.data
    } catch (err) {
      alert('Failed to load note')
    }
  },
  methods: {

    selectOption(question, index) {
      if (question.selectedIndex !== null) return
      question.selectedIndex = index
    },

    
    async generateSummary() {
      try {
        this.aiError = ''
        this.loadingSummary = true
        this.summary = ''
        const res = await api.post(`/notes/${this.id}/summaries`)
        this.summary = res.data.summary || res.data.data?.summary || 'No summary returned'
      } catch (err) {
        this.aiError = 'Failed to generate summary. Please try again.'
      } finally {
        this.loadingSummary = false
      }
    },
    async generateQuiz() {
      try {
        this.aiError = ''
        this.loadingQuiz = true
        this.quiz = []

        const res = await api.post(`/notes/${this.id}/aiquizzes`)
        const rawQuiz = res.data.quiz || res.data.data?.quiz || []
        const normalized = normalizeAiQuiz(rawQuiz)

        if (!normalized.length) {
          this.aiError = 'No quiz questions were returned.'
          return
        }

        this.quiz = normalized
      } catch (err) {
        this.aiError = 'Failed to generate quiz. Please try again.'
      } finally {
        this.loadingQuiz = false
      }
    },

    toggleFlashcard(index) {
      toggleFlashcard(this.flashcards, index)
    },
    async generateFlashcards() {
      try {
        this.aiError = ''
        this.loadingFlashcards = true
        this.flashcards = []
        const res = await api.post(`/notes/${this.id}/flashcards`)
        const payload = res.data.flashcards || res.data.data?.flashcards || []
        this.flashcards = normalizeAiFlashcards(payload)
        if (!this.flashcards.length) {
          this.aiError = 'No flashcards were returned.'
        }
      } catch (err) {
        this.aiError = 'Failed to generate flashcards. Please try again.'
      } finally {
        this.loadingFlashcards = false
      }
    }
  }
}
</script>

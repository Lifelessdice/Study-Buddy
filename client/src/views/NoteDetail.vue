<template>
  <div class="container mt-5">
    <h2 class="mb-4">{{ note.topic }}</h2>

    <div class="card shadow-sm">
      <div class="card-body text-start" style="white-space: pre-line;">
        <p class="mb-0">{{ note.content }}</p>
      </div>
    </div>

    <!-- AI Feature Tabs -->
    <ul class="nav nav-tabs mt-4 responsive-tabs" role="tablist">
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
        <AiSummaryPanel
          :summary="summary"
          :loading="loadingSummary"
          button-class="mb-3"
          loading-class="text-center my-3"
          @generate="generateSummary"
        />
      </div>

      <!-- Quiz -->
      <div class="tab-pane fade" id="quiz">
        <AiQuizPanel
          :quiz="quiz"
          :loading="loadingQuiz"
          button-class="mb-3"
          loading-class="text-center my-3"
          @generate="generateQuiz"
          @select="selectOption"
        />
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
import AiQuizPanel from '@/components/AiQuizPanel.vue'
import AiSummaryPanel from '@/components/AiSummaryPanel.vue'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'
import { normalizeAiFlashcards, toggleFlashcard } from '@/utils/aiFlashcards'
import { normalizeAiQuiz, selectQuizOption } from '@/utils/aiQuiz'

export default {
  props: ['noteSlug'],
  components: { AiQuizPanel, AiSummaryPanel, FlashcardsPanel },
  data() {
    return {
      note: {},
      noteId: '',
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
      const res = await api.get(`/notes/${this.noteSlug}`)
      this.note = res.data.data
      this.noteId = this.note?._id || ''
    } catch (err) {
      alert('Failed to load note')
    }
  },
  methods: {

    selectOption(question, index) {
      selectQuizOption(question, index)
    },

    
    async generateSummary() {
      try {
        this.aiError = ''
        this.loadingSummary = true
        this.summary = ''
        const res = await api.post(`/notes/${this.noteId}/summaries`)
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

        const res = await api.post(`/notes/${this.noteId}/aiquizzes`)
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
      const res = await api.post(`/notes/${this.noteId}/flashcards`)
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

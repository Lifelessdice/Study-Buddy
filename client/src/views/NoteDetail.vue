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
import Api from '@/Api'
import AiQuizPanel from '@/components/AiQuizPanel.vue'
import AiSummaryPanel from '@/components/AiSummaryPanel.vue'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'
import { handleAiFlashcards, handleAiQuiz, handleAiSummary } from '@/utils/aiHandlers'
import { toggleFlashcard } from '@/utils/aiFlashcards'
import { selectQuizOption } from '@/utils/aiQuiz'
import { noteSlug } from '@/utils/slug'

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
      const listRes = await Api.get('/notes')
      const notes = listRes.data.data || listRes.data || []
      const found = notes.find(n => noteSlug(n) === this.noteSlug)
      if (!found) {
        alert('Note not found')
        return
      }
      this.noteId = found._id
      try {
        const detailRes = await Api.get(`/notes/${found._id}`)
        this.note = detailRes.data.data || found
      } catch (err) {
        this.note = found
      }
    } catch (err) {
      alert('Failed to load note')
    }
  },
  methods: {

    selectOption(question, index) {
      selectQuizOption(question, index)
    },

    
    async generateSummary() {
      await handleAiSummary({
        request: () => Api.post(`/notes/${this.noteId}/summaries`),
        setLoading: (value) => { this.loadingSummary = value },
        setSummary: (value) => { this.summary = value },
        setError: (value) => { this.aiError = value }
      })
    },
    async generateQuiz() {
      await handleAiQuiz({
        request: () => Api.post(`/notes/${this.noteId}/aiquizzes`),
        setLoading: (value) => { this.loadingQuiz = value },
        setQuiz: (value) => { this.quiz = value },
        setError: (value) => { this.aiError = value }
      })
    },

    toggleFlashcard(index) {
      toggleFlashcard(this.flashcards, index)
    },
    async generateFlashcards() {
      await handleAiFlashcards({
        request: () => Api.post(`/notes/${this.noteId}/flashcards`),
        setLoading: (value) => { this.loadingFlashcards = value },
        setFlashcards: (value) => { this.flashcards = value },
        setError: (value) => { this.aiError = value }
      })
    }
  }
}
</script>

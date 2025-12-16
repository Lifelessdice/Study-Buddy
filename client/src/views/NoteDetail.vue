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
      <BaseButton
          class="mb-3"
          variant="warning"
          :loading="loadingFlashcards"
          :disabled="loadingFlashcards"
          @click="generateFlashcards"
  >
          <span v-if="loadingFlashcards">Generating...</span>
          <span v-else>Generate Flashcards</span>
      </BaseButton>

      <div v-if="loadingFlashcards" class="text-center my-3">
          <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading...</span>
          </div>
          <p>Generating flashcards, please wait...</p>
      </div>

      <div v-if="flashcards.length && !loadingFlashcards" class="flashcards-container">
          <div
          class="flashcard"
          v-for="(fc, index) in flashcards"
          :key="index"
          :class="{ flipped: fc.flipped }"
          @click="fc.flipped = !fc.flipped"
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
    </div>
  </div>
</template>

<script>
import api from '../Api'

export default {
  props: ['id'],
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
      
        if (!Array.isArray(rawQuiz) || !rawQuiz.length) {
          this.aiError = 'No quiz questions were returned.'
          return
        }
      
        this.quiz = rawQuiz.map(q => {
          // Normalize answer for matching
          const normalizedAnswer = (q.answer || '')
            .toString()
            .replace(/^[A-D]\.\s*/i, '')
            .trim()
            .toLowerCase()
        
          // Find correct option index safely
          const correctIndex = q.options.findIndex(opt =>
            opt
              .toString()
              .toLowerCase()
              .includes(normalizedAnswer)
          )
        
          return {
            question: q.question,
            options: q.options,
            answer: q.answer,
            correctIndex: correctIndex >= 0 ? correctIndex : null,
            selectedIndex: null
          }
        })
      } catch (err) {
        this.aiError = 'Failed to generate quiz. Please try again.'
      } finally {
        this.loadingQuiz = false
      }
    },

    async generateFlashcards() {
      try {
        this.aiError = ''
        this.loadingFlashcards = true
        this.flashcards = []
        const res = await api.post(`/notes/${this.id}/flashcards`)
        // Add a flipped property for animation
        const payload = res.data.flashcards || res.data.data?.flashcards || []
        this.flashcards = payload.map(fc => ({
          ...fc,
          flipped: false
        }))
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

<style scoped>
.flashcards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.flashcard {
  width: 200px;
  height: 120px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard .front,
.flashcard .back {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  backface-visibility: hidden;
  transition: transform 0.6s;
  position: absolute;
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

.flashcard {
  position: relative;
  transform-style: preserve-3d;
}
</style>

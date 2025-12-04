<template>
  <div class="container mt-5">
    <h2 class="mb-4">{{ note.topic }}</h2>

    <div class="card shadow-sm">
      <div class="card-body">
        <p>{{ note.content }}</p>
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
      <!-- Summary -->
      <div class="tab-pane fade show active" id="summary">
        <button class="btn btn-primary mb-3" @click="generateSummary" :disabled="loadingSummary">
          Generate Summary
        </button>

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
        <button class="btn btn-success mb-3" @click="generateQuiz" :disabled="loadingQuiz">
          Generate Quiz
        </button>

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
              <li v-for="(opt, i) in q.options" :key="i" class="list-group-item">
                {{ String.fromCharCode(65 + i) }}. {{ opt }}
              </li>
            </ul>
            <small class="text-muted mt-2 d-block">Answer: {{ q.answer }}</small>
          </li>
        </ul>
      </div>

      <!-- Flashcards -->
      <div class="tab-pane fade" id="flashcards">
        <button class="btn btn-warning mb-3" @click="generateFlashcards" :disabled="loadingFlashcards">
          Generate Flashcards
        </button>

        <div v-if="loadingFlashcards" class="text-center my-3">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Generating flashcards, please wait...</p>
        </div>

        <ul v-if="flashcards.length && !loadingFlashcards" class="list-group">
          <li v-for="(fc, index) in flashcards" :key="index" class="list-group-item">
            <strong>Q: {{ fc.question }}</strong><br>
            <small class="text-muted">A: {{ fc.answer }}</small>
          </li>
        </ul>
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
    async generateSummary() {
      try {
        this.loadingSummary = true
        this.summary = ''
        const res = await api.post(`/notes/${this.id}/summaries`)
        this.summary = res.data.data.summary
      } catch (err) {
        alert('Failed to generate summary')
      } finally {
        this.loadingSummary = false
      }
    },
    async generateQuiz() {
      try {
        this.loadingQuiz = true
        this.quiz = []
        const res = await api.post(`/notes/${this.id}/aiquizzes`)
        this.quiz = res.data.quiz || res.data.data?.quiz
      } catch (err) {
        alert('Failed to generate quiz')
      } finally {
        this.loadingQuiz = false
      }
    },
    async generateFlashcards() {
      try {
        this.loadingFlashcards = true
        this.flashcards = []
        const res = await api.post(`/notes/${this.id}/flashcards`)
        this.flashcards = res.data.flashcards || res.data.data?.flashcards
      } catch (err) {
        alert('Failed to generate flashcards')
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

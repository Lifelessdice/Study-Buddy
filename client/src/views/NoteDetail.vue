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
        <button class="btn btn-primary mb-3" @click="generateSummary">
          Generate Summary
        </button>
        <div v-if="summary">{{ summary }}</div>
      </div>

      <!-- Quiz -->
<div class="tab-pane fade" id="quiz">
  <button class="btn btn-success mb-3" @click="generateQuiz">
    Generate Quiz
  </button>

  <ul v-if="quiz.length" class="list-group">
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
        <button class="btn btn-warning mb-3" @click="generateFlashcards">
          Generate Flashcards
        </button>

        <ul v-if="flashcards.length" class="list-group">
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
  props: ['id'], // Make sure your route has props: true
  data() {
    return {
      note: {},
      summary: '',
      quiz: [],
      flashcards: []
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
    const res = await api.post(`/notes/${this.id}/summaries`)
    this.summary = res.data.data.summary
  },

  async generateQuiz() {
    try {
      const res = await api.post(`/notes/${this.id}/aiquizzes`)
      // Adapt to backend format
      this.quiz = res.data.quiz || []
    } catch (err) {
      console.error(err)
      alert('Failed to generate quiz')
    }
  },

  async generateFlashcards() {
    try {
      const res = await api.post(`/notes/${this.id}/flashcards`)
      // Adapt to backend format
      this.flashcards = res.data.flashcards || []
    } catch (err) {
      console.error(err)
      alert('Failed to generate flashcards')
    }
  }
}
}
</script>

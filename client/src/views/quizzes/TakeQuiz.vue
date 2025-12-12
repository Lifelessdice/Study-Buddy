<template>
  <div class="container mt-4" style="max-width: 820px" v-if="loaded">
    <div class="card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <p class="text-uppercase small text-muted mb-1">Quiz</p>
          <h3 class="mb-1">{{ quiz.title }}</h3>
          <div class="text-muted small">
            Questions: {{ quiz.questions?.length || 0 }}
            <span v-if="quiz.timeLimit">• Time: {{ quiz.timeLimit }} min</span>
          </div>
        </div>
        <router-link
          class="btn btn-outline-secondary btn-sm"
          :to="{ name: 'CourseDashboard', params: { id: quiz.course }, query: { tab: 'quizzes' } }"
        >
          Back to course
        </router-link>
      </div>
    </div>

    <div class="card p-3">
      <div class="mb-3" v-if="quiz.description">
        <p class="text-muted mb-0">{{ quiz.description }}</p>
      </div>

      <div v-for="(q, qIdx) in quiz.questions" :key="qIdx" class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="small text-muted">Question {{ qIdx + 1 }}</div>
            <div class="fw-bold">{{ q.text }}</div>
          </div>
          <div class="badge bg-light text-muted">{{ q.answers?.length || 0 }} options</div>
        </div>
        <div class="list-group">
          <label
            v-for="(opt, oIdx) in q.answers"
            :key="oIdx"
            class="list-group-item list-group-item-action d-flex align-items-center gap-2"
          >
            <input
              type="radio"
              class="form-check-input"
              :name="`q-${qIdx}`"
              :value="oIdx"
              v-model="answers[qIdx]"
            />
            <span>{{ opt }}</span>
          </label>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-outline-secondary" :disabled="submitting" @click="cancel">
          Cancel
        </button>
        <button class="btn btn-primary" :disabled="submitting || !allAnswered" @click="submit">
          {{ submitting ? 'Submitting...' : 'Submit answers' }}
        </button>
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>

  <div v-if="showSubmitOverlay" class="overlay">
    <div class="overlay-card">
      <h5 class="mb-2">Quiz submitted</h5>
      <p class="mb-3">
        Score: {{ submitScore !== null && submitScore !== undefined ? submitScore + '%' : 'N/A' }}
      </p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" @click="closeSubmitOverlay">
          OK
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import QuizService from '@/services/QuizService'
import Api from '@/Api'

export default {
  name: 'TakeQuiz',
  props: ['quizId'],
  data() {
    return {
      quiz: {},
      answers: [],
      submitting: false,
      loaded: false,
      showSubmitOverlay: false,
      submitScore: null
    }
  },
  computed: {
    user() {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    },
    allAnswered() {
      if (!this.quiz.questions) return false
      return this.quiz.questions.every((_, idx) => this.answers[idx] !== null && this.answers[idx] !== undefined)
    }
  },
  async mounted() {
    try {
      const res = await QuizService.get(this.$route.params.quizId)
      const quiz = res.data.data || res.data
      this.quiz = quiz
      this.answers = (quiz.questions || []).map(() => null)

      this.loaded = true
    } catch (err) {
      alert('Failed to load quiz')
      this.$router.push({ name: 'Courses' })
    }
  },
  methods: {
    cancel() {
      this.$router.push({ name: 'CourseDashboard', params: { id: this.quiz.course }, query: { tab: 'quizzes' } })
    },
    async submit() {
      if (!this.user || !this.user._id) {
        alert('You must be logged in')
        return
      }
      this.submitting = true
      try {
        // Simple score calculation client-side
        const totalQuestions = (this.quiz.questions && this.quiz.questions.length) || 0
        let correct = 0
        this.quiz.questions.forEach((q, idx) => {
          if (this.answers[idx] === q.correctAnswerIndex) correct++
        })
        const score = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0

        await Api.post('/quizparticipations', {
          student: this.user._id,
          quiz: this.quiz._id,
          answers: this.answers,
          score
        })

        this.submitScore = score
        this.showSubmitOverlay = true
      } catch (err) {
        console.error(err)
        alert('Failed to submit quiz')
      } finally {
        this.submitting = false
      }
    },
    closeSubmitOverlay() {
      this.showSubmitOverlay = false
      this.$router.push({ name: 'CourseDashboard', params: { id: this.quiz.course }, query: { tab: 'quizzes' } })
    }
  }
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.overlay-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  max-width: 360px;
  width: 100%;
}
</style>

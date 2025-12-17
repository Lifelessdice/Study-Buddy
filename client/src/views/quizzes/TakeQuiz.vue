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
        <BaseButton
          :to="{ name: 'CourseDashboard', params: { courseSlug: courseSlug }, query: { tab: 'quizzes' } }"
          variant="secondary"
          outline
          size="sm"
        >
          Back to course
        </BaseButton>
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

      <div class="d-flex justify-content-end gap-2 mt-3 quiz-actions">
        <BaseButton variant="secondary" outline :disabled="submitting" @click="cancel">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="submitting"
          :disabled="submitting || !allAnswered"
          @click="submit"
        >
          {{ submitting ? 'Submitting...' : 'Submit answers' }}
        </BaseButton>
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import QuizService from '@/services/QuizService'
import CourseService from '@/services/CourseService'
import Api from '@/Api'

export default {
  name: 'TakeQuiz',
  props: ['quizSlug'],
  data() {
    return {
      quiz: {},
      answers: [],
      courseSlug: '',
      submitting: false,
      loaded: false
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
      const res = await QuizService.get(this.$route.params.quizSlug)
      const quiz = res.data.data || res.data
      this.quiz = quiz
      this.answers = (quiz.questions || []).map(() => null)

      try {
        const courseRes = await CourseService.getById(quiz.course)
        const course = courseRes.data.data || courseRes.data
        this.courseSlug = course.slug || ''
      } catch (err) {
        // non-fatal
      }

      this.loaded = true
    } catch (err) {
      alert('Failed to load quiz')
      this.$router.push({ name: 'Courses' })
    }
  },
  methods: {
    cancel() {
      this.$router.push({ name: 'CourseDashboard', params: { courseSlug: this.courseSlug }, query: { tab: 'quizzes' } })
    },
    async submit() {
      if (!this.user || !this.user._id) {
        alert('You must be logged in')
        return
      }
      this.submitting = true
      try {
        // Simple score calculation client-side
        let correct = 0
        this.quiz.questions.forEach((q, idx) => {
          if (this.answers[idx] === q.correctAnswerIndex) correct++
        })
        const score = Math.round((correct / this.quiz.questions.length) * 100)

        await Api.post('/quizparticipations', {
          student: this.user._id,
          quiz: this.quiz._id,
          answers: this.answers,
          score
        })

        alert(`Quiz submitted! Score: ${score}%`)
        this.$router.push({ name: 'CourseDashboard', params: { courseSlug: this.courseSlug }, query: { tab: 'quizzes' } })
      } catch (err) {
        console.error(err)
        alert('Failed to submit quiz')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}

.quiz-actions {
  flex-wrap: wrap;
}

@media (max-width: 576px) {
  .quiz-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .quiz-actions .btn {
    width: 100%;
  }
}
</style>

<template>
  <div class="container mt-4" style="max-width: 760px">
    <h3 class="mb-3">Create Quiz</h3>
    <div class="card p-3">
      <p class="text-muted mb-3">Course: {{ courseName || courseId }}</p>

      <div class="mb-3">
        <label class="form-label">Title</label>
        <input v-model="form.title" type="text" class="form-control" placeholder="HTTP & REST Basics">
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" rows="3" class="form-control" placeholder="Short description"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Time limit (minutes)</label>
        <input v-model.number="form.timeLimit" type="number" min="1" class="form-control">
      </div>

      <div class="mb-3">
        <h6 class="mb-2">Questions</h6>
        <div
          v-for="(q, qIdx) in form.questions"
          :key="qIdx"
          class="border rounded p-3 mb-3"
        >
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Question {{ qIdx + 1 }}</label>
            <button
              v-if="form.questions.length > 1"
              class="btn btn-sm btn-outline-danger"
              type="button"
              @click="removeQuestion(qIdx)"
            >
              Remove question
            </button>
          </div>
          <input v-model="q.text" type="text" class="form-control mb-3" placeholder="Question text">
          <div class="mb-2 fw-bold">Options</div>
          <div v-for="(opt, oIdx) in q.answers" :key="oIdx" class="input-group mb-2">
            <span class="input-group-text">
              <input
                type="radio"
                :checked="q.correctAnswerIndex === oIdx"
                @change="setCorrect(q, oIdx)"
              >
            </span>
            <input v-model="q.answers[oIdx]" type="text" class="form-control" placeholder="Option text">
            <button
              class="btn btn-outline-danger"
              type="button"
              :disabled="q.answers.length <= 2"
              @click="removeOption(q, oIdx)"
            >
              Remove
            </button>
          </div>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="addOption(q)">+ Add option</button>
        </div>
        <button class="btn btn-sm btn-outline-primary" type="button" @click="addQuestion">+ Add question</button>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? 'Creating...' : 'Create Quiz' }}
        </button>
        <router-link class="btn btn-link" :to="{ name: 'CourseDashboard', params: { id: courseId }, query: { tab: 'quizzes' } }">
          Cancel
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import QuizService from '@/services/QuizService'
import CourseService from '@/services/CourseService'

export default {
  name: 'CreateQuiz',
  props: ['id'],
  data() {
    return {
      courseId: this.$route.params.id,
      courseName: '',
      submitting: false,
      form: {
        title: '',
        description: '',
        timeLimit: 10,
        questions: [{ text: '', answers: ['', ''], correctAnswerIndex: 0 }]
      }
    }
  },
  async mounted() {
    try {
      const res = await CourseService.getById(this.courseId)
      const c = res.data.data || res.data
      this.courseName = c.name
    } catch (err) {
      // non-fatal
    }
  },
  methods: {
    addQuestion() {
      this.form.questions.push({ text: '', answers: ['', ''], correctAnswerIndex: 0 })
    },
    removeQuestion(idx) {
      if (this.form.questions.length <= 1) return
      this.form.questions.splice(idx, 1)
    },
    addOption(q) {
      q.answers.push('')
    },
    removeOption(q, idx) {
      if (q.answers.length <= 2) return
      q.answers.splice(idx, 1)
      if (q.correctAnswerIndex >= q.answers.length) {
        q.correctAnswerIndex = q.answers.length - 1
      }
    },
    setCorrect(q, idx) {
      q.correctAnswerIndex = idx
    },
    async submit() {
      this.submitting = true
      try {
        const questions = this.form.questions
          .filter(q => q.text && q.text.trim())
          .map(q => {
            const answers = q.answers.filter(a => a && a.trim())
            const correctIdx = Math.min(Math.max(q.correctAnswerIndex ?? 0, 0), Math.max(answers.length - 1, 0))
            return { text: q.text, answers, correctAnswerIndex: correctIdx }
          })
          .filter(q => q.answers.length >= 2)

        const payload = {
          title: this.form.title || 'Untitled Quiz',
          description: this.form.description,
          timeLimit: this.form.timeLimit,
          course: this.courseId,
          questions
        }
        await QuizService.create(payload)
        this.$router.push({ name: 'CourseDashboard', params: { id: this.courseId }, query: { tab: 'quizzes' } })
      } catch (err) {
        console.error(err)
        alert('Failed to create quiz')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

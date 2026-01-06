<template>
  <div class="container mt-4" style="max-width: 760px">
    <h3 class="mb-3">Create Quiz</h3>
    <div class="card p-3">
      <p class="text-muted mb-3">Course: {{ courseName || courseSlug }}</p>

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
            <BaseButton
              v-if="form.questions.length > 1"
              variant="danger"
              outline
              size="sm"
              type="button"
              @click="removeQuestion(qIdx)"
            >
              Remove question
            </BaseButton>
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
            <BaseButton
              variant="danger"
              outline
              type="button"
              :disabled="q.answers.length <= 2"
              @click="removeOption(q, oIdx)"
            >
              Remove
            </BaseButton>
          </div>
          <BaseButton variant="secondary" outline size="sm" type="button" @click="addOption(q)">+ Add option</BaseButton>
        </div>
        <BaseButton variant="primary" outline size="sm" type="button" @click="addQuestion">+ Add question</BaseButton>
      </div>

      <div class="d-flex gap-2">
        <BaseButton variant="primary" :loading="submitting" :disabled="submitting" @click="submit">
          {{ submitting ? 'Creating...' : 'Create Quiz' }}
        </BaseButton>
        <BaseButton
          :to="{ name: 'CourseDashboard', params: { courseSlug: courseSlug }, query: { tab: 'quizzes' } }"
          variant="secondary"
          outline
        >
          Cancel
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import QuizService from '@/services/QuizService'
import CourseService from '@/services/CourseService'
import { courseSlug } from '@/utils/slug'
import { notifyError } from '@/utils/notify'

export default {
  name: 'CreateQuiz',
  props: ['courseSlug'],
  data() {
    return {
      courseSlug: this.$route.params.courseSlug,
      courseId: '',
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
      const res = await CourseService.getAll({ limit: 1000 })
      const list = res.data.data || res.data || []
      const found = list.find(c => courseSlug(c) === this.courseSlug)
      if (found) {
        this.courseName = found.name
        this.courseId = found._id
        this.courseSlug = courseSlug(found)
      }
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
        if (!this.courseId) {
          notifyError('Course not found')
          return
        }
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
        this.$router.push({ name: 'CourseDashboard', params: { courseSlug: this.courseSlug }, query: { tab: 'quizzes' } })
      } catch (err) {
        console.error(err)
        notifyError('Failed to create quiz')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

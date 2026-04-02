<template>
  <div class="container mt-4">
    <div class="card mb-4">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <p class="text-uppercase small text-muted mb-1">Dashboard</p>
          <h3 class="mb-0">Welcome back, {{ greetingName }}!</h3>
          <div class="text-muted">{{ user ? user.email : '' }}</div>
        </div>
      </div>
    </div>

    <div v-if="user && user.role === 'teacher'" class="card">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <p class="text-uppercase small text-muted mb-1">Teacher</p>
          <h5 class="mb-0">Manage your courses</h5>
        </div>
        <BaseButton to="/courses" variant="primary" size="sm">Go to Courses</BaseButton>
      </div>
    </div>

    <div v-if="user && user.role === 'student'">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p class="text-uppercase small text-muted mb-1">Upcoming</p>
              <h5 class="mb-0">Quizzes</h5>
            </div>

          </div>

          <div v-if="loadingUpcoming" class="text-muted">Loading upcoming quizzes...</div>
          <div v-else-if="upcomingError" class="alert alert-danger">{{ upcomingError }}</div>
          <div v-else-if="!upcomingQuizzes.length" class="alert alert-info">
            Nothing coming up. Enjoy your day!
          </div>
          <div v-else class="list-group">
            <div
              v-for="item in upcomingQuizzes"
              :key="item._id"
              class="list-group-item d-flex justify-content-between align-items-start flex-wrap gap-2"
            >
              <div>
              <div class="fw-bold">Quiz: {{ item.title }} <span class="text-muted">({{ item.courseCode || item.courseName }})</span></div>
              <div class="small text-muted mb-1">Due: {{ item.dueLabel }}</div>
            </div>
            <BaseButton
              :to="{ name: 'TakeQuiz', params: { quizSlug: item.slug } }"
              variant="primary"
              size="sm"
            >
              Start
            </BaseButton>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'
import QuizService from '@/services/QuizService'
import QuizParticipationService from '@/services/QuizParticipationService'
import { quizSlug } from '@/utils/slug'

export default {
  data() {
    return {
      user: null,
      loadingUpcoming: false,
      upcomingError: null,
      upcomingQuizzes: [],
      participatedQuizIds: []
    }
  },
  computed: {
    greetingName() {
      if (!this.user) return 'there'
      return this.user.name || this.user.email || 'there'
    }
  },
  async mounted() {
    const u = localStorage.getItem('user')
    this.user = u ? JSON.parse(u) : null
    if (!this.user) {
      this.$router.push('/login')
      return
    }

    if (this.user.role === 'student') {
      this.fetchUpcoming()
    }
  },
  methods: {
    async fetchUpcoming() {
      try {
        this.loadingUpcoming = true
        this.upcomingError = null
        this.upcomingQuizzes = []
        this.participatedQuizIds = []

        const enrollRes = await CourseService.getStudentEnrollments()
        const enrollments = enrollRes.data.data || enrollRes.data || []
        const courses = enrollments
          .map(att => att.course)
          .filter(Boolean)

        // fetch participations once to exclude already-taken quizzes
        try {
          const partsRes = await QuizParticipationService.getAll({ student: this.user._id })
          const parts = partsRes.data.data || partsRes.data || []
          this.participatedQuizIds = parts.map(p => (p.quiz && p.quiz._id) ? p.quiz._id : p.quiz).filter(Boolean)
        } catch (err) {
          console.warn('Could not load participations, showing all quizzes', err)
          this.participatedQuizIds = []
        }

        const allQuizzes = []
        for (const course of courses) {
          const res = await QuizService.getAll({ course: course._id })
          if (res.status && res.status >= 400) {
            continue
          }
          const items = res.data.data || res.data || []
          items.forEach(q => {
            allQuizzes.push({
              ...q,
              slug: quizSlug(q),
              courseCode: course.code,
              courseName: course.name
            })
          })
        }

        // sort newest first (no due date available, so fallback to createdAt)
        const filtered = allQuizzes.filter(q => !this.participatedQuizIds.includes(q._id))
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

        this.upcomingQuizzes = filtered.map(q => ({
          ...q,
          dueLabel: q.dueDate ? q.dueDate : 'No due date'
        }))
      } catch (err) {
        console.error(err)
        this.upcomingError = 'Could not load upcoming quizzes.'
      } finally {
        this.loadingUpcoming = false
      }
    },
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>

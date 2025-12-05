<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
      <div>
        <p class="text-uppercase small text-muted mb-1">Student</p>
        <h3 class="mb-0">Results</h3>
        <div class="text-muted small">All quiz attempts linked to your account.</div>
      </div>
      <router-link class="btn btn-outline-secondary btn-sm" to="/courses">Back to courses</router-link>
    </div>

    <div v-if="loading" class="text-muted">Loading results...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="!results.length" class="alert alert-info">You have not taken any quizzes yet.</div>
    <div v-else class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Quiz</th>
            <th>Course</th>
            <th>Score</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in results" :key="r._id">
            <td>{{ idx + 1 }}</td>
            <td>{{ r.quizTitle }}</td>
            <td>{{ r.courseLabel }}</td>
            <td>{{ r.score ?? '—' }}%</td>
            <td>{{ formatDate(r.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import QuizParticipationService from '@/services/QuizParticipationService'
import CourseService from '@/services/CourseService'

export default {
  name: 'StudentResults',
  data() {
    return {
      results: [],
      loading: false,
      error: null,
      courseNameById: {}
    }
  },
  computed: {
    user() {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return '-'
      return new Date(d).toLocaleString()
    },
    courseLabel(courseRef) {
      if (!courseRef) return '—'
      // If populated object
      if (typeof courseRef === 'object') {
        return courseRef.name || courseRef.code || courseRef._id || '—'
      }
      // If string id, try map
      return this.courseNameById[courseRef] || courseRef || '—'
    },
    async hydrateCourseMap(courseIds) {
      const idsToFetch = courseIds.filter(id => id && !this.courseNameById[id])
      if (!idsToFetch.length) return
      try {
        const enrollmentsRes = await CourseService.getStudentEnrollments()
        const enrollments = enrollmentsRes.data.data || enrollmentsRes.data || []
        enrollments.forEach(att => {
          const c = att.course
          if (c && c._id) {
            this.courseNameById[c._id] = c.name || c.code || c._id
          }
        })
      } catch (err) {
        console.error('hydrateCourseMap error', err)
      }
    },
    async loadResults() {
      if (!this.user?._id) {
        this.error = 'Missing user information.'
        return
      }
      this.loading = true
      this.error = null
      try {
        const res = await QuizParticipationService.getAll({ student: this.user._id })
        const data = res.data.data || res.data || []
        const courseIds = []
        data.forEach(item => {
          const courseRef = item.quiz?.course
          if (courseRef && typeof courseRef === 'string') {
            courseIds.push(courseRef)
          }
          if (courseRef && typeof courseRef === 'object' && courseRef._id) {
            this.courseNameById[courseRef._id] = courseRef.name || courseRef.code || courseRef._id
          }
        })
        await this.hydrateCourseMap(courseIds)
        this.results = data.map(item => ({
          ...item,
          quizTitle: item.quiz?.title || 'Unknown quiz',
          courseLabel: this.courseLabel(item.quiz?.course)
        }))
      } catch (err) {
        console.error(err)
        this.error = 'Failed to load results.'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadResults()
  }
}
</script>

<style scoped>
table {
  min-width: 520px;
}
</style>

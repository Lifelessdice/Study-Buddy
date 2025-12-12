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

    <!-- ONE single v-else block that handles both the stats card and the table -->
  <div v-else>
      <!-- Stats card with visual -->
      <div v-if="hasScoredResults" class="card mb-3">
        <div class="card-body d-flex flex-wrap align-items-center gap-4">
          <div class="progress-wheel">
            <svg viewBox="0 0 36 36">
              <path
                class="bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="progress"
                :stroke-dasharray="averageScore + ', 100'"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="value">{{ averageScore }}%</text>
              <text x="18" y="27" class="label">Avg</text>
            </svg>
          </div>

          <div class="d-flex flex-wrap gap-4">
            <div>
              <div class="text-uppercase small text-muted">Best score</div>
              <div class="h5 mb-0">
                {{ maxScore }}%
              </div>
            </div>
            <div>
              <div class="text-uppercase small text-muted">Lowest score</div>
              <div class="h5 mb-0">
                {{ minScore }}%
              </div>
            </div>
            <div>
              <div class="text-uppercase small text-muted">Quizzes completed</div>
              <div class="h5 mb-0">
                {{ totalQuizzesTaken }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results table -->
      <div class="table-responsive">
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
    },
    // accept numeric scores and numeric strings
    scoredResults() {
      return this.results
        .map(r => ({
          ...r,
          scoreNum: r.score !== undefined && r.score !== null ? Number(r.score) : null
        }))
        .filter(r => typeof r.scoreNum === 'number' && !isNaN(r.scoreNum))
    },
    hasScoredResults() {
      return this.scoredResults.length > 0
    },
    averageScore() {
      if (!this.hasScoredResults) return null
      const sum = this.scoredResults.reduce((acc, r) => acc + r.scoreNum, 0)
      return Math.round((sum / this.scoredResults.length) * 10) / 10 // 1 decimal
    },
    minScore() {
      if (!this.hasScoredResults) return null
      return Math.min(...this.scoredResults.map(r => r.scoreNum))
    },
    maxScore() {
      if (!this.hasScoredResults) return null
      return Math.max(...this.scoredResults.map(r => r.scoreNum))
    },
    totalQuizzesTaken() {
      return this.results.length
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return '-'
      return new Date(d).toLocaleString()
    },
    courseLabel(courseRef) {
      if (!courseRef) return '—'
      if (typeof courseRef === 'object') {
        return courseRef.name || courseRef.code || courseRef._id || '—'
      }
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

.progress-wheel {
  width: 120px;
  height: 120px;
}
.progress-wheel svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.progress-wheel .bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}
.progress-wheel .progress {
  fill: none;
  stroke: #2563eb;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}
.progress-wheel text {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-anchor: middle;
  fill: #111827;
  transform: rotate(90deg);
}
.progress-wheel .value {
  font-size: 10px;
  font-weight: 700;
}
.progress-wheel .label {
  font-size: 7px;
  fill: #6b7280;
}
</style>

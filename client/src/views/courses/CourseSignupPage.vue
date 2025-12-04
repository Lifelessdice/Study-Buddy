<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Sign Up for Courses</h2>
      <div>
        <router-link to="/courses" class="btn btn-outline-secondary">
          Back to My Courses
        </router-link>
      </div>
    </div>

    <div v-if="!isStudent" class="alert alert-warning">
      Only students can sign up for courses.
    </div>

    <div v-else>
      <div v-if="loading">Loading courses...</div>

      <div v-if="!loading && error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-if="!loading && !error && courses.length === 0" class="alert alert-info">
        No courses available to sign up for yet.
      </div>

      <div class="row">
        <div
          v-for="course in courses"
          :key="course._id"
          class="col-md-6 mb-3"
        >
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">
                {{ course.name }}
                <small class="text-muted">({{ course.code }})</small>
              </h5>
              <p class="card-text" v-if="course.overview">
                <strong>Overview:</strong> {{ course.overview }}
              </p>
              <p class="card-text" v-if="course.degree">
                <strong>Degree:</strong> {{ course.degree }}
              </p>
              <p class="card-text">
                <small class="text-muted">
                  Created: {{ formatDate(course.createdAt) }}
                </small>
              </p>

              <div class="mt-auto d-flex justify-content-between align-items-center">
                <span v-if="isEnrolled(course)" class="badge bg-success">
                  Enrolled
                </span>
                <span v-else class="text-muted">
                  Not enrolled
                </span>

                <button
                  class="btn btn-sm"
                  :class="isEnrolled(course) ? 'btn-outline-secondary' : 'btn-primary'"
                  :disabled="enrollingId === course._id || isEnrolled(course)"
                  @click="handleSignup(course)"
                >
                  <span v-if="enrollingId === course._id">
                    Signing up...
                  </span>
                  <span v-else-if="isEnrolled(course)">
                    Enrolled
                  </span>
                  <span v-else>
                    Sign Up
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'CourseSignupPage',
  data() {
    return {
      courses: [],
      enrolledCourseIds: [],
      loading: false,
      enrollingId: null,
      error: null
    }
  },
  computed: {
    isStudent() {
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'student'
    }
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        this.error = null

        // 1) Fetch all courses (large limit so we see everything)
        const coursesRes = await CourseService.getAll({ limit: 1000 })
        const coursesData = coursesRes.data.data || coursesRes.data || []
        this.courses = coursesData

        // 2) Fetch current student's enrollments
        const enrollmentsRes = await CourseService.getStudentEnrollments()
        const enrollmentsData = enrollmentsRes.data.data || enrollmentsRes.data || []

        // Normalize to list of course IDs
        this.enrolledCourseIds = enrollmentsData
          .map(att => {
            if (att.course && att.course._id) return att.course._id
            return att.course || null
          })
          .filter(Boolean)
      } catch (err) {
        console.error(err)
        this.error = 'Failed to load courses or enrollments.'
      } finally {
        this.loading = false
      }
    },

    isEnrolled(course) {
      return this.enrolledCourseIds.includes(course._id)
    },

    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    },

    async handleSignup(course) {
      if (this.isEnrolled(course)) return

      const userJson = localStorage.getItem('user')
      if (!userJson) {
        this.error = 'You must be logged in to sign up.'
        return
      }
      const user = JSON.parse(userJson)
      if (!user._id) {
        this.error = 'Invalid user data.'
        return
      }

      this.enrollingId = course._id
      this.error = null

      try {
        await CourseService.addStudent(course._id, user._id)
        // Update local state so UI reflects enrollment
        if (!this.enrolledCourseIds.includes(course._id)) {
          this.enrolledCourseIds.push(course._id)
        }
      } catch (err) {
        console.error(err)
        this.error = 'Failed to sign up for this course.'
      } finally {
        this.enrollingId = null
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
}
</style>

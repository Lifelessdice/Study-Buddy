<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>All Courses</h2>
      <router-link to="/courses" class="btn btn-outline-secondary">
        Back to My Courses
      </router-link>
    </div>

    <div v-if="loading">Loading courses...</div>

    <div v-if="!loading && courses.length === 0" class="alert alert-info">
      No courses yet.
    </div>

    <div class="row">
      <div v-for="course in courses" :key="course._id" class="col-md-6 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              {{ course.name }} <small class="text-muted">({{ course.code }})</small>
            </h5>
            <p class="card-text" v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
            <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
            <p class="card-text"><small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'AllCoursesPage',
  data() {
    return {
      courses: [],
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchCourses() {
      try {
        this.loading = true
        const res = await CourseService.getAll()
        this.courses = res.data.data || res.data
      } catch (err) {
        this.error = err
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

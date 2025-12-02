<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Courses</h2>
      <div>
        <router-link v-if="isTeacher" to="/courses/create" class="btn btn-primary">
          + Create Course
        </router-link>
        <router-link to="/courses/all" class="btn btn-outline-secondary ms-2">
          See All Courses
        </router-link>
      </div>
    </div>

    <div v-if="loading">Loading courses...</div>

    <div v-if="!loading && courses.length === 0" class="alert alert-info">
      No courses yet.
    </div>

    <div class="row">
      <div v-for="course in courses" :key="course._id" class="col-md-6 mb-3">
        <router-link :to="`/courses/${course._id}`" class="course-card-link">
          <div class="card h-100 course-card">
            <div class="card-body">
              <h5 class="card-title">{{ course.name }} <small class="text-muted">({{ course.code }})</small></h5>
              <p class="card-text" v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
              <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
              <p class="card-text"><small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small></p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'CoursesPage',
  data() {
    return {
      courses: [],
      loading: false,
      error: null
    }
  },
  computed: {
    isTeacher() {
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'teacher'
    }
  },
  methods: {
    async fetchCourses() {
      try {
        this.loading = true
        let res
        if (this.isTeacher) {
          try {
            res = await CourseService.getMine()
          } catch (err) {
            // If teacher fetch fails (e.g., not assigned yet), fall back to all
            res = await CourseService.getAll()
          }
        } else {
          res = await CourseService.getAll()
        }
        this.courses = res.data.data || res.data // sometimes API uses data.data or data
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

<style scoped>
.course-card-link {
  text-decoration: none;
  color: inherit;
}

.course-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}
</style>

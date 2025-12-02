<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Courses</h2>
      <div>
        <router-link v-if="isTeacher" to="/courses/create" class="btn btn-primary">
          + Create Course
        </router-link>
      </div>
    </div>

    <div v-if="loading">Loading courses...</div>

    <div v-if="!loading && courses.length === 0" class="alert alert-info">
      No courses yet.
    </div>

    <div class="row">
      <div v-for="course in courses" :key="course._id" class="col-md-6 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ course.name }} <small class="text-muted">({{ course.code }})</small></h5>
            <p class="card-text" v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
            <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
            <p class="card-text"><small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small></p>
          </div>

          <div class="card-footer d-flex justify-content-between">
            <div>
              <router-link :to="`/courses/${course._id}/edit`" v-if="isTeacher" class="btn btn-sm btn-outline-secondary me-2">
                Edit
              </router-link>
              <button v-if="isTeacher" class="btn btn-sm btn-outline-danger" @click="removeCourse(course._id)">
                Delete
              </button>
            </div>

            <div>
              <button class="btn btn-sm btn-outline-primary" @click="viewAssignments(course._id)">
                View Assignments
              </button>
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
        const res = this.isTeacher
          ? await CourseService.getMine()
          : await CourseService.getAll()
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
    },

    async removeCourse(id) {
      if (!confirm('Delete this course?')) return
      try {
        await CourseService.remove(id)
        this.courses = this.courses.filter(c => c._id !== id)
      } catch (err) {
        alert('Failed to delete course')
      }
    },

    viewAssignments(courseId) {
      // simple action: show assignments in an alert for now
      CourseService.getAssignments(courseId)
        .then(res => {
          const assigns = res.data.data || res.data
          const text = assigns.length ? assigns.map(a => `${a.teacher.name || a.teacher.email}`).join('\n') : 'No assignments'
          alert(text)
        })
        .catch(err => {
          alert('Failed to load assignments')
        })
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

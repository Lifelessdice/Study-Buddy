<template>
  <div class="container mt-4" v-if="course">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-0">{{ course.name }}</h2>
        <small class="text-muted">Code: {{ course.code }}</small>
      </div>
      <div>
        <router-link to="/courses" class="btn btn-outline-secondary me-2">Back to My Courses</router-link>
        <router-link to="/courses/all" class="btn btn-outline-secondary">All Courses</router-link>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <p v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
        <p v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
        <p class="text-muted mb-0">
          Created: {{ formatDate(course.createdAt) }}
        </p>
      </div>
    </div>

    <div class="d-flex gap-2 mb-3" v-if="isTeacher">
      <router-link :to="`/courses/${course._id}/edit`" class="btn btn-primary">
        Edit Course
      </router-link>
      <button class="btn btn-danger" @click="removeCourse">Delete Course</button>
      <button class="btn btn-outline-primary" @click="viewAssignments">View Assignments</button>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'CourseDashboard',
  props: ['id'],
  data() {
    return {
      course: null,
      isTeacher: false
    }
  },
  methods: {
    async fetchCourse() {
      const res = await CourseService.getById(this.$route.params.id)
      this.course = res.data.data || res.data
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    },
    async removeCourse() {
      if (!confirm('Delete this course?')) return
      try {
        await CourseService.remove(this.course._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        alert('Failed to delete course')
      }
    },
    viewAssignments() {
      CourseService.getAssignments(this.course._id)
        .then(res => {
          const assigns = res.data.data || res.data
          const text = assigns.length
            ? assigns.map(a => `${a.teacher?.name || a.teacher?.email || 'Unknown'}`).join('\n')
            : 'No assignments'
          alert(text)
        })
        .catch(err => {
          console.error(err)
          alert('Failed to load assignments')
        })
    },
    resolveRole() {
      const u = localStorage.getItem('user')
      if (!u) return
      const user = JSON.parse(u)
      this.isTeacher = user.role === 'teacher'
    }
  },
  async mounted() {
    this.resolveRole()
    await this.fetchCourse()
  }
}
</script>

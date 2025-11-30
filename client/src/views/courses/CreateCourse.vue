<template>
  <div class="container mt-4" style="max-width:720px">
    <h3>Create Course</h3>

    <div class="card p-3">
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Code *</label>
          <input v-model="form.code" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Material</label>
          <input v-model="form.material" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Degree</label>
          <input v-model="form.degree" type="text" class="form-control" />
        </div>

        <button class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Creating…' : 'Create Course' }}
        </button>

        <router-link to="/courses" class="btn btn-link ms-2">Cancel</router-link>
      </form>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'CreateCourse',
  data() {
    return {
      form: {
        name: '',
        code: '',
        material: '',
        degree: ''
      },
      submitting: false
    }
  },
  methods: {
    async submit() {
      try {
        this.submitting = true
        const createRes = await CourseService.create(this.form)
        const created = createRes.data.data || createRes.data

        // Auto-assign current logged-in teacher
        const userJson = localStorage.getItem('user')
        const user = userJson ? JSON.parse(userJson) : null
        if (user && user._id) {
          try {
            await CourseService.assignTeacher(created._id || created._id)
          } catch (errAssign) {
            // if assignment fails, show a non-fatal warning
            console.warn('Assignment failed', errAssign)
            // Optionally show user message
          }
        }

        // Redirect to courses list
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create course'
        alert(msg)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

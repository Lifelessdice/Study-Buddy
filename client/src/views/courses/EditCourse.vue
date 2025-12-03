<template>
  <div class="container mt-4" style="max-width:720px">
    <h3>Edit Course</h3>

    <div class="card p-3" v-if="loaded">
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

        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" :disabled="submitting" type="submit">
            {{ submitting ? 'Saving…' : submitLabel }}
          </button>
          <router-link to="/courses" class="btn btn-link ms-2">Cancel</router-link>
        </div>

      </form>
    </div>

    <div v-else class="p-3">Loading...</div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'EditCourse',
  props: ['id'],
  data() {
    return {
      form: {
        name: '',
        code: '',
        material: '',
        degree: ''
      },
      loaded: false,
      submitting: false
    }
  },
  async mounted() {
    try {
      const courseId = this.$route.params.id
      const res = await CourseService.getById(courseId)
      const c = res.data.data || res.data
      this.form.name = c.name
      this.form.code = c.code
      this.form.material = c.material || ''
      this.form.degree = c.degree || ''
      this.loaded = true
    } catch (err) {
      alert('Failed to load course')
      this.$router.push({ name: 'Courses' })
    }
  },
  methods: {
    async submit() {
      try {
        this.submitting = true
        const courseId = this.$route.params.id
        if (this.isOverwrite) {
          await CourseService.replace(courseId, this.form)
        } else {
          await CourseService.update(courseId, this.form)
        }
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        alert('Failed to save changes')
      } finally {
        this.submitting = false
      }
    }
  },
  computed: {
    isOverwrite() {
      return this.$route.query.mode === 'overwrite'
    },
    submitLabel() {
      return this.isOverwrite ? 'Save Changes' : 'Save Changes'
    }
  }
}
</script>

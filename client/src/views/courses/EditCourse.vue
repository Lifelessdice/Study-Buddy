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
          <label class="form-label">Overview</label>
          <input v-model="form.overview" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Degree</label>
          <input v-model="form.degree" type="text" class="form-control" />
        </div>

        <div class="d-flex gap-2">
          <BaseButton
            variant="primary"
            outline
            type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            {{ submitting ? 'Saving...' : submitLabel }}
          </BaseButton>
          <BaseButton to="/courses" variant="link" class="ms-2">Cancel</BaseButton>
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
  props: ['courseSlug'],
  data() {
    return {
      form: {
        name: '',
        code: '',
        overview: '',
        degree: ''
      },
      courseId: '',
      loaded: false,
      submitting: false
    }
  },
  async mounted() {
    try {
      const courseSlug = this.$route.params.courseSlug
      const res = await CourseService.getById(courseSlug)
      const c = res.data.data || res.data
      this.courseId = c._id
      this.form.name = c.name
      this.form.code = c.code
      this.form.overview = c.overview || ''
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
        if (this.isOverwrite) {
          await CourseService.replace(this.courseId, this.form)
        } else {
          await CourseService.update(this.courseId, this.form)
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

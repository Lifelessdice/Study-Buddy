<template>
  <div class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Delete All Courses</h5>
      <p class="mb-3">This will remove all courses. This cannot be undone.</p>
      <div class="d-flex gap-2 justify-content-end">
        <BaseButton variant="primary" outline @click="goBack">Cancel</BaseButton>
        <BaseButton variant="danger" :loading="deleting" :disabled="deleting" @click="deleteAll">
          {{ deleting ? 'Deleting...' : 'Yes, delete all' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'
import { notifyError } from '@/utils/notify'

export default {
  name: 'DeleteAllCourses',
  data() {
    return {
      deleting: false
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Courses' })
    },
    async deleteAll() {
      this.deleting = true
      try {
        await CourseService.removeAll()
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        notifyError('Failed to delete all courses')
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
</style>

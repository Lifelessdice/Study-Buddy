<template>
  <div class="container mt-4" style="max-width: 640px">
    <h3>Delete All Courses</h3>
    <div class="card p-3">
      <p class="text-danger fw-bold">This will delete all courses. This action cannot be undone.</p>
      <div class="d-flex gap-2">
        <BaseButton variant="danger" @click="showConfirm = true">Delete All Courses</BaseButton>
        <BaseButton to="/courses" variant="secondary" outline>Cancel</BaseButton>
      </div>
    </div>

    <div v-if="showConfirm" class="overlay">
      <div class="overlay-card overlay-card--danger">
        <h5 class="text-danger">Are you sure?</h5>
        <p class="mb-3">This will remove all courses. This cannot be undone.</p>
        <div class="d-flex gap-2 justify-content-end">
          <BaseButton variant="secondary" outline @click="showConfirm = false">No</BaseButton>
          <BaseButton variant="danger" :loading="deleting" :disabled="deleting" @click="deleteAll">
            {{ deleting ? 'Deleting...' : 'Yes, delete all' }}
          </BaseButton>
        </div>
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
      deleting: false,
      showConfirm: false
    }
  },
  methods: {
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

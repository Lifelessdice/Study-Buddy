<template>
  <div class="overlay" @click.self="$emit('cancel')">
    <div class="overlay-card">
      <h4>Delete Course</h4>
      <p>This action cannot be undone.</p>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button class="btn btn-danger" @click="$emit('confirm')">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteCourseModal'
}
</script>

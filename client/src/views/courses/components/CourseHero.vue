<template>
  <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-wrap gap-2">
      <div>
        <h2 class="mb-1">{{ course.name }}</h2>
        <div class="text-muted">{{ course.code }}</div>
      </div>

      <div class="d-flex gap-2">
        <button
          v-if="isTeacher"
          class="btn btn-danger btn-hover"
          @click="$emit('delete-course')"
        >
          Delete
        </button>

        <button
          v-if="!isTeacher && myAttendance"
          class="btn btn-outline-danger btn-hover"
          @click="$emit('leave-course')"
        >
          Leave
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseHero',
  props: {
    course: Object,
    isTeacher: Boolean,
    myAttendance: Object
  }
}
</script>

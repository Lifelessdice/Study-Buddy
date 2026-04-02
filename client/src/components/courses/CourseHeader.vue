<template>
  <div class="hero card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <p class="text-uppercase small text-muted mb-1">Course</p>
          <h2 class="mb-1">{{ course.name }}</h2>
          <div class="text-muted fw-bold">{{ course.code }}</div>
        </div>
        <div class="d-flex gap-2 flex-wrap justify-content-end">
          <BaseButton
            to="/courses"
            variant="secondary"
            outline
            size="sm"
          >
            <span class="btn-text btn-text-long">Back</span>
            <span class="btn-text btn-text-short">Back</span>
            <span class="btn-icon">&lt;</span>
          </BaseButton>

          <template v-if="isTeacher">
            <BaseButton
              :to="`/courses/${courseSlug}/edit`"
              variant="primary"
              outline
              size="sm"
            >
              <span class="btn-text btn-text-long">Edit</span>
              <span class="btn-text btn-text-short">Edit</span>
              <span class="btn-icon">E</span>
            </BaseButton>

            <BaseButton
              :to="{ path: `/courses/${courseSlug}/edit`, query: { mode: 'overwrite' } }"
              variant="primary"
              outline
              size="sm"
            >
              <span class="btn-text btn-text-long">Overwrite</span>
              <span class="btn-text btn-text-short">Overwrite</span>
              <span class="btn-icon">O</span>
            </BaseButton>

            <BaseButton
              variant="danger"
              outline
              size="sm"
              @click="$emit('request-delete-course')"
            >
              <span class="btn-text btn-text-long">Delete</span>
              <span class="btn-text btn-text-short">Delete</span>
              <span class="btn-icon">Del</span>
            </BaseButton>
          </template>

          <template v-else>
            <BaseButton
              v-if="myAttendance"
              variant="danger"
              outline
              size="sm"
              @click="$emit('request-leave-course')"
            >
              <span class="btn-text btn-text-long">Leave Course</span>
              <span class="btn-text btn-text-short">Leave</span>
              <span class="btn-icon">Lv</span>
            </BaseButton>
          </template>
        </div>
      </div>
      <hr>
      <div class="row gy-2 small text-muted">
        <div class="col-md-6">
          <strong>Degree:</strong> {{ course.degree || '-' }}
        </div>
        <div class="col-md-6 text-md-end">
          <strong>Teacher:</strong> {{ courseTeacher || '-' }}
        </div>
        <div class="col-md-6">
          <strong>Created:</strong> {{ createdAtLabel }}
        </div>
        <div class="col-md-6 text-md-end">
          <strong>Last Updated:</strong> {{ updatedAtLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseHeader',
  props: {
    course: { type: Object, required: true },
    isTeacher: { type: Boolean, default: false },
    myAttendance: { type: Object, default: null },
    courseSlug: { type: String, default: '' },
    courseTeacher: { type: String, default: '' },
    createdAtLabel: { type: String, default: '' },
    updatedAtLabel: { type: String, default: '' }
  },
  emits: ['request-delete-course', 'request-leave-course']
}
</script>

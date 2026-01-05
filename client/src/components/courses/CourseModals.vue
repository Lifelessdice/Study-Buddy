<template>
  <div v-if="showDeleteMaterialConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Delete Material</h5>
      <p class="mb-3">Are you sure you want to delete "{{ materialTitle }}"</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-delete-material')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-delete-material')">Delete</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showDeleteNoteConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Delete Lecture</h5>
      <p class="mb-3">Are you sure you want to delete "{{ noteTitle }}"</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-delete-note')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-delete-note')">Delete</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showMessageModal" class="overlay">
    <div class="overlay-card">
      <h5 class="mb-2">{{ messageTitle || 'Notice' }}</h5>
      <p class="mb-3">{{ messageBody }}</p>
      <div class="d-flex justify-content-end">
        <BaseButton variant="primary" @click="$emit('close-message')">OK</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showDeleteCourseConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Delete Course</h5>
      <p class="mb-3">This will permanently delete "{{ courseName }}". Continue.</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-delete-course')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-delete-course')">Delete</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showRemoveStudentConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Remove Student</h5>
      <p class="mb-3">Remove this student from the course.</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-remove-student')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-remove-student')">Remove</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showDeleteQuizConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Delete Quiz</h5>
      <p class="mb-3">Are you sure you want to delete "{{ quizTitle }}"</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-delete-quiz')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-delete-quiz')">Delete</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showLeaveConfirm" class="overlay">
    <div class="overlay-card overlay-card--danger">
      <h5 class="text-danger">Leave Course</h5>
      <p class="mb-3">Leave this course?</p>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton variant="primary" outline @click="$emit('cancel-leave')">Cancel</BaseButton>
        <BaseButton variant="danger" @click="$emit('confirm-leave')">Leave</BaseButton>
      </div>
    </div>
  </div>

  <div v-if="showAttemptsModal" class="overlay">
    <div class="overlay-card wide">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">Quiz Attempts - {{ attemptsQuizTitle }}</h5>
        <BaseButton variant="secondary" outline size="sm" @click="$emit('close-attempts')">Close</BaseButton>
      </div>
      <div v-if="attemptsLoading" class="text-muted">Loading attempts...</div>
      <div v-else-if="!attempts.length" class="alert alert-info mb-0">No attempts yet.</div>
      <div v-else>
        <div class="d-flex flex-wrap gap-4 mb-3 small">
          <div>
            <div class="text-uppercase text-muted">Attempts</div>
            <strong>{{ attempts.length }}</strong>
          </div>
          <div v-if="hasAttemptScores">
            <div class="text-uppercase text-muted">Average</div>
            <strong>{{ attemptsAverageScore }}%</strong>
          </div>
          <div v-if="hasAttemptScores">
            <div class="text-uppercase text-muted">Best</div>
            <strong>{{ attemptsMaxScore }}%</strong>
          </div>
          <div v-if="hasAttemptScores">
            <div class="text-uppercase text-muted">Lowest</div>
            <strong>{{ attemptsMinScore }}%</strong>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-sm align-middle table-responsive-stack">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(att, idx) in attempts" :key="att._id">
                <td data-label="#">{{ idx + 1 }}</td>
                <td data-label="Student">{{ att.student?.name || 'Unknown' }}</td>
                <td data-label="Score">{{ att.score ?? 'N/A' }}%</td>
                <td data-label="Date">{{ formatDate(att.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModals',
  props: {
    showDeleteMaterialConfirm: { type: Boolean, default: false },
    showDeleteNoteConfirm: { type: Boolean, default: false },
    showMessageModal: { type: Boolean, default: false },
    showDeleteCourseConfirm: { type: Boolean, default: false },
    showRemoveStudentConfirm: { type: Boolean, default: false },
    showDeleteQuizConfirm: { type: Boolean, default: false },
    showLeaveConfirm: { type: Boolean, default: false },
    showAttemptsModal: { type: Boolean, default: false },
    materialTitle: { type: String, default: '' },
    noteTitle: { type: String, default: '' },
    quizTitle: { type: String, default: '' },
    courseName: { type: String, default: '' },
    messageTitle: { type: String, default: '' },
    messageBody: { type: String, default: '' },
    attempts: { type: Array, default: () => [] },
    attemptsQuizTitle: { type: String, default: '' },
    attemptsLoading: { type: Boolean, default: false },
    hasAttemptScores: { type: Boolean, default: false },
    attemptsAverageScore: { type: Number, default: 0 },
    attemptsMinScore: { type: Number, default: 0 },
    attemptsMaxScore: { type: Number, default: 0 },
    formatDate: { type: Function, required: true }
  },
  emits: [
    'cancel-delete-material',
    'confirm-delete-material',
    'cancel-delete-note',
    'confirm-delete-note',
    'close-message',
    'cancel-delete-course',
    'confirm-delete-course',
    'cancel-remove-student',
    'confirm-remove-student',
    'cancel-delete-quiz',
    'confirm-delete-quiz',
    'cancel-leave',
    'confirm-leave',
    'close-attempts'
  ]
}
</script>

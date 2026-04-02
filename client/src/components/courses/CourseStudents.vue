<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2 position-relative add-student-header">
        <h5 class="card-title mb-0">Enrolled Students</h5>
        <div v-if="isTeacher" class="add-student-actions d-flex align-items-center justify-content-end gap-2">
          <BaseButton
            variant="primary"
            outline
            size="sm"
            class="px-3"
            @click="$emit('open-add-overlay')"
          >
            + Add Student
          </BaseButton>
        </div>
      </div>

      <div class="mb-3">
        <input
          :value="studentSearch"
          type="text"
          class="form-control"
          placeholder="Search students..."
          @input="$emit('update:studentSearch', $event.target.value)"
        >
      </div>

      <div v-if="filteredEnrolled.length === 0" class="alert alert-info">No students are enrolled yet.</div>

      <div v-else class="table-responsive">
        <table class="table table-sm align-middle table-responsive-stack">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(att, idx) in filteredEnrolled" :key="att._id">
              <td data-label="#">{{ idx + 1 }}</td>
              <td data-label="Name">{{ att.student?.name || 'Unknown' }}</td>
              <td data-label="Email">{{ att.student?.email }}</td>
              <td class="text-end" data-label="Actions">
                <BaseButton
                  v-if="isTeacher"
                  variant="danger"
                  outline
                  size="sm"
                  @click="$emit('remove-student', att._id)"
                >
                  Remove
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-muted small">Total enrolled: {{ filteredEnrolled.length }} students</div>
      </div>
    </div>

    <div v-if="showAddOverlay" class="overlay">
      <div class="overlay-card wide">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="mb-1">Add student to course</h5>
            <div class="small text-muted">Search by name or email and enroll instantly.</div>
          </div>
          <BaseButton variant="secondary" outline size="sm" @click="$emit('close-add-overlay')">Close</BaseButton>
        </div>

        <div class="d-flex flex-column gap-2">
          <div class="d-flex gap-2 flex-wrap">
            <input
              ref="addOverlayInput"
              :value="addStudentSearch"
              type="text"
              class="form-control flex-grow-1"
              placeholder="Search by name or email"
              aria-label="Search students"
              @input="handleSearchInput"
              @keyup.enter="$emit('search-students')"
            />
          </div>

          <div v-if="studentsLoading" class="small text-muted">Loading students...</div>
          <div v-else-if="searchResults.length" class="list-group suggestion-list">
            <div
              v-for="stu in searchResults"
              :key="stu._id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div class="fw-semibold">{{ stu.name || 'Unnamed' }}</div>
                <div class="small text-muted">{{ stu.email }}</div>
              </div>
              <BaseButton
                variant="success"
                size="sm"
                :loading="addingStudentId === stu._id"
                :disabled="addingStudentId === stu._id || isAlreadyEnrolled(stu._id)"
                @click="$emit('add-student', stu)"
              >
                {{ isAlreadyEnrolled(stu._id) ? 'Enrolled' : 'Add' }}
              </BaseButton>
            </div>
          </div>
          <div v-else class="small text-muted">
            <span v-if="addStudentSearch.trim().length === 0">Start typing to search students.</span>
            <span v-else>No matching students found.</span>
          </div>

          <div v-if="addStudentError" class="alert alert-warning py-2 mb-0">
            {{ addStudentError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseStudents',
  props: {
    isTeacher: { type: Boolean, default: false },
    filteredEnrolled: { type: Array, default: () => [] },
    studentSearch: { type: String, default: '' },
    showAddOverlay: { type: Boolean, default: false },
    addStudentSearch: { type: String, default: '' },
    searchResults: { type: Array, default: () => [] },
    studentsLoading: { type: Boolean, default: false },
    addingStudentId: { type: String, default: '' },
    addStudentError: { type: String, default: '' },
    isAlreadyEnrolled: { type: Function, required: true },
    onSearchInput: { type: Function, required: true }
  },
  emits: [
    'open-add-overlay',
    'close-add-overlay',
    'search-students',
    'add-student',
    'remove-student',
    'update:studentSearch',
    'update:addStudentSearch'
  ],
  watch: {
    showAddOverlay(val) {
      if (!val) return
      this.$nextTick(() => {
        const input = this.$refs.addOverlayInput
        if (input) input.focus()
      })
    }
  },
  methods: {
    handleSearchInput(event) {
      this.$emit('update:addStudentSearch', event.target.value)
      this.onSearchInput()
    }
  }
}
</script>

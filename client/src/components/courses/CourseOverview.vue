<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p class="text-uppercase small text-muted mb-1">Overview</p>
          <h5 class="mb-0">Course Overview</h5>
        </div>
        <BaseButton
          v-if="isTeacher"
          variant="primary"
          outline
          size="sm"
          @click="$emit('toggle-edit')"
        >
          <span class="btn-text btn-text-long">
            {{ overviewEditing ? 'Cancel Editing' : 'Edit Overview' }}
          </span>
          <span class="btn-text btn-text-short">
            {{ overviewEditing ? 'Cancel' : 'Edit' }}
          </span>
          <span class="btn-icon">
            {{ overviewEditing ? 'X' : 'E' }}
          </span>
        </BaseButton>
      </div>
      <div v-if="overviewEditing && isTeacher">
        <textarea
          class="form-control mb-2"
          rows="4"
          :value="overviewDraft"
          @input="$emit('update:overviewDraft', $event.target.value)"
        ></textarea>
        <div class="d-flex gap-2">
          <BaseButton
            variant="primary"
            size="sm"
            :disabled="savingOverview"
            @click="$emit('save')"
          >
            {{ savingOverview ? 'Saving...' : 'Save Overview' }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            outline
            size="sm"
            type="button"
            @click="$emit('cancel')"
          >
            Discard
          </BaseButton>
        </div>
      </div>
      <div v-else>
        <p class="text-muted mb-0">
          {{ overview || 'No overview provided yet.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseOverview',
  props: {
    isTeacher: { type: Boolean, default: false },
    overview: { type: String, default: '' },
    overviewDraft: { type: String, default: '' },
    overviewEditing: { type: Boolean, default: false },
    savingOverview: { type: Boolean, default: false }
  },
  emits: ['toggle-edit', 'save', 'cancel', 'update:overviewDraft']
}
</script>

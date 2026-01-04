<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Lectures</h5>
        <BaseButton
          v-if="isTeacher"
          variant="primary"
          outline
          size="sm"
          @click="$emit('toggle-create')"
        >
          {{ showCreateNote ? 'Cancel' : '+ Create Lecture' }}
        </BaseButton>
      </div>

      <div v-if="isTeacher && showCreateNote" class="mb-3">
        <input
          :value="newNoteTopic"
          type="text"
          class="form-control mb-2"
          placeholder="Topic"
          @input="$emit('update:newNoteTopic', $event.target.value)"
        />
        <textarea
          :value="newNoteContent"
          class="form-control mb-2"
          rows="4"
          placeholder="Content"
          @input="$emit('update:newNoteContent', $event.target.value)"
        ></textarea>
        <div class="d-flex gap-2">
          <BaseButton
            variant="primary"
            size="sm"
            :loading="savingNote"
            :disabled="savingNote"
            @click="$emit('create-note')"
          >
            {{ savingNote ? 'Saving...' : 'Save Lecture' }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            outline
            size="sm"
            type="button"
            @click="$emit('cancel-create')"
          >
            Discard
          </BaseButton>
        </div>
      </div>

      <div v-if="loadingNotes" class="text-muted">Loading lectures...</div>
      <div v-else>
        <div v-if="!filteredNotes.length" class="alert alert-info">
          No lectures available for this course.
        </div>

        <div class="list-group">
          <div v-for="note in filteredNotes" :key="note._id">
            <div v-if="editingNoteId === note._id" class="list-group-item">
              <input
                :value="editNoteTopic"
                type="text"
                class="form-control mb-2"
                placeholder="Topic"
                @input="$emit('update:editNoteTopic', $event.target.value)"
              />
              <textarea
                :value="editNoteContent"
                class="form-control mb-2"
                rows="4"
                placeholder="Content"
                @input="$emit('update:editNoteContent', $event.target.value)"
              ></textarea>
              <div class="d-flex gap-2">
                <BaseButton
                  variant="primary"
                  size="sm"
                  :loading="savingEditNote"
                  :disabled="savingEditNote"
                  @click="$emit('save-edit', note._id)"
                >
                  {{ savingEditNote ? 'Saving...' : 'Save' }}
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  outline
                  size="sm"
                  @click="$emit('cancel-edit')"
                >
                  Cancel
                </BaseButton>
              </div>
            </div>
            <div
              v-else
              class="list-group-item list-group-item-action text-start w-100"
              role="button"
              tabindex="0"
              @click="$emit('toggle-note', note)"
              @keydown.enter.prevent="$emit('toggle-note', note)"
              @keydown.space.prevent="$emit('toggle-note', note)"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{{ note.topic }}</strong>
                  <div class="small text-muted">Created: {{ formatDate(note.createdAt) }}</div>
                  <div class="small text-muted">Text</div>
                </div>
                <div v-if="isTeacher" class="d-flex gap-2 ms-3 flex-wrap">
                  <BaseButton
                    size="sm"
                    variant="secondary"
                    outline
                    @click.stop="$emit('edit-note', note)"
                  >
                    Edit
                  </BaseButton>
                  <BaseButton
                    size="sm"
                    variant="danger"
                    outline
                    @click.stop="$emit('prompt-delete', note)"
                  >
                    Delete
                  </BaseButton>
                </div>
              </div>

              <div v-if="expandedNoteId === note._id" class="mt-3 p-3 border rounded bg-light-subtle">
                <div class="lecture-text mb-3">
                  <p class="mb-0">{{ note.content }}</p>
                </div>

                <ul class="nav nav-tabs mb-3 responsive-tabs">
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: noteAi[note._id]?.activeTab === 'summary' }"
                      @click.stop.prevent="$emit('set-note-tab', note._id, 'summary')"
                    >
                      Summary
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: noteAi[note._id]?.activeTab === 'quiz' }"
                      @click.stop.prevent="$emit('set-note-tab', note._id, 'quiz')"
                    >
                      Quiz
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      :class="{ active: noteAi[note._id]?.activeTab === 'flashcards' }"
                      @click.stop.prevent="$emit('set-note-tab', note._id, 'flashcards')"
                    >
                      Flashcards
                    </a>
                  </li>
                </ul>

                <div v-if="noteAi[note._id]?.error" class="alert alert-warning mb-3">
                  {{ noteAi[note._id].error }}
                </div>

                <div v-show="noteAi[note._id]?.activeTab === 'summary'">
                  <AiSummaryPanel
                    :summary="noteAi[note._id]?.summary || ''"
                    :loading="noteAi[note._id]?.loadingSummary"
                    button-class="mb-2"
                    loading-class="text-center my-2"
                    @generate="$emit('generate-summary', note)"
                  />
                </div>

                <div v-show="noteAi[note._id]?.activeTab === 'quiz'">
                  <AiQuizPanel
                    :quiz="noteAi[note._id]?.quiz || []"
                    :loading="noteAi[note._id]?.loadingQuiz"
                    button-class="mb-2"
                    loading-class="text-center my-2"
                    @generate="$emit('generate-quiz', note)"
                    @select="$emit('select-option', $event)"
                  />
                </div>

                <div v-show="noteAi[note._id]?.activeTab === 'flashcards'">
                  <FlashcardsPanel
                    :flashcards="noteAi[note._id]?.flashcards || []"
                    :loading="noteAi[note._id]?.loadingFlashcards"
                    @generate="$emit('generate-flashcards', note)"
                    @toggle="$emit('toggle-flashcard', note, $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AiQuizPanel from '@/components/AiQuizPanel.vue'
import AiSummaryPanel from '@/components/AiSummaryPanel.vue'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'

export default {
  name: 'CourseNotes',
  components: { AiQuizPanel, AiSummaryPanel, FlashcardsPanel },
  props: {
    isTeacher: { type: Boolean, default: false },
    loadingNotes: { type: Boolean, default: false },
    filteredNotes: { type: Array, default: () => [] },
    showCreateNote: { type: Boolean, default: false },
    savingNote: { type: Boolean, default: false },
    newNoteTopic: { type: String, default: '' },
    newNoteContent: { type: String, default: '' },
    editingNoteId: { type: String, default: null },
    editNoteTopic: { type: String, default: '' },
    editNoteContent: { type: String, default: '' },
    savingEditNote: { type: Boolean, default: false },
    expandedNoteId: { type: String, default: null },
    noteAi: { type: Object, default: () => ({}) },
    formatDate: { type: Function, required: true }
  },
  emits: [
    'toggle-create',
    'create-note',
    'cancel-create',
    'save-edit',
    'cancel-edit',
    'edit-note',
    'prompt-delete',
    'toggle-note',
    'set-note-tab',
    'generate-summary',
    'generate-quiz',
    'generate-flashcards',
    'toggle-flashcard',
    'select-option',
    'update:newNoteTopic',
    'update:newNoteContent',
    'update:editNoteTopic',
    'update:editNoteContent'
  ]
}
</script>

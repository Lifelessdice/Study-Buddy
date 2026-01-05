<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Course Materials (PDF)</h5>
      </div>

      <div v-if="isTeacher" class="mb-3">
        <div v-if="uploadError" class="alert alert-danger mb-2">{{ uploadError }}</div>
        <div class="row g-2">
          <div class="col-md-6">
            <input
              :value="newMaterial.title"
              type="text"
              class="form-control"
              placeholder="Title"
              @input="updateMaterialField('title', $event.target.value)"
            />
          </div>
          <div class="col-md-6">
            <input
              :key="fileInputKey"
              type="file"
              class="form-control"
              accept="application/pdf"
              @change="$emit('file-change', $event)"
            />
          </div>
          <div class="col-12">
            <textarea
              :value="newMaterial.description"
              class="form-control"
              rows="2"
              placeholder="Description (optional)"
              @input="updateMaterialField('description', $event.target.value)"
            ></textarea>
          </div>
          <div class="col-12">
            <BaseButton
              variant="primary"
              size="sm"
              :loading="uploading"
              :disabled="uploading"
              @click="$emit('upload')"
            >
              {{ uploading ? 'Uploading...' : 'Upload PDF' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div v-if="loadingMaterials" class="text-muted">Loading materials...</div>
      <div v-else>
        <div v-if="!materials.length" class="alert alert-info">
          No PDF materials uploaded yet.
        </div>

        <div v-else class="list-group">
          <div v-for="mat in materials" :key="mat._id" class="list-group-item">
            <div
              class="d-flex justify-content-between align-items-start"
              role="button"
              tabindex="0"
              @click="$emit('toggle-material', mat)"
              @keydown.enter.prevent="$emit('toggle-material', mat)"
              @keydown.space.prevent="$emit('toggle-material', mat)"
            >
              <div>
                <div class="fw-semibold">{{ mat.title || mat.originalName }}</div>
                <div class="small text-muted">
                  PDF - {{ prettySize(mat.size) }}
                </div>
                <div class="small text-muted">Uploaded: {{ formatDate(mat.createdAt) }}</div>
                <div v-if="mat.description" class="small text-muted">{{ mat.description }}</div>
                <div class="small text-muted">
                  <a :href="materialUrl(mat.filePath)" target="_blank" rel="noopener">Open PDF</a>
                </div>
              </div>
              <div class="d-flex gap-2" @click.stop>
                <BaseButton
                  v-if="isTeacher"
                  size="sm"
                  variant="danger"
                  outline
                  @click="$emit('prompt-delete', mat)"
                >
                  Delete
                </BaseButton>
              </div>
            </div>

            <div v-if="expandedMaterialId === mat._id" class="mt-3 p-3 border rounded bg-light-subtle">
              <ul class="nav nav-tabs mb-3 responsive-tabs">
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: materialAi[mat._id]?.activeTab === 'summary' }"
                    @click.stop.prevent="$emit('set-material-tab', mat._id, 'summary')"
                  >
                    Summary
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: materialAi[mat._id]?.activeTab === 'quiz' }"
                    @click.stop.prevent="$emit('set-material-tab', mat._id, 'quiz')"
                  >
                    Quiz
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: materialAi[mat._id]?.activeTab === 'flashcards' }"
                    @click.stop.prevent="$emit('set-material-tab', mat._id, 'flashcards')"
                  >
                    Flashcards
                  </a>
                </li>
              </ul>

              <div v-if="materialAi[mat._id]?.error" class="alert alert-warning mb-3">
                {{ materialAi[mat._id].error }}
              </div>

              <div v-show="materialAi[mat._id]?.activeTab === 'summary'">
                <AiSummaryPanel
                  :summary="materialAi[mat._id]?.summary || ''"
                  :loading="materialAi[mat._id]?.loadingSummary"
                  button-class="mb-2"
                  loading-class="text-center my-2"
                  @generate="$emit('generate-summary', mat)"
                />
              </div>

              <div v-show="materialAi[mat._id]?.activeTab === 'quiz'">
                <AiQuizPanel
                  :quiz="materialAi[mat._id]?.quiz || []"
                  :loading="materialAi[mat._id]?.loadingQuiz"
                  button-class="mb-2"
                  loading-class="text-center my-2"
                  @generate="$emit('generate-quiz', mat)"
                  @select="$emit('select-option', $event)"
                />
              </div>

              <div v-show="materialAi[mat._id]?.activeTab === 'flashcards'">
                <FlashcardsPanel
                  :flashcards="materialAi[mat._id]?.flashcards || []"
                  :loading="materialAi[mat._id]?.loadingFlashcards"
                  @generate="$emit('generate-flashcards', mat)"
                  @toggle="$emit('toggle-flashcard', mat, $event)"
                />
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
  name: 'CourseMaterials',
  components: { AiQuizPanel, AiSummaryPanel, FlashcardsPanel },
  props: {
    isTeacher: { type: Boolean, default: false },
    materials: { type: Array, default: () => [] },
    loadingMaterials: { type: Boolean, default: false },
    uploadError: { type: String, default: null },
    newMaterial: { type: Object, default: () => ({ title: '', description: '', file: null }) },
    uploading: { type: Boolean, default: false },
    fileInputKey: { type: Number, default: 0 },
    expandedMaterialId: { type: String, default: null },
    materialAi: { type: Object, default: () => ({}) },
    prettySize: { type: Function, required: true },
    formatDate: { type: Function, required: true },
    materialUrl: { type: Function, required: true }
  },
  emits: [
    'file-change',
    'upload',
    'toggle-material',
    'set-material-tab',
    'generate-summary',
    'generate-quiz',
    'generate-flashcards',
    'toggle-flashcard',
    'select-option',
    'prompt-delete',
    'update:newMaterial'
  ],
  methods: {
    updateMaterialField(key, value) {
      this.$emit('update:newMaterial', { ...this.newMaterial, [key]: value })
    }
  }
}
</script>

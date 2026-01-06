<template>
  <div class="container mt-5">
    <h2 class="mb-4">Your Lectures</h2>

    <div class="list-group shadow-sm">
      <template v-for="item in lectures">
        <div
          v-if="item.type === 'pdf'"
          :key="item._id"
          class="list-group-item list-group-item-action text-start w-100"
          role="button"
          tabindex="0"
          @click="toggleMaterial(item)"
          @keydown.enter.prevent="toggleMaterial(item)"
          @keydown.space.prevent="toggleMaterial(item)"
        >
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ item.title }}</strong>
            <small class="text-muted">{{ formatDate(item.createdAt) }}</small>
          </div>
          <div class="small text-muted">PDF</div>
          <div v-if="item.description" class="small text-muted mt-1">{{ item.description }}</div>

          <div v-if="expandedMaterialId === item._id" class="mt-3 p-3 border rounded bg-light-subtle">
            <div class="d-flex flex-wrap gap-2 mb-3">
              <BaseButton
                size="sm"
                variant="primary"
                outline
                :href="item.filePath"
                target="_blank"
                rel="noopener"
                :download="item.downloadName"
                @click.stop
              >
                Open PDF
              </BaseButton>
            </div>

            <ul class="nav nav-tabs mb-3 responsive-tabs">
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: aiState[item._id]?.activeTab === 'summary' }"
                  @click.stop.prevent="setAiTab(item._id, 'summary')"
                >
                  Summary
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: aiState[item._id]?.activeTab === 'quiz' }"
                  @click.stop.prevent="setAiTab(item._id, 'quiz')"
                >
                  Quiz
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: aiState[item._id]?.activeTab === 'flashcards' }"
                  @click.stop.prevent="setAiTab(item._id, 'flashcards')"
                >
                  Flashcards
                </a>
              </li>
            </ul>

            <div v-if="aiState[item._id]?.error" class="alert alert-warning mb-3">
              {{ aiState[item._id].error }}
            </div>

            <div v-show="aiState[item._id]?.activeTab === 'summary'">
              <AiSummaryPanel
                :summary="aiState[item._id]?.summary || ''"
                :loading="aiState[item._id]?.loadingSummary"
                button-class="mb-2"
                loading-class="text-center my-2"
                @generate="generateMaterialSummary(item)"
              />
            </div>

            <div v-show="aiState[item._id]?.activeTab === 'quiz'">
              <AiQuizPanel
                :quiz="aiState[item._id]?.quiz || []"
                :loading="aiState[item._id]?.loadingQuiz"
                button-class="mb-2"
                loading-class="text-center my-2"
                @generate="generateMaterialQuiz(item)"
                @select="selectOption"
              />
            </div>

            <div v-show="aiState[item._id]?.activeTab === 'flashcards'">
              <FlashcardsPanel
                :flashcards="aiState[item._id]?.flashcards || []"
                :loading="aiState[item._id]?.loadingFlashcards"
                @generate="generateMaterialFlashcards(item)"
                @toggle="toggleMaterialFlashcard(item, $event)"
              />
            </div>
          </div>
        </div>

        <div
          v-else
          :key="item._id"
          class="list-group-item list-group-item-action text-start"
          role="button"
          tabindex="0"
          @click="goToLecture(item)"
          @keydown.enter.prevent="goToLecture(item)"
          @keydown.space.prevent="goToLecture(item)"
        >
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ item.title }}</strong>
            <small class="text-muted">{{ formatDate(item.createdAt) }}</small>
          </div>
          <div class="small text-muted">Text</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Api from '@/Api'
import { notifyError } from '@/utils/notify'
import CourseMaterialService from '@/services/CourseMaterialService'
import AiQuizPanel from '@/components/AiQuizPanel.vue'
import AiSummaryPanel from '@/components/AiSummaryPanel.vue'
import FlashcardsPanel from '@/components/FlashcardsPanel.vue'
import { handleAiFlashcards, handleAiQuiz, handleAiSummary } from '@/utils/aiHandlers'
import { toggleFlashcard } from '@/utils/aiFlashcards'
import { selectQuizOption } from '@/utils/aiQuiz'
import { createAiState } from '@/utils/aiState'
import { noteSlug } from '@/utils/slug'

export default {
  components: { AiQuizPanel, AiSummaryPanel, FlashcardsPanel },
  data() {
    return {
      notes: [],
      materials: [],
      user: null,
      studentAttendance: [], // stores the student's enrolled courses
      aiState: {},
      expandedMaterialId: null
    }
  },

  computed: {
    uploadBase() {
      const base = Api.defaults?.baseURL || ''
      return base.replace(/\/api\/v1$/, '') || base
    },
    enrolledCourseIds() {
      return this.studentAttendance.map(a => a.course?._id).filter(Boolean)
    },
    filteredNotes() {
      if (!this.user) return this.notes
      if (this.user.role === 'teacher') return this.notes
      return this.notes.filter(n => n.course && this.enrolledCourseIds.includes(n.course._id))
    },
    filteredMaterials() {
      if (!this.user) return this.materials
      if (this.user.role === 'teacher') return this.materials
      return this.materials.filter(m => {
        const cid = m.course && m.course._id ? m.course._id : m.course
        return cid && this.enrolledCourseIds.includes(cid)
      })
    },
    lectures() {
      const noteItems = (this.filteredNotes || []).map(n => ({
        _id: n._id,
        slug: noteSlug(n),
        title: n.topic,
        description: '',
        createdAt: n.createdAt,
        courseId: n.course?._id || n.course,
        type: 'note'
      }))
      const materialItems = (this.filteredMaterials || []).map(m => ({
        _id: m._id,
        title: m.title || m.originalName,
        description: m.description,
        createdAt: m.createdAt,
        type: 'pdf',
        courseId: m.course?._id || m.course,
        filePath: this.uploadBase + m.filePath,
        downloadName: m.originalName || `${m.title || 'material'}.pdf`
      }))
      return [...noteItems, ...materialItems].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
    }
  },

  async created() {
    try {
      this.user = JSON.parse(localStorage.getItem('user'))

      const notesRes = await Api.get('/notes')
      this.notes = notesRes.data.data

      if (this.user && this.user.role === 'student') {
        const attRes = await Api.get('/courses/attendances/mine')
        this.studentAttendance = attRes.data.data || []

        const courseIds = this.enrolledCourseIds
        const results = await Promise.allSettled(courseIds.map(id => CourseMaterialService.list(id)))
        const mats = []
        results.forEach(r => {
          if (r.status === 'fulfilled') {
            const data = r.value.data.data || r.value.data || []
            mats.push(...data)
          }
        })
        this.materials = mats
      }
    } catch (err) {
      console.error(err)
      notifyError('Failed to load lectures')
    }
  },

  methods: {
    ensureState(id) {
      if (this.aiState[id]) return this.aiState[id]
      const fresh = createAiState()
      this.aiState = { ...this.aiState, [id]: fresh }
      return fresh
    },
    selectOption(question, index) {
      selectQuizOption(question, index)
    },
    setAiTab(id, tab) {
      const state = this.ensureState(id)
      state.activeTab = tab
    },
    toggleMaterialFlashcard(item, index) {
      const state = this.ensureState(item._id)
      toggleFlashcard(state.flashcards, index)
    },
    toggleMaterial(item) {
      const isSame = this.expandedMaterialId === item._id
      this.expandedMaterialId = isSame ? null : item._id
      if (!isSame) {
        this.ensureState(item._id)
      }
    },
    goToLecture(item) {
      this.$router.push(`/notes/${item.slug}`)
    },
    formatDate(iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleString()
    },
    async generateMaterialSummary(item) {
      const state = this.ensureState(item._id)
      if (!item.courseId) {
        state.error = 'Missing course for this PDF.'
        return
      }
      await handleAiSummary({
        request: () => CourseMaterialService.summarize(item.courseId, item._id),
        setLoading: (value) => { state.loadingSummary = value },
        setSummary: (value) => { state.summary = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialQuiz(item) {
      const state = this.ensureState(item._id)
      if (!item.courseId) {
        state.error = 'Missing course for this PDF.'
        return
      }
      await handleAiQuiz({
        request: () => CourseMaterialService.quiz(item.courseId, item._id),
        setLoading: (value) => { state.loadingQuiz = value },
        setQuiz: (value) => { state.quiz = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialFlashcards(item) {
      const state = this.ensureState(item._id)
      if (!item.courseId) {
        state.error = 'Missing course for this PDF.'
        return
      }
      await handleAiFlashcards({
        request: () => CourseMaterialService.flashcards(item.courseId, item._id),
        setLoading: (value) => { state.loadingFlashcards = value },
        setFlashcards: (value) => { state.flashcards = value },
        setError: (value) => { state.error = value }
      })
    }
  }
}
</script>

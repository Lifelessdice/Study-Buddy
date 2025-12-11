<template>
  <div class="container mt-5">
    <h2 class="mb-4">Your Lectures</h2>

    <div class="list-group shadow-sm">
      <template v-for="item in lectures" :key="item._id">
        <div v-if="item.type === 'pdf'" class="list-group-item text-start">
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ item.title }}</strong>
            <small class="text-muted">{{ formatDate(item.createdAt) }}</small>
          </div>
          <div class="small text-muted">PDF</div>
          <div v-if="item.description" class="small text-muted mt-1">{{ item.description }}</div>

          <div class="d-flex flex-wrap gap-2 mt-3">
            <BaseButton
              size="sm"
              variant="primary"
              outline
              :href="item.filePath"
              target="_blank"
              rel="noopener"
              :download="item.downloadName"
            >
              Open PDF
            </BaseButton>
          </div>

          <div class="mt-3 p-3 border rounded bg-light-subtle">
            <!-- Summary -->
            <div class="mb-3">
              <div v-if="aiState[item._id]?.error" class="alert alert-warning mb-3">
                {{ aiState[item._id].error }}
              </div>
              <BaseButton
                class="mb-2"
                variant="primary"
                :loading="aiState[item._id]?.loadingSummary"
                @click="generateMaterialSummary(item)"
              >
                Generate Summary
              </BaseButton>
              <div v-if="aiState[item._id]?.loadingSummary" class="text-center my-2">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating summary, please wait...</p>
              </div>
              <div v-if="aiState[item._id]?.summary && !aiState[item._id]?.loadingSummary">{{ aiState[item._id].summary }}</div>
            </div>

            <!-- Quiz -->
            <div class="mb-3">
              <BaseButton
                class="mb-2"
                variant="success"
                :loading="aiState[item._id]?.loadingQuiz"
                @click="generateMaterialQuiz(item)"
              >
                Generate Quiz
              </BaseButton>
              <div v-if="aiState[item._id]?.loadingQuiz" class="text-center my-2">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating quiz, please wait...</p>
              </div>
              <ul v-if="aiState[item._id]?.quiz?.length && !aiState[item._id]?.loadingQuiz" class="list-group">
                <li v-for="(q, idx) in aiState[item._id].quiz" :key="idx" class="list-group-item">
                  <strong>Q{{ idx + 1 }}: {{ q.question }}</strong>
                  <ul class="list-group mt-2">
                    <li v-for="(opt, i) in q.options" :key="i" class="list-group-item">
                      {{ String.fromCharCode(65 + i) }}. {{ opt }}
                    </li>
                  </ul>
                  <small class="text-muted mt-2 d-block">Answer: {{ q.answer }}</small>
                </li>
              </ul>
            </div>

            <!-- Flashcards -->
            <div>
              <BaseButton
                class="mb-2"
                variant="warning"
                :loading="aiState[item._id]?.loadingFlashcards"
                @click="generateMaterialFlashcards(item)"
              >
                Generate Flashcards
              </BaseButton>
              <div v-if="aiState[item._id]?.loadingFlashcards" class="text-center my-2">
                <div class="spinner-border text-warning" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating flashcards, please wait...</p>
              </div>
              <div v-if="aiState[item._id]?.flashcards?.length && !aiState[item._id]?.loadingFlashcards" class="flashcards-container">
                <div
                  class="flashcard"
                  v-for="(fc, idx) in aiState[item._id].flashcards"
                  :key="idx"
                  :class="{ flipped: fc.flipped }"
                  @click="fc.flipped = !fc.flipped"
                >
                  <div class="front">
                    Q: {{ fc.question }}
                  </div>
                  <div class="back">
                    A: {{ fc.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          v-else
          class="list-group-item list-group-item-action text-start"
          @click="goToLecture(item)"
        >
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ item.title }}</strong>
            <small class="text-muted">{{ formatDate(item.createdAt) }}</small>
          </div>
          <div class="small text-muted">Text</div>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import api from '../Api'
import Api from '@/Api'
import CourseMaterialService from '@/services/CourseMaterialService'

export default {
  data() {
    return {
      notes: [],
      materials: [],
      user: null,
      studentAttendance: [], // stores the student's enrolled courses
      aiState: {}
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
      const token = localStorage.getItem('token')
      this.user = JSON.parse(localStorage.getItem('user'))

      const notesRes = await api.get('/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.notes = notesRes.data.data

      if (this.user && this.user.role === 'student') {
        const attRes = await api.get('/courses/attendances/mine', {
          headers: { Authorization: `Bearer ${token}` }
        })
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
      alert('Failed to load lectures')
    }
  },

  methods: {
    ensureState(id) {
      if (this.aiState[id]) return this.aiState[id]
      const fresh = {
        summary: '',
        quiz: [],
        flashcards: [],
        loadingSummary: false,
        loadingQuiz: false,
        loadingFlashcards: false,
        error: ''
      }
      this.aiState = { ...this.aiState, [id]: fresh }
      return fresh
    },
    goToLecture(item) {
      if (item.type === 'pdf' && item.filePath) {
        window.open(item.filePath, '_blank', 'noopener')
      } else {
        this.$router.push(`/notes/${item._id}`)
      }
    },
    formatDate(iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleString()
    },
    async generateMaterialSummary(item) {
      const state = this.ensureState(item._id)
      state.loadingSummary = true
      state.summary = ''
      state.error = ''
      try {
        if (!item.courseId) {
          state.error = 'Missing course for this PDF.'
          return
        }
        const res = await CourseMaterialService.summarize(item.courseId, item._id)
        state.summary = res.data.summary || res.data.data?.summary || 'No summary returned'
      } catch (err) {
        state.error = 'Failed to generate summary. Please try again.'
      } finally {
        state.loadingSummary = false
      }
    },
    async generateMaterialQuiz(item) {
      const state = this.ensureState(item._id)
      state.loadingQuiz = true
      state.quiz = []
      state.error = ''
      try {
        if (!item.courseId) {
          state.error = 'Missing course for this PDF.'
          return
        }
        const res = await CourseMaterialService.quiz(item.courseId, item._id)
        state.quiz = res.data.quiz || res.data.data?.quiz || []
        if (!state.quiz.length) state.error = 'No quiz questions were returned.'
      } catch (err) {
        state.error = 'Failed to generate quiz. Please try again.'
      } finally {
        state.loadingQuiz = false
      }
    },
    async generateMaterialFlashcards(item) {
      const state = this.ensureState(item._id)
      state.loadingFlashcards = true
      state.flashcards = []
      state.error = ''
      try {
        if (!item.courseId) {
          state.error = 'Missing course for this PDF.'
          return
        }
        const res = await CourseMaterialService.flashcards(item.courseId, item._id)
        const payload = res.data.flashcards || res.data.data?.flashcards || []
        state.flashcards = payload.map(fc => ({
          ...fc,
          flipped: false
        }))
        if (!state.flashcards.length) state.error = 'No flashcards were returned.'
      } catch (err) {
        state.error = 'Failed to generate flashcards. Please try again.'
      } finally {
        state.loadingFlashcards = false
      }
    }
  }
}
</script>

<style scoped>
.flashcards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.flashcard {
  width: 200px;
  height: 120px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
}

.flashcard .front,
.flashcard .back {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  backface-visibility: hidden;
  transition: transform 0.6s;
  position: absolute;
}

.flashcard .back {
  background: #f8f9fa;
  transform: rotateY(180deg);
}

.flashcard.flipped .front {
  transform: rotateY(180deg);
}

.flashcard.flipped .back {
  transform: rotateY(0deg);
}
</style>

<template>
  <div class="container mt-4" v-if="course">
    <CourseHeader
      :course="course"
      :is-teacher="isTeacher"
      :my-attendance="myAttendance"
      :course-slug="courseSlugValue"
      :course-teacher="courseTeacher"
      :created-at-label="formatDate(course.createdAt)"
      :updated-at-label="formatDate(course.updatedAt)"
      @request-delete-course="removeCourse"
      @request-leave-course="showLeaveConfirm = true"
    />

    <div class="nav-tabs-custom mb-3">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <span class="tab" :class="{ active: currentTab === 'overview' }" @click="setTab('overview')">Overview</span>
        <span class="tab" :class="{ active: currentTab === 'notes' }" @click="setTab('notes')">Lectures</span>
        <span class="tab" :class="{ active: currentTab === 'quizzes' }" @click="setTab('quizzes')">Quizzes</span>
        <span class="tab" :class="{ active: currentTab === 'students' }" @click="setTab('students')">Students</span>
      </div>
    </div>

    <div v-if="currentTab === 'overview'">
      <CourseOverview
        :is-teacher="isTeacher"
        :overview="course?.overview || ''"
        :overview-draft="overviewDraft"
        :overview-editing="overviewEditing"
        :saving-overview="savingOverview"
        @toggle-edit="toggleOverviewEdit"
        @save="saveOverview"
        @cancel="cancelOverviewEdit"
        @update:overviewDraft="overviewDraft = $event"
      />
    </div>

    <div v-if="currentTab === 'quizzes'">
      <CourseQuizzes
        :quizzes="quizzes"
        :loading="loadingQuizzes"
        :is-teacher="isTeacher"
        :course-slug="courseSlugValue"
        :my-participation-by-quiz="myParticipationByQuiz"
        :quiz-slug="quizSlug"
        :format-date="formatDate"
        @view-attempts="viewAttempts"
        @delete-quiz="promptDeleteQuiz"
      />
    </div>

    <div v-if="currentTab === 'students'" ref="studentsCard">
      <CourseStudents
        :is-teacher="isTeacher"
        :filtered-enrolled="filteredEnrolled"
        :student-search="studentSearch"
        :show-add-overlay="showAddOverlay"
        :add-student-search="addStudentSearch"
        :search-results="searchResults"
        :students-loading="studentsLoading"
        :adding-student-id="addingStudentId"
        :add-student-error="addStudentError"
        :is-already-enrolled="isAlreadyEnrolled"
        :on-search-input="onSearchInput"
        @open-add-overlay="openAddOverlay"
        @close-add-overlay="closeAddOverlay"
        @search-students="onSearchStudents"
        @add-student="addStudentFromResult"
        @remove-student="removeStudent"
        @update:studentSearch="studentSearch = $event"
        @update:addStudentSearch="addStudentSearch = $event"
      />
    </div>

    <div v-if="currentTab === 'notes'">
      <CourseNotes
        :is-teacher="isTeacher"
        :loading-notes="loadingNotes"
        :filtered-notes="filteredNotes"
        :show-create-note="showCreateNote"
        :saving-note="savingNote"
        :new-note-topic="newNoteTopic"
        :new-note-content="newNoteContent"
        :editing-note-id="editingNoteId"
        :edit-note-topic="editNoteTopic"
        :edit-note-content="editNoteContent"
        :saving-edit-note="savingEditNote"
        :expanded-note-id="expandedNoteId"
        :note-ai="noteAi"
        :format-date="formatDate"
        @toggle-create="showCreateNote = !showCreateNote"
        @create-note="createNote"
        @cancel-create="showCreateNote = false"
        @save-edit="saveEditedNote"
        @cancel-edit="cancelEditNote"
        @edit-note="editNote"
        @prompt-delete="promptDeleteNote"
        @toggle-note="toggleNote"
        @set-note-tab="setNoteTab"
        @generate-summary="generateNoteSummary"
        @generate-quiz="generateNoteQuiz"
        @generate-flashcards="generateNoteFlashcards"
        @toggle-flashcard="toggleNoteFlashcard"
        @select-option="selectOption"
        @update:newNoteTopic="newNoteTopic = $event"
        @update:newNoteContent="newNoteContent = $event"
        @update:editNoteTopic="editNoteTopic = $event"
        @update:editNoteContent="editNoteContent = $event"
      />

      <CourseMaterials
        :is-teacher="isTeacher"
        :materials="materials"
        :loading-materials="loadingMaterials"
        :upload-error="uploadError"
        :new-material="newMaterial"
        :uploading="uploading"
        :file-input-key="materialFileKey"
        :expanded-material-id="expandedMaterialId"
        :material-ai="materialAi"
        :pretty-size="prettySize"
        :format-date="formatDate"
        :material-url="materialUrl"
        @file-change="onFileChange"
        @upload="handleUpload"
        @toggle-material="toggleMaterial"
        @set-material-tab="setMaterialTab"
        @generate-summary="generateMaterialSummary"
        @generate-quiz="generateMaterialQuiz"
        @generate-flashcards="generateMaterialFlashcards"
        @toggle-flashcard="toggleMaterialFlashcard"
        @select-option="selectOption"
        @prompt-delete="promptDeleteMaterial"
        @update:newMaterial="newMaterial = $event"
      />
    </div>

    <CourseModals
      :show-delete-material-confirm="showDeleteMaterialConfirm"
      :show-delete-note-confirm="showDeleteNoteConfirm"
      :show-message-modal="showMessageModal"
      :show-delete-course-confirm="showDeleteCourseConfirm"
      :show-remove-student-confirm="showRemoveStudentConfirm"
      :show-delete-quiz-confirm="showDeleteConfirm"
      :show-leave-confirm="showLeaveConfirm"
      :show-attempts-modal="showAttemptsModal"
      :material-title="materialToDelete?.title || materialToDelete?.originalName || ''"
      :note-title="noteToDelete?.topic || ''"
      :quiz-title="quizToDelete?.title || ''"
      :course-name="course?.name || ''"
      :message-title="messageTitle"
      :message-body="messageBody"
      :attempts="attempts"
      :attempts-quiz-title="attemptsQuizTitle"
      :attempts-loading="attemptsLoading"
      :has-attempt-scores="hasAttemptScores"
      :attempts-average-score="attemptsAverageScore"
      :attempts-min-score="attemptsMinScore"
      :attempts-max-score="attemptsMaxScore"
      :format-date="formatDate"
      @cancel-delete-material="cancelDeleteMaterial"
      @confirm-delete-material="deleteMaterialConfirmed"
      @cancel-delete-note="cancelDeleteNote"
      @confirm-delete-note="deleteNoteConfirmed"
      @close-message="showMessageModal = false"
      @cancel-delete-course="cancelDeleteCourse"
      @confirm-delete-course="confirmDeleteCourse"
      @cancel-remove-student="cancelRemoveStudent"
      @confirm-remove-student="confirmRemoveStudent"
      @cancel-delete-quiz="cancelDeleteQuiz"
      @confirm-delete-quiz="deleteQuizConfirmed"
      @cancel-leave="showLeaveConfirm = false"
      @confirm-leave="leaveCourse"
      @close-attempts="closeAttempts"
    />
  </div>

</template>

<script>
import CourseService from '@/services/CourseService'
import Api from '@/Api'
import QuizService from '@/services/QuizService'
import QuizParticipationService from '@/services/QuizParticipationService'
import CourseMaterialService from '@/services/CourseMaterialService'
import BaseButton from '@/components/BaseButton.vue'
import CourseHeader from '@/components/courses/CourseHeader.vue'
import CourseOverview from '@/components/courses/CourseOverview.vue'
import CourseQuizzes from '@/components/courses/CourseQuizzes.vue'
import CourseStudents from '@/components/courses/CourseStudents.vue'
import CourseNotes from '@/components/courses/CourseNotes.vue'
import CourseMaterials from '@/components/courses/CourseMaterials.vue'
import CourseModals from '@/components/courses/CourseModals.vue'
import { handleAiFlashcards, handleAiQuiz, handleAiSummary } from '@/utils/aiHandlers'
import { toggleFlashcard } from '@/utils/aiFlashcards'
import { selectQuizOption } from '@/utils/aiQuiz'
import { createAiState } from '@/utils/aiState'
import { courseSlug, quizSlug } from '@/utils/slug'

export default {
  name: 'CourseDashboard',
  components: {
    BaseButton,
    CourseHeader,
    CourseOverview,
    CourseQuizzes,
    CourseStudents,
    CourseNotes,
    CourseMaterials,
    CourseModals
  },
  props: ['courseSlug'],
  data() {
    return {
      course: null,
      addStudentSearch: '',
      searchResults: [],
      addingStudentId: '',
      studentsLoading: false,
      enrolled: [],
      showAddOverlay: false,
      searchDebounce: null,
      addStudentError: '',
      overviewDraft: '',
      overviewEditing: false,
      savingOverview: false,
      currentTab: 'overview',
      studentSearch: '',
      quizzes: [],
      loadingQuizzes: false,
      quizError: null,
      showDeleteConfirm: false,
      quizToDelete: null,
      showLeaveConfirm: false,
      showAttemptsModal: false,
      attemptsLoading: false,
      attempts: [],
      attemptsQuizTitle: '',
      myParticipations: {},
      showDeleteCourseConfirm: false,
      showRemoveStudentConfirm: false,
      studentToRemove: null,
      notes: [],
      loadingNotes: false,
      savingNote: false,
      showCreateNote: false,
      newNoteTopic: '',
      newNoteContent: '',
      newNoteCourse: '',
      editingNoteId: null,
      editNoteTopic: '',
      editNoteContent: '',
      savingEditNote: false,
      showDeleteNoteConfirm: false,
      noteToDelete: null,
      noteAi: {},
      expandedNoteId: null,
      // materials
      materials: [],
      loadingMaterials: false,
      materialAi: {},
      newMaterial: { title: '', description: '', file: null },
      materialFileKey: 0,
      uploading: false,
      uploadError: null,
      expandedMaterialId: null,
      showDeleteMaterialConfirm: false,
      materialToDelete: null,
      showMessageModal: false,
      messageTitle: '',
      messageBody: ''
    }
  },
  computed: {
    currentUser() {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    },
    courseTeacher() {
      const user = this.currentUser
      if (!user) return null
      return user.name || user.email || null
    },
    filteredEnrolled() {
      const term = this.studentSearch.trim().toLowerCase()
      if (!term) return this.enrolled
      return this.enrolled.filter(att => {
        const name = (att.student?.name || '').toLowerCase()
        const email = (att.student?.email || '').toLowerCase()
        return name.includes(term) || email.includes(term)
      })
    },
    isTeacher() {
      const user = this.currentUser
      return user?.role === 'teacher'
    },
    myAttendance() {
      if (!this.currentUser || !Array.isArray(this.enrolled)) return null
      return this.enrolled.find(att => att.student?._id === this.currentUser._id) || null
    },
    myParticipationByQuiz() {
      return this.myParticipations || {}
    },
    courseSlugValue() {
      if (!this.course) return ''
      return courseSlug(this.course)
    },
    filteredNotes() {
      if (!Array.isArray(this.notes) || !this.course?._id) return []
      return this.notes.filter(note => note.course?._id === this.course._id)
    },
    attemptsWithScore() {
      // normalize scores (numbers + numeric strings)
      return this.attempts
        .map(a => {
          const v = a.score
          if (v === undefined || v === null) return null
          const num = Number(v)
          return Number.isNaN(num) ? null : num
        })
        .filter(v => v !== null)
    },
    hasAttemptScores() {
      return this.attemptsWithScore.length > 0
    },
    attemptsAverageScore() {
      if (!this.hasAttemptScores) return null
      const sum = this.attemptsWithScore.reduce((acc, s) => acc + s, 0)
      return Math.round((sum / this.attemptsWithScore.length) * 10) / 10 // 1 decimal
    },
    attemptsMinScore() {
      if (!this.hasAttemptScores) return null
      return Math.min(...this.attemptsWithScore)
    },
    attemptsMaxScore() {
      if (!this.hasAttemptScores) return null
      return Math.max(...this.attemptsWithScore)
    },
    totalQuizQuestions() {
      if (!Array.isArray(this.quizzes)) return 0
      return this.quizzes.reduce((sum, q) => sum + ((q.questions && q.questions.length) || 0), 0)
    },
    hasQuizQuestions() {
      return this.totalQuizQuestions > 0
    },
    avgQuestionsPerQuiz() {
      if (!this.quizzes.length) return 0
      return Math.round((this.totalQuizQuestions / this.quizzes.length) * 10) / 10
    },
    myCompletedQuizzes() {
      if (!this.myParticipations || typeof this.myParticipations !== 'object') return 0
      return Object.keys(this.myParticipations).length
    },
    myScores() {
      const list = Object.values(this.myParticipations || {})
      return list
        .map(p => {
          const n = Number(p.score)
          return Number.isNaN(n) ? null : n
        })
        .filter(n => n !== null)
    },
    hasMyScores() {
      return this.myScores.length > 0
    },
    avgMyScore() {
      if (!this.hasMyScores) return 0
      const sum = this.myScores.reduce((a, b) => a + b, 0)
      return Math.round((sum / this.myScores.length) * 10) / 10
    },
    bestMyScore() {
      if (!this.hasMyScores) return 0
      return Math.max(...this.myScores)
    },
    completionRate() {
      if (!this.quizzes.length) return 0
      const pct = (this.myCompletedQuizzes / this.quizzes.length) * 100
      return Math.round(pct * 10) / 10
    }

  },
  watch: {
    '$route.query.tab'(val) {
      if (val && this.currentTab !== val) {
        this.setTab(val)
      }
    }
  },
  methods: {
    quizSlug(quiz) {
      return quizSlug(quiz)
    },
    async resolveCourseBySlug(slug) {
      if (!slug) return null
      const user = this.currentUser
      let courses = []

      if (user?.role === 'teacher') {
        try {
          const res = await CourseService.getMine()
          courses = res.data.data || res.data || []
        } catch (err) {
          courses = []
        }
      }

      if (!courses.length && user?.role === 'student') {
        try {
          const res = await CourseService.getStudentEnrollments()
          const enrollments = res.data.data || res.data || []
          courses = enrollments.map(att => att.course).filter(Boolean)
        } catch (err) {
          courses = []
        }
      }

      if (!courses.length) {
        try {
          const res = await CourseService.getAll({ limit: 1000 })
          courses = res.data.data || res.data || []
        } catch (err) {
          courses = []
        }
      }

      return courses.find(c => courseSlug(c) === slug) || null
    },
    setTab(tab) {
      this.currentTab = tab
      if (tab !== 'students') {
        this.showAddOverlay = false
      }
      if (tab === 'students') {
        this.$nextTick(() => {
          if (this.$refs.studentsCard) {
            this.$refs.studentsCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
      if (tab === 'quizzes') {
        this.fetchQuizzes()
      }
      if (tab === 'notes') {
        this.fetchNotes()
        this.fetchMaterials(this.course?._id)
      }
    },
    notify(title, message) {
      this.messageTitle = title || ''
      this.messageBody = message || ''
      this.showMessageModal = true
    },
    openAddOverlay() {
      this.showAddOverlay = true
      this.resetAddStudent()
    },
    closeAddOverlay() {
      this.showAddOverlay = false
    },
    onSearchInput() {
      if (this.searchDebounce) {
        clearTimeout(this.searchDebounce)
      }
      this.searchDebounce = setTimeout(() => {
        this.onSearchStudents()
      }, 250)
    },
    handleEsc(event) {
      if (event.key === 'Escape' && this.showAddOverlay) {
        event.preventDefault()
        this.closeAddOverlay()
      }
    },
    resetAddStudent() {
      if (this.searchDebounce) {
        clearTimeout(this.searchDebounce)
        this.searchDebounce = null
      }
      this.addStudentSearch = ''
      this.searchResults = []
      this.addStudentError = ''
      this.addingStudentId = ''
    },

    async fetchCourse() {
      const slug = this.$route.params.courseSlug
      const resolved = await this.resolveCourseBySlug(slug)
      if (!resolved || !resolved._id) {
        this.notify('Error', 'Course not found')
        return
      }

      try {
        const res = await CourseService.getById(resolved._id)
        this.course = res.data.data || res.data || resolved
      } catch (err) {
        this.course = resolved
      }

      this.overviewDraft = this.course.overview || ''
      await this.fetchEnrolled()
      await this.fetchMaterials(this.course?._id)
      if (this.currentTab === 'quizzes') {
        await this.fetchQuizzes()
      }
    },
    async fetchEnrolled() {
      try {
        if (!this.course?._id) return
        const res = await CourseService.getStudents(this.course._id)
        this.enrolled = res.data.data || res.data
      } catch (err) {
        console.error(err)
      }
    },
    async fetchQuizzes() {
      if (!this.course || !this.course._id) {
        return
      }
      this.loadingQuizzes = true
      this.quizError = null
      try {
        const res = await QuizService.getAll({ course: this.course._id, t: Date.now() })
        const payload = res?.data
        const list = (payload && (payload.data || payload)) || []
        if (res.status === 200 || res.status === 201) {
          this.quizzes = Array.isArray(list) ? list : []
        } else if (res.status === 304) {
          // keep existing
        } else {
          this.quizError = payload?.message || 'Failed to load quizzes.'
          this.quizzes = []
        }
        if (!this.isTeacher) {
          await this.fetchMyParticipations()
        }
      } catch (err) {
        console.error('fetchQuizzes error', err)
        this.quizError = err?.response?.data?.message || 'Failed to load quizzes.'
        this.quizzes = []
      } finally {
        this.loadingQuizzes = false
      }
    },
    async fetchMyParticipations() {
      if (!this.currentUser) return
      try {
        const res = await QuizParticipationService.getAll({
          student: this.currentUser._id
        })
        const data = res.data.data || res.data || []
        const map = {}
        data.forEach(p => {
          if (p.quiz) {
            const quizId = typeof p.quiz === 'object' && p.quiz._id ? p.quiz._id : p.quiz
            map[quizId] = p
          }
        })
        this.myParticipations = map
      } catch (err) {
        console.error(err)
      }
    },
    formatDate(d) {
      if (!d) return '-'
      return new Date(d).toLocaleString()
    },
    selectOption(question, index) {
      selectQuizOption(question, index)
    },
    async removeCourse() {
      this.showDeleteCourseConfirm = true
    },
    async confirmDeleteCourse() {
      try {
        await CourseService.remove(this.course._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        this.notify('Error', 'Failed to delete course')
      } finally {
        this.showDeleteCourseConfirm = false
      }
    },
    cancelDeleteCourse() {
      this.showDeleteCourseConfirm = false
    },
    async onSearchStudents() {
      if (this.studentsLoading) return
      const term = this.addStudentSearch.trim()
      if (!term) {
        this.searchResults = []
        return
      }
      this.studentsLoading = true
      this.addStudentError = ''
      try {
        const params = { role: 'student', q: term }
        const res = await Api.get('/users', { params })
        const list = res.data.data || res.data || []
        const enrolledIds = new Set(
          (this.enrolled || []).map(att => att?.student?._id || att.student).filter(Boolean)
        )
        this.searchResults = (Array.isArray(list) ? list : []).filter(s => !enrolledIds.has(s._id))
      } catch (err) {
        console.error(err)
        this.addStudentError = 'Could not load students.'
      } finally {
        this.studentsLoading = false
      }
    },
    isAlreadyEnrolled(studentId) {
      return (this.enrolled || []).some(att => (att.student?._id || att.student) === studentId)
    },
    async addStudentFromResult(student) {
      if (!student || !student._id) return
      if (this.isAlreadyEnrolled(student._id)) {
        this.addStudentError = 'Student is already enrolled.'
        return
      }
      this.addingStudentId = student._id
      this.addStudentError = ''
      try {
        await CourseService.addStudent(this.course._id, student._id)
        await this.fetchEnrolled()
        this.closeAddOverlay()
      } catch (err) {
        console.error(err)
        this.addStudentError = err?.response?.data?.message || 'Failed to add student.'
      } finally {
        this.addingStudentId = ''
      }
    },
    async saveOverview() {
      if (!this.isTeacher) return
      this.savingOverview = true
      try {
        await CourseService.update(this.course._id, { overview: this.overviewDraft })
        this.course.overview = this.overviewDraft
        this.overviewEditing = false
        this.notify('Success', 'Overview saved')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to save overview')
      } finally {
        this.savingOverview = false
      }
    },
    toggleOverviewEdit() {
      this.overviewEditing = !this.overviewEditing
      if (this.overviewEditing) {
        this.overviewDraft = this.course.overview || ''
      }
    },
    cancelOverviewEdit() {
      this.overviewEditing = false
      this.overviewDraft = this.course.overview || ''
    },
    async removeStudent(attendanceId) {
      this.studentToRemove = attendanceId
      this.showRemoveStudentConfirm = true
    },
    async confirmRemoveStudent() {
      if (!this.studentToRemove) return
      try {
        await CourseService.removeStudent(this.course._id, this.studentToRemove)
        await this.fetchEnrolled()
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to remove student')
      } finally {
        this.studentToRemove = null
        this.showRemoveStudentConfirm = false
      }
    },
    cancelRemoveStudent() {
      this.studentToRemove = null
      this.showRemoveStudentConfirm = false
    },
    async leaveCourse() {
      if (!this.myAttendance) return
      try {
        await CourseService.removeStudent(this.course._id, this.myAttendance._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to leave course')
      } finally {
        this.showLeaveConfirm = false
      }
    },
    promptDeleteQuiz(quiz) {
      this.quizToDelete = quiz
      this.showDeleteConfirm = true
    },
    async deleteQuizConfirmed() {
      if (!this.quizToDelete) return
      try {
        await QuizService.remove(this.quizToDelete._id)
        this.quizToDelete = null
        this.showDeleteConfirm = false
        await this.fetchQuizzes()
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete quiz')
      }
    },
    cancelDeleteQuiz() {
      this.quizToDelete = null
      this.showDeleteConfirm = false
    },
    async viewAttempts(quiz) {
      this.attemptsQuizTitle = quiz.title
      this.showAttemptsModal = true
      this.attemptsLoading = true
      this.attempts = []
      try {
        const res = await QuizParticipationService.getAll({ quiz: quiz._id })
        this.attempts = res.data.data || res.data || []
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to load attempts')
      } finally {
        this.attemptsLoading = false
      }
    },
    closeAttempts() {
      this.showAttemptsModal = false
      this.attempts = []
      this.attemptsQuizTitle = ''
    },
    async fetchNotes() {
      if (!this.course || !this.course._id) return

      this.loadingNotes = true
      try {
        const res = await Api.get('/notes', {
          params: { course: this.course._id } // fetch notes only for this course
        })
        this.notes = res.data.data || res.data
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to load lectures')
      } finally {
        this.loadingNotes = false
      }
    },
    async fetchMaterials(courseId) {
      if (!courseId) return
      this.loadingMaterials = true
      this.uploadError = null
      try {
        const res = await CourseMaterialService.list(courseId)
        this.materials = res.data.data || res.data || []
      } catch (err) {
        console.error(err)
      } finally {
        this.loadingMaterials = false
      }
    },
    toggleNote(note) {
      if (!note || !note._id) return
      const isSame = this.expandedNoteId === note._id
      this.expandedNoteId = isSame ? null : note._id
      if (!isSame) {
        this.ensureNoteState(note._id)
      }
    },
    ensureNoteState(id) {
      if (!this.noteAi[id]) {
        this.noteAi[id] = createAiState()
      }
      return this.noteAi[id]
    },
    setNoteTab(id, tab) {
      const state = this.ensureNoteState(id)
      state.activeTab = tab
    },
    toggleNoteFlashcard(note, index) {
      const state = this.ensureNoteState(note._id)
      toggleFlashcard(state.flashcards, index)
    },
    async generateNoteSummary(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiSummary({
        request: () => Api.post(`/notes/${note._id}/summaries`),
        setLoading: (value) => { state.loadingSummary = value },
        setSummary: (value) => { state.summary = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateNoteQuiz(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiQuiz({
        request: () => Api.post(`/notes/${note._id}/aiquizzes`),
        setLoading: (value) => { state.loadingQuiz = value },
        setQuiz: (value) => { state.quiz = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateNoteFlashcards(note) {
      const state = this.ensureNoteState(note._id)
      await handleAiFlashcards({
        request: () => Api.post(`/notes/${note._id}/flashcards`),
        setLoading: (value) => { state.loadingFlashcards = value },
        setFlashcards: (value) => { state.flashcards = value },
        setError: (value) => { state.error = value }
      })
    },
    toggleMaterial(mat) {
      if (!mat || !mat._id) return
      const isSame = this.expandedMaterialId === mat._id
      this.expandedMaterialId = isSame ? null : mat._id
      if (!isSame) {
        this.ensureMaterialState(mat._id)
      }
    },
    ensureMaterialState(id) {
      if (!this.materialAi[id]) {
        this.materialAi[id] = createAiState()
      }
      return this.materialAi[id]
    },
    setMaterialTab(id, tab) {
      const state = this.ensureMaterialState(id)
      state.activeTab = tab
    },
    toggleMaterialFlashcard(mat, index) {
      const state = this.ensureMaterialState(mat._id)
      toggleFlashcard(state.flashcards, index)
    },

    async generateMaterialSummary(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiSummary({
        request: () => CourseMaterialService.summarize(this.course._id, mat._id),
        setLoading: (value) => { state.loadingSummary = value },
        setSummary: (value) => { state.summary = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialQuiz(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiQuiz({
        request: () => CourseMaterialService.quiz(this.course._id, mat._id),
        setLoading: (value) => { state.loadingQuiz = value },
        setQuiz: (value) => { state.quiz = value },
        setError: (value) => { state.error = value }
      })
    },
    async generateMaterialFlashcards(mat) {
      const state = this.ensureMaterialState(mat._id)
      await handleAiFlashcards({
        request: () => CourseMaterialService.flashcards(this.course._id, mat._id),
        setLoading: (value) => { state.loadingFlashcards = value },
        setFlashcards: (value) => { state.flashcards = value },
        setError: (value) => { state.error = value }
      })
    },
    onFileChange(event) {
      const file = event?.target?.files?.[0]
      if (!file) return
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Only PDF files are allowed'
        this.newMaterial.file = null
        this.materialFileKey += 1
        return
      }
      this.uploadError = null
      this.newMaterial.file = file
      if (!this.newMaterial.title) {
        this.newMaterial.title = file.name.replace(/\.pdf$/i, '')
      }
    },
    async handleUpload() {
      if (!this.newMaterial.file) {
        this.uploadError = 'Please choose a PDF file'
        return
      }
      this.uploading = true
      this.uploadError = null
      try {
        const res = await CourseMaterialService.upload(this.course._id, {
          file: this.newMaterial.file,
          title: this.newMaterial.title,
          description: this.newMaterial.description
        })
        const material = res.data.data || res.data
        if (material) {
          this.materials.unshift(material)
        }
        this.newMaterial = { title: '', description: '', file: null }
        this.materialFileKey += 1
      } catch (err) {
        this.uploadError = err?.response?.data?.message || 'Failed to upload material'
      } finally {
        this.uploading = false
      }
    },
    promptDeleteMaterial(material) {
      if (!material) return
      this.materialToDelete = material
      this.showDeleteMaterialConfirm = true
    },
    cancelDeleteMaterial() {
      this.materialToDelete = null
      this.showDeleteMaterialConfirm = false
    },
    async deleteMaterialConfirmed() {
      const material = this.materialToDelete
      if (!material || !material._id) return
      try {
        await CourseMaterialService.remove(this.course._id, material._id)
        this.materials = this.materials.filter(m => m._id !== material._id)
      } catch (err) {
        console.error(err)
        if (typeof this.notify === 'function') {
          this.notify('Error', 'Failed to delete material')
        }
      } finally {
        this.cancelDeleteMaterial()
      }
    },
    prettySize(bytes) {
      if (bytes === undefined || bytes === null) return ''
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / 1024).toFixed(1)} KB`
    },
    materialUrl(pathStr) {
      if (!pathStr) return ''
      const base = Api.defaults?.baseURL || ''
      const uploadBase = base.replace(/\/api\/v1$/, '') || base
      return `${uploadBase}${pathStr}`
    },

    async createNote() {
      if (!this.newNoteTopic.trim() || !this.newNoteContent.trim()) {
        this.notify('Missing info', 'Please fill all fields')
        return
      }

      this.savingNote = true
      try {
        const payload = {
          topic: this.newNoteTopic,
          content: this.newNoteContent,
          course: this.course._id // use current course ID automatically
        }
        const res = await Api.post('/notes', payload)

        // Push to notes with course object for filtering
        const newNote = {
          ...res.data.data,
          course: { _id: this.course._id }
        }
        this.notes.push(newNote)

        // Reset input fields
        this.newNoteTopic = ''
        this.newNoteContent = ''
        this.showCreateNote = false
        this.notify('Success', 'Lecture created')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to create note')
      } finally {
        this.savingNote = false
      }
    },

    editNote(note) {
      this.editingNoteId = note._id
      this.editNoteTopic = note.topic
      this.editNoteContent = note.content
    },

    cancelEditNote() {
      this.editingNoteId = null
      this.editNoteTopic = ''
      this.editNoteContent = ''
    },

    async saveEditedNote(id) {
      if (!this.editNoteTopic.trim() || !this.editNoteContent.trim()) {
        this.notify('Missing info', 'Please fill all fields')
        return
      }
      this.savingEditNote = true
      try {
        const payload = { topic: this.editNoteTopic, content: this.editNoteContent }
        const res = await Api.patch(`/notes/${id}`, payload)

        // Keep the course object so filtering still works
        const updatedNote = {
          ...res.data.data,
          course: this.notes.find(n => n._id === id).course
        }

        const idx = this.notes.findIndex(n => n._id === id)
        if (idx !== -1) this.notes[idx] = updatedNote

        this.cancelEditNote()
        this.notify('Success', 'Lecture updated')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to update note')
      } finally {
        this.savingEditNote = false
      }
    },

    async deleteNote(id) {
      try {
        await Api.delete(`/notes/${id}`)
        this.notes = this.notes.filter(n => n._id !== id)
        this.notify('Success', 'Lecture deleted')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete note')
      }
    },
    // When user clicks Delete
    promptDeleteNote(note) {
      this.noteToDelete = note
      this.showDeleteNoteConfirm = true
    },

    // Cancel deletion
    cancelDeleteNote() {
      this.noteToDelete = null
      this.showDeleteNoteConfirm = false
    },

    // Confirm deletion
    async deleteNoteConfirmed() {
      if (!this.noteToDelete) return
      try {
        await Api.delete(`/notes/${this.noteToDelete._id}`)
        this.notes = this.notes.filter(n => n._id !== this.noteToDelete._id)
        this.noteToDelete = null
        this.showDeleteNoteConfirm = false
        this.notify('Success', 'Lecture deleted')
      } catch (err) {
        console.error(err)
        this.notify('Error', 'Failed to delete note')
      }
    }
  },

  async mounted() {
    document.addEventListener('keydown', this.handleEsc)
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab
    }
    await this.fetchCourse()
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEsc)
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #f8fafc, #eef2f7);
  border: 1px solid #e5e7eb;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}
.card-body {
  position: relative;
  overflow: visible;
}
.nav-tabs-custom .tab {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
}
.nav-tabs-custom .tab.active {
  background: #2563eb;
  color: #fff;
}
.nav-tabs-custom .tab.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.btn-hover {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}
.suggestion-list {
  max-height: 200px;
  overflow-y: auto;
  z-index: 2000;
}
.lecture-text {
  text-align: left;
  white-space: pre-line;
  line-height: 1.5;
}

.add-student-header {
  position: relative;
  overflow: visible;
}

.add-student-actions {
  position: relative;
  overflow: visible;
}

.add-student-search input {
  min-width: 220px;
}

</style>

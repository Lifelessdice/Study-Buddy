<template>
  <div class="container mt-4" v-if="course">
    <div class="hero card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <p class="text-uppercase small text-muted mb-1">Course</p>
            <h2 class="mb-1">{{ course.name }}</h2>
            <div class="text-muted fw-bold">{{ course.code }}</div>
          </div>
          <div class="d-flex gap-2 flex-wrap justify-content-end">
            <router-link to="/courses" class="btn btn-outline-secondary btn-sm">Back</router-link>
            <router-link to="/courses/all" class="btn btn-outline-secondary btn-sm">All Courses</router-link>
            <template v-if="isTeacher">
              <router-link :to="`/courses/${course._id}/edit`" class="btn btn-outline-primary btn-sm">Edit</router-link>
              <router-link :to="{ path: `/courses/${course._id}/edit`, query: { mode: 'overwrite' } }" class="btn btn-outline-primary btn-sm">Overwrite</router-link>
              <button class="btn btn-outline-danger btn-sm" @click="removeCourse">Delete</button>
            </template>
            <template v-else>
              <button
                v-if="myAttendance"
                class="btn btn-outline-danger btn-sm"
                @click="showLeaveConfirm = true"
              >
                Leave Course
              </button>
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
            <strong>Created:</strong> {{ formatDate(course.createdAt) }}
          </div>
          <div class="col-md-6 text-md-end">
            <strong>Last Updated:</strong> {{ formatDate(course.updatedAt) }}
          </div>
        </div>
      </div>
    </div>

    <div class="nav-tabs-custom mb-3">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <span class="tab" :class="{ active: currentTab === 'overview' }" @click="setTab('overview')">Overview</span>
        <span class="tab" :class="{ active: currentTab === 'notes' }" @click="setTab('notes')">Lectures</span>
        <span class="tab" :class="{ active: currentTab === 'quizzes' }" @click="setTab('quizzes')">Quizzes</span>
        <span class="tab" :class="{ active: currentTab === 'students' }" @click="setTab('students')">Students</span>
      </div>
    </div>

    <div v-if="currentTab === 'overview'">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p class="text-uppercase small text-muted mb-1">Overview</p>
              <h5 class="mb-0">Course Overview</h5>
            </div>
            <button
              v-if="isTeacher"
              class="btn btn-outline-primary btn-sm"
              @click="toggleOverviewEdit"
            >
              {{ overviewEditing ? 'Cancel' : 'Edit Overview' }}
            </button>
          </div>
          <div v-if="overviewEditing && isTeacher">
            <textarea v-model="overviewDraft" class="form-control mb-2" rows="4"></textarea>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm" :disabled="savingOverview" @click="saveOverview">
                {{ savingOverview ? 'Saving...' : 'Save Overview' }}
              </button>
              <button class="btn btn-link btn-sm" type="button" @click="cancelOverviewEdit">Discard</button>
            </div>
          </div>
          <div v-else>
            <p class="text-muted mb-0">
              {{ course.overview || 'No overview provided yet.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'quizzes'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Quizzes</h5>
          <router-link
            v-if="isTeacher"
            class="btn btn-outline-primary btn-sm"
            :to="{ name: 'CreateQuiz', params: { id: course._id } }"
          >
            + Create Quiz
          </router-link>
        </div>

        <div v-if="loadingQuizzes" class="text-muted">Loading quizzes...</div>
        <div v-else>
          <div v-if="!quizzes.length" class="alert alert-info">
            No quizzes have been created for this course yet.
            <span v-if="isTeacher">Click "Create Quiz" to add one.</span>
          </div>

          <div v-for="quiz in quizzes" :key="quiz._id" class="quiz-card mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">{{ quiz.title }}</h6>
                <div class="small text-muted">
                  Questions: {{ (quiz.questions && quiz.questions.length) || 0 }}
                </div>
                <div class="small text-muted">Created: {{ formatDate(quiz.createdAt) }}</div>
                <div v-if="!isTeacher && myParticipationByQuiz[quiz._id]" class="small text-success">
                  Score: {{ myParticipationByQuiz[quiz._id].score ?? '—' }}%
                </div>
              </div>
              <div class="d-flex gap-2">
                <router-link
                  v-if="isTeacher"
                  class="btn btn-sm btn-outline-secondary"
                  :to="{ name: 'EditQuiz', params: { quizId: quiz._id } }"
                >
                  Edit
                </router-link>
                <router-link
                  v-else-if="!myParticipationByQuiz[quiz._id]"
                  class="btn btn-sm btn-outline-primary"
                  :to="{ name: 'TakeQuiz', params: { quizId: quiz._id } }"
                >
                  Take Quiz
                </router-link>
                <button
                  v-if="isTeacher"
                  class="btn btn-sm btn-outline-secondary"
                  @click="viewAttempts(quiz)"
                >
                  View Attempts
                </button>
                <button v-if="isTeacher" class="btn btn-sm btn-outline-danger" @click="promptDeleteQuiz(quiz)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'students'" class="card mb-3" ref="studentsCard">
      <div class="card-body">
        <h5 class="card-title">Enrolled Students</h5>
        <div class="d-flex gap-2 align-items-center mb-3">
          <input v-model="studentSearch" type="text" class="form-control" placeholder="Search students...">
          <button v-if="isTeacher" class="btn btn-outline-primary btn-hover" @click="showAdd = !showAdd">
            {{ showAdd ? 'Cancel' : '+ Add Student' }}
          </button>
        </div>

        <div v-if="isTeacher && showAdd" class="d-flex gap-2 mb-3">
          <input
            v-model="addStudentEmail"
            type="email"
            class="form-control"
            placeholder="Student email"
            aria-label="Student email"
            @input="loadSuggestionsIfNeeded"
            @focus="loadSuggestionsIfNeeded"
          />
          <button class="btn btn-success btn-hover" :disabled="adding" @click="addStudent">
            {{ adding ? 'Adding...' : 'Add' }}
          </button>
        </div>

        <ul v-if="isTeacher && filteredStudentSuggestions.length" class="list-group mb-3 suggestion-list">
          <li
            v-for="stu in filteredStudentSuggestions"
            :key="stu._id"
            class="list-group-item list-group-item-action"
            @click="selectSuggestion(stu.email)"
          >
            {{ stu.name || stu.email }} ({{ stu.email }})
          </li>
        </ul>

        <div v-if="filteredEnrolled.length === 0" class="alert alert-info">No students are enrolled yet.</div>

        <div v-else class="table-responsive">
          <table class="table table-sm align-middle">
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
                <td>{{ idx + 1 }}</td>
                <td>{{ att.student?.name || 'Unknown' }}</td>
                <td>{{ att.student?.email }}</td>
                <td class="text-end">
                  <button
                    v-if="isTeacher"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeStudent(att._id)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-muted small">Total enrolled: {{ filteredEnrolled.length }} students</div>
        </div>
    </div>
  </div>

    <div v-if="currentTab === 'notes'" class="card mb-3">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Lectures</h5>
      <button
        v-if="isTeacher"
        class="btn btn-outline-primary btn-sm"
        @click="showCreateNote = !showCreateNote"
      >
        {{ showCreateNote ? 'Cancel' : '+ Create Lecture' }}
      </button>
    </div>

    <!-- Create lecture form (teachers only) -->
    <div v-if="isTeacher && showCreateNote" class="mb-3">
      <input v-model="newNoteTopic" type="text" class="form-control mb-2" placeholder="Topic" />
      <textarea v-model="newNoteContent" class="form-control mb-2" rows="4" placeholder="Content"></textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" :disabled="savingNote" @click="createNote">
          {{ savingNote ? 'Saving...' : 'Save Lecture' }}
        </button>
        <button class="btn btn-link btn-sm" @click="showCreateNote = false">Discard</button>
      </div>
    </div>

    <!-- Lectures list -->
    <div v-if="loadingNotes" class="text-muted">Loading lectures...</div>
    <div v-else>
      <div v-if="!filteredNotes.length" class="alert alert-info">
        No lectures available for this course.
      </div>

      <div v-for="note in filteredNotes" :key="note._id" class="note-card mb-3 p-3 border rounded">
        <div v-if="editingNoteId === note._id">
          <input v-model="editNoteTopic" type="text" class="form-control mb-2" placeholder="Topic" />
          <textarea v-model="editNoteContent" class="form-control mb-2" rows="4" placeholder="Content"></textarea>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" :disabled="savingEditNote" @click="saveEditedNote(note._id)">
              {{ savingEditNote ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn btn-link btn-sm" @click="cancelEditNote">Cancel</button>
          </div>
        </div>
        <div v-else class="d-flex justify-content-between align-items-start">
          <div class="lecture-text">
            <h6 class="mb-1">{{ note.topic }}</h6>
            <div class="small text-muted">Created: {{ formatDate(note.createdAt) }}</div>
            <p class="mb-0">{{ note.content }}</p>
          </div>
          <div class="d-flex gap-2" v-if="isTeacher">
            <button class="btn btn-sm btn-outline-secondary" @click="editNote(note)">Edit</button>
            <button class="btn btn-sm btn-outline-danger" @click="promptDeleteNote(note)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    <div v-if="currentTab === 'notes'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Course Materials (PDF)</h5>
        </div>

        <div v-if="isTeacher" class="mb-3">
          <div v-if="uploadError" class="alert alert-danger mb-2">{{ uploadError }}</div>
          <div class="row g-2">
            <div class="col-md-6">
              <input
                v-model="newMaterial.title"
                type="text"
                class="form-control"
                placeholder="Title"
              />
            </div>
            <div class="col-md-6">
              <input
                ref="materialFile"
                type="file"
                class="form-control"
                accept="application/pdf"
                @change="onFileChange"
              />
            </div>
            <div class="col-12">
              <textarea
                v-model="newMaterial.description"
                class="form-control"
                rows="2"
                placeholder="Description (optional)"
              ></textarea>
            </div>
            <div class="col-12">
              <button class="btn btn-primary btn-sm" :disabled="uploading" @click="handleUpload">
                {{ uploading ? 'Uploading...' : 'Upload PDF' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="loadingMaterials" class="text-muted">Loading materials...</div>
        <div v-else>
          <div v-if="!materials.length" class="alert alert-info">
            No PDF materials uploaded yet.
          </div>
          <div v-else class="list-group">
            <div
              v-for="mat in materials"
              :key="mat._id"
              class="list-group-item d-flex justify-content-between align-items-start flex-wrap gap-2"
            >
              <div class="me-2">
                <a
                  :href="materialUrl(mat.filePath)"
                  target="_blank"
                  rel="noopener"
                  :download="mat.originalName || (mat.title || 'material') + '.pdf'"
                  class="fw-bold d-block"
                >
                  {{ mat.title || mat.originalName }}
                </a>
                <div class="small text-muted">
                  Uploaded: {{ formatDate(mat.createdAt) }} | {{ prettySize(mat.size) }}
                </div>
                <div v-if="mat.description" class="small text-muted">{{ mat.description }}</div>
              </div>
              <button
                v-if="isTeacher"
                class="btn btn-sm btn-outline-danger"
                @click="deleteMaterial(mat)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteNoteConfirm" class="overlay">
  <div class="overlay-card">
    <h5 class="text-danger">Delete Lecture</h5>
    <p class="mb-3">Are you sure you want to delete "{{ noteToDelete?.topic }}"?</p>
    <div class="d-flex justify-content-end gap-2">
      <button class="btn btn-outline-secondary" @click="cancelDeleteNote">Cancel</button>
      <button class="btn btn-danger" @click="deleteNoteConfirmed">Delete</button>
    </div>
  </div>
</div>


    <div v-if="showDeleteConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Delete Quiz</h5>
        <p class="mb-3">Are you sure you want to delete "{{ quizToDelete?.title }}"?</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="cancelDeleteQuiz">Cancel</button>
          <button class="btn btn-danger" @click="deleteQuizConfirmed">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="showAttemptsModal" class="overlay">
      <div class="overlay-card wide">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Quiz Attempts — {{ attemptsQuizTitle }}</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="closeAttempts">Close</button>
        </div>
        <div v-if="attemptsLoading" class="text-muted">Loading attempts...</div>
        <div v-else-if="!attempts.length" class="alert alert-info mb-0">No attempts yet.</div>
        <div v-else class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(att, idx) in attempts" :key="att._id">
                <td>{{ idx + 1 }}</td>
                <td>{{ att.student?.name || 'Unknown' }}</td>
                <td>{{ att.student?.email || '—' }}</td>
                <td>{{ att.score ?? '—' }}%</td>
                <td>{{ formatDate(att.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showLeaveConfirm" class="overlay">
      <div class="overlay-card">
        <h5 class="text-danger">Leave Course</h5>
        <p class="mb-3">Are you sure you want to leave "{{ course.name }}"?</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="showLeaveConfirm = false">Cancel</button>
          <button class="btn btn-danger" @click="leaveCourse">Leave</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import CourseService from '@/services/CourseService'
import Api from '@/Api'
import QuizService from '@/services/QuizService'
import QuizParticipationService from '@/services/QuizParticipationService'
import CourseMaterialService from '@/services/CourseMaterialService'

export default {
  name: 'CourseDashboard',
  props: ['id'],
  data() {
    return {
      course: null,
      addStudentEmail: '',
      adding: false,
      enrolled: [],
      showAdd: false,
      allStudents: [],
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
      // materials
      materials: [],
      loadingMaterials: false,
      newMaterial: { title: '', description: '', file: null },
      uploading: false,
      uploadError: null
    }
  },
  computed: {
    filteredStudentSuggestions() {
      const term = this.addStudentEmail.trim().toLowerCase()
      if (!term || !Array.isArray(this.allStudents)) return []
      return this.allStudents
        .filter(stu => (stu.email || '').toLowerCase().includes(term) || (stu.name || '').toLowerCase().includes(term))
        .slice(0, 5)
    },
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
    filteredNotes() {
  if (!Array.isArray(this.notes) || !this.course?._id) return []
  return this.notes.filter(note => note.course?._id === this.course._id)
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
    setTab(tab) {
      this.currentTab = tab
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
        this.fetchMaterials(this.$route.params.id)
      }
    },


    async fetchCourse() {
      const res = await CourseService.getById(this.$route.params.id)
      this.course = res.data.data || res.data
      this.overviewDraft = this.course.overview || ''
      await this.fetchEnrolled()
      await this.fetchMaterials(this.course?._id)
      if (this.currentTab === 'quizzes') {
        await this.fetchQuizzes()
      }
    },
    async fetchEnrolled() {
      try {
        const res = await CourseService.getStudents(this.$route.params.id)
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
    async removeCourse() {
      if (!confirm('Delete this course?')) return
      try {
        await CourseService.remove(this.course._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        alert('Failed to delete course')
      }
    },
    async addStudent() {
      if (!this.addStudentEmail) return
      this.adding = true
      try {
        const res = await Api.get('/users', {
          params: { role: 'student', email: this.addStudentEmail }
        })
        const students = res.data.data || res.data
        const student = Array.isArray(students) ? students[0] : null
        if (!student) {
          alert('Student not found')
          return
        }
        await CourseService.addStudent(this.course._id, student._id)
        this.addStudentEmail = ''
        await this.fetchEnrolled()
        alert('Student added to course')
      } catch (err) {
        console.error(err)
        alert('Failed to add student')
      } finally {
        this.adding = false
      }
    },
    async loadSuggestionsIfNeeded() {
      if (this.allStudents.length > 0) return
      try {
        const res = await Api.get('/users', { params: { role: 'student' } })
        this.allStudents = res.data.data || res.data
      } catch (err) {
        console.error(err)
      }
    },
    selectSuggestion(email) {
      this.addStudentEmail = email
    },
    async saveOverview() {
      if (!this.isTeacher) return
      this.savingOverview = true
      try {
        await CourseService.update(this.course._id, { overview: this.overviewDraft })
        this.course.overview = this.overviewDraft
        this.overviewEditing = false
        alert('Overview saved')
      } catch (err) {
        console.error(err)
        alert('Failed to save overview')
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
      if (!confirm('Remove this student from the course?')) return
      try {
        await CourseService.removeStudent(this.course._id, attendanceId)
        await this.fetchEnrolled()
      } catch (err) {
        console.error(err)
        alert('Failed to remove student')
      }
    },
    async leaveCourse() {
      if (!this.myAttendance) return
      try {
        await CourseService.removeStudent(this.course._id, this.myAttendance._id)
        this.$router.push({ name: 'Courses' })
      } catch (err) {
        console.error(err)
        alert('Failed to leave course')
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
        alert('Failed to delete quiz')
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
        alert('Failed to load attempts')
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
        alert('Failed to load lectures')
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
    onFileChange(event) {
      const file = event?.target?.files?.[0]
      if (!file) return
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Only PDF files are allowed'
        this.newMaterial.file = null
        event.target.value = ''
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
        if (this.$refs.materialFile) {
          this.$refs.materialFile.value = ''
        }
      } catch (err) {
        this.uploadError = err?.response?.data?.message || 'Failed to upload material'
      } finally {
        this.uploading = false
      }
    },
    async deleteMaterial(material) {
      if (!material || !material._id) return
      if (!confirm('Delete this material?')) return
      try {
        await CourseMaterialService.remove(this.course._id, material._id)
        this.materials = this.materials.filter(m => m._id !== material._id)
      } catch (err) {
        console.error(err)
        alert('Failed to delete material')
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
    alert('Please fill all fields')
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
    alert('Lecture created')
  } catch (err) {
    console.error(err)
    alert('Failed to create note')
  } finally {
    this.savingNote = false
  }
}



,

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
    alert('Please fill all fields')
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
    alert('Lecture updated')
  } catch (err) {
    console.error(err)
    alert('Failed to update note')
  } finally {
    this.savingEditNote = false
  }
}
,

  async deleteNote(id) {
    if (!confirm('Delete this note?')) return
    try {
      await Api.delete(`/notes/${id}`)
      this.notes = this.notes.filter(n => n._id !== id)
      alert('Lecture deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete note')
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
      alert('Lecture deleted') // optional, you can remove this if the modal is enough
    } catch (err) {
      console.error(err)
      alert('Failed to delete note')
    }
  }
},
  
  async mounted() {
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab
    }
    await this.fetchCourse()
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #f8fafc, #eef2f7);
  border: 1px solid #e5e7eb;
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
  cursor: pointer;
  z-index: 2000;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.overlay-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 640px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.overlay-card.wide {
  max-width: 720px;
}

.lecture-text {
  text-align: left;
  white-space: pre-line;
  line-height: 1.5;
}
</style>

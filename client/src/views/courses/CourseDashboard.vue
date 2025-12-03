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
        <span class="tab disabled">Notes</span>
        <span class="tab" :class="{ active: currentTab === 'quizzes' }" @click="setTab('quizzes')">Quizzes</span>
        <span class="tab" :class="{ active: currentTab === 'students' }" @click="setTab('students')">Students</span>
      </div>
    </div>

    <div v-if="currentTab === 'overview'">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Course Overview</h5>
          </div>
          <div v-if="isTeacher">
            <textarea v-model="overviewDraft" class="form-control mb-2" rows="4"></textarea>
            <button class="btn btn-outline-primary btn-sm" :disabled="savingOverview" @click="saveOverview">
              {{ savingOverview ? 'Saving...' : 'Save Overview' }}
            </button>
          </div>
          <p class="text-muted" v-else>
            {{ overviewDraft || 'No overview provided yet.' }}
          </p>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <h5 class="mb-2">Course Overview</h5>
          <p class="text-muted mb-0">Overview: {{ course.overview || 'No overview specified.' }}</p>
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
        <div v-else-if="quizError" class="text-danger">Failed to load quizzes.</div>
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
              </div>
              <div class="d-flex gap-2">
                <router-link
                  v-if="isTeacher"
                  class="btn btn-sm btn-outline-secondary"
                  :to="{ name: 'EditQuiz', params: { quizId: quiz._id } }"
                >
                  Edit
                </router-link>
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

    <!-- Delete Quiz overlay -->
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
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import CourseService from '@/services/CourseService'
import Api from '@/Api'
import QuizService from '@/services/QuizService'

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
      savingOverview: false,
      currentTab: 'overview',
      studentSearch: '',
      quizzes: [],
      loadingQuizzes: false,
      quizError: null,
      showDeleteConfirm: false,
      quizToDelete: null
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
    courseTeacher() {
      const u = localStorage.getItem('user')
      if (!u) return null
      const user = JSON.parse(u)
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
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'teacher'
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
    },
    async fetchCourse() {
      const res = await CourseService.getById(this.$route.params.id)
      this.course = res.data.data || res.data
      this.overviewDraft = this.course.overview || ''
      await this.fetchEnrolled()
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
      try {
        this.loadingQuizzes = true
        const res = await QuizService.getAll({ course: this.course._id })
        this.quizzes = res.data.data || res.data
      } catch (err) {
        this.quizError = err
        console.error(err)
      } finally {
        this.loadingQuizzes = false
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
        alert('Overview saved')
      } catch (err) {
        console.error(err)
        alert('Failed to save overview')
      } finally {
        this.savingOverview = false
      }
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
    }
  },
  async mounted() {
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab
    }
    await this.fetchCourse()
    await this.fetchQuizzes()
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
</style>

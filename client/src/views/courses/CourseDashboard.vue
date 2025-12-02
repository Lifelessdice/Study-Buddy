<template>
  <div class="container mt-4" v-if="course">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-0">{{ course.name }}</h2>
        <small class="text-muted">Code: {{ course.code }}</small>
      </div>
      <div>
        <router-link to="/courses" class="btn btn-outline-secondary me-2">Back to My Courses</router-link>
        <router-link to="/courses/all" class="btn btn-outline-secondary">All Courses</router-link>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <p v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
        <p v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
        <p class="text-muted mb-0">
          Created: {{ formatDate(course.createdAt) }}
        </p>
      </div>
    </div>

    <div class="d-flex gap-2 mb-3" v-if="isTeacher">
      <router-link :to="`/courses/${course._id}/edit`" class="btn btn-primary btn-hover">
        Edit Course
      </router-link>
      <button class="btn btn-danger btn-hover" @click="removeCourse">Delete Course</button>
      <button class="btn btn-outline-primary btn-hover" @click="viewAssignments">View Assignments</button>
    </div>

    <div v-if="isTeacher" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Manage Students</h5>
        <div class="d-flex gap-2 mb-3">
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
            {{ adding ? 'Adding...' : 'Add Student' }}
          </button>
        </div>

        <ul v-if="filteredStudentSuggestions.length" class="list-group mb-3 suggestion-list">
          <li
            v-for="stu in filteredStudentSuggestions"
            :key="stu._id"
            class="list-group-item list-group-item-action"
            @click="selectSuggestion(stu.email)"
          >
            {{ stu.name || stu.email }} ({{ stu.email }})
          </li>
        </ul>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <h6 class="mb-0">Enrolled Students</h6>
          <button class="btn btn-outline-secondary btn-sm btn-hover" @click="showStudents = !showStudents">
            {{ showStudents ? 'Hide' : 'Show' }} Students
          </button>
        </div>

        <div v-if="showStudents" class="mt-2">
          <div v-if="enrolled.length === 0" class="text-muted mb-2">No students enrolled yet.</div>
          <ul class="list-group mb-3">
            <li
              v-for="att in enrolled"
              :key="att._id"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              @click="selectStudent(att.student)"
            >
              <div>
                <strong>{{ att.student?.name || att.student?.email || 'Unknown student' }}</strong>
                <div class="small text-muted">{{ att.student?.email }}</div>
              </div>
              <button class="btn btn-sm btn-outline-danger" @click.stop="removeStudent(att._id)">
                Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">Loading...</div>
</template>

<script>
import CourseService from '@/services/CourseService'
import Api from '@/Api'

export default {
  name: 'CourseDashboard',
  props: ['id'],
  data() {
    return {
      course: null,
      isTeacher: false,
      addStudentEmail: '',
      adding: false,
      enrolled: [],
      showStudents: false,
      allStudents: [],
      selectedStudent: null
    }
  },
  computed: {
    filteredStudentSuggestions() {
      const term = this.addStudentEmail.trim().toLowerCase()
      if (!term || !Array.isArray(this.allStudents)) return []
      return this.allStudents
        .filter(stu => (stu.email || '').toLowerCase().includes(term) || (stu.name || '').toLowerCase().includes(term))
        .slice(0, 5)
    }
  },
  methods: {
    async fetchCourse() {
      const res = await CourseService.getById(this.$route.params.id)
      this.course = res.data.data || res.data
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
    formatDate(d) {
      if (!d) return ''
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
    viewAssignments() {
      CourseService.getAssignments(this.course._id)
        .then(res => {
          const assigns = res.data.data || res.data
          const text = assigns.length
            ? assigns.map(a => `${a.teacher?.name || a.teacher?.email || 'Unknown'}`).join('\n')
            : 'No assignments'
          alert(text)
        })
        .catch(err => {
          console.error(err)
          alert('Failed to load assignments')
        })
    },
    resolveRole() {
      const u = localStorage.getItem('user')
      if (!u) return
      const user = JSON.parse(u)
      this.isTeacher = user.role === 'teacher'
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
    selectStudent(student) {
      this.selectedStudent = student
    },
    async removeStudent(attendanceId) {
      if (!confirm('Remove this student from the course?')) return
      try {
        await CourseService.removeStudent(this.course._id, attendanceId)
        this.selectedStudent = null
        await this.fetchEnrolled()
      } catch (err) {
        console.error(err)
        alert('Failed to remove student')
      }
    }
  },
  async mounted() {
    this.resolveRole()
    await this.fetchCourse()
  }
}
</script>

<style scoped>
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
}

.student-details {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  background: #f8f9fa;
}
</style>

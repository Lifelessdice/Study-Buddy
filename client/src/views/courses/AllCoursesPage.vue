<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>All Courses</h2>
      <div class="d-flex align-items-center gap-2">
        <router-link to="/courses" class="btn btn-outline-secondary">
          Back to My Courses
        </router-link>
        <router-link
          v-if="isTeacher"
          to="/courses/delete-all"
          class="btn btn-outline-danger"
        >
          Delete All Courses
        </router-link>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-6 position-relative">
            <label class="form-label">Search (name/code)</label>
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="e.g. DIT343"
              @input="onSearchInput"
            >
            <ul
              v-if="search && searchSuggestions.length"
              class="list-group position-absolute w-100 suggestion-list"
            >
              <li
                v-for="s in searchSuggestions"
                :key="s._id"
                class="list-group-item list-group-item-action"
                @click="selectSuggestion(s)"
              >
                {{ s.name }} ({{ s.code }})
              </li>
            </ul>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="toggleFilters">
              {{ showFilters ? 'Hide Filters' : 'Filter by Degree' }}
            </button>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="fetchCourses">Search</button>
          </div>
        </div>

        <div v-if="showFilters" class="row g-2 align-items-end mt-3">
          <div class="col-md-4">
            <label class="form-label">Degree</label>
            <select v-model="degree" class="form-select">
              <option value="">Any</option>
              <option v-for="opt in degreeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading">Loading courses...</div>

    <div v-if="!loading && error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!loading && enrollError" class="alert alert-warning">
      {{ enrollError }}
    </div>

    <div v-if="!loading && courses.length === 0" class="alert alert-info">
      No courses yet.
    </div>

    <div class="row">
      <div v-for="course in paginatedCourses" :key="course._id" class="col-md-6 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              {{ course.name }} <small class="text-muted">({{ course.code }})</small>
            </h5>
            <p class="card-text" v-if="course.overview"><strong>Overview:</strong> {{ course.overview }}</p>
            <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
            <p class="card-text">
              <small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small>
            </p>

            <div
              v-if="isStudent"
              class="mt-3 d-flex justify-content-between align-items-center"
            >
              <span v-if="isEnrolled(course)" class="badge bg-success">Enrolled</span>
              <span v-else class="text-muted">Not enrolled</span>

              <button
                class="btn btn-sm"
                :class="isEnrolled(course) ? 'btn-outline-secondary' : 'btn-primary'"
                :disabled="enrollingId === course._id || isEnrolled(course)"
                @click="handleSignup(course)"
              >
                <span v-if="enrollingId === course._id">Enrolling...</span>
                <span v-else-if="isEnrolled(course)">Enrolled</span>
                <span v-else>Enroll</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && courses.length" class="d-flex justify-content-between align-items-center mt-3">
      <div>
        <button
          class="btn btn-outline-secondary me-2"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          Previous
        </button>

        <button
          class="btn btn-outline-secondary"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>

      <div class="d-flex align-items-center">
        <span class="me-3">
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="total"> ({{ total }} total)</span>
        </span>

        <select
          class="form-select"
          style="width: auto;"
          :value="pageSize"
          @change="changePageSize($event.target.value)"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'AllCoursesPage',
  data() {
    return {
      courses: [],
      loading: false,
      error: null,
      search: '',
      degree: '',
      showFilters: false,
      degreeOptions: [],

      // pagination state
      currentPage: 1,
      pageSize: 5,
      totalPages: 1,
      total: 0,

      // enrollment state
      enrolledCourseIds: [],
      enrollingId: null,
      enrollError: null
    }
  },
  computed: {
    isTeacher() {
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'teacher'
    },
    isStudent() {
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'student'
    },
    searchSuggestions() {
      const term = this.search.trim().toLowerCase()
      if (!term) return []
      return this.courses
        .filter(c =>
          (c.name || '').toLowerCase().includes(term) ||
          (c.code || '').toLowerCase().includes(term)
        )
        .slice(0, 5)
    },
    paginatedCourses() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.courses.slice(start, end)
    }
  },

  methods: {
    async fetchCourses() {
      try {
        this.loading = true
        this.error = null
        this.enrollError = null

        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }

        if (this.search) {
          params.name = this.search
          params.code = this.search
        }
        if (this.degree) params.degree = this.degree

        const res = await CourseService.getAll(params)

        const data = res.data
        this.courses = data.data || data
        if (data && Array.isArray(data.degrees)) {
          this.degreeOptions = data.degrees
        }

        this.total = data.total ?? this.courses.length
        this.totalPages = Math.max(Math.ceil(this.total / this.pageSize), 1)

        if (this.isStudent) {
          await this.fetchEnrollments()
        }
      } catch (err) {
        this.error = 'Failed to load courses.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchEnrollments() {
      try {
        const enrollmentsRes = await CourseService.getStudentEnrollments()
        const enrollmentsData = enrollmentsRes.data.data || enrollmentsRes.data || []

        this.enrolledCourseIds = enrollmentsData
          .map(att => {
            if (att.course && att.course._id) return att.course._id
            return att.course || null
          })
          .filter(Boolean)
      } catch (err) {
        console.error(err)
        this.enrollError = 'Could not load your enrollments.'
      }
    },

    // called when user types; we only update suggestions here
    onSearchInput() {
      // suggestions derived from current list; fetch on Search click
    },

    selectSuggestion(course) {
      this.search = course.code || course.name || ''
      this.currentPage = 1
      this.fetchCourses()
    },

    toggleFilters() {
      this.showFilters = !this.showFilters
    },

    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    },

    isEnrolled(course) {
      return this.enrolledCourseIds.includes(course._id)
    },

    async handleSignup(course) {
      if (!this.isStudent || this.isEnrolled(course)) return

      const userJson = localStorage.getItem('user')
      const user = userJson ? JSON.parse(userJson) : null
      if (!user || !user._id) {
        this.enrollError = 'You must be logged in as a student to enroll.'
        return
      }

      this.enrollingId = course._id
      this.enrollError = null

      try {
        await CourseService.addStudent(course._id, user._id)
        if (!this.enrolledCourseIds.includes(course._id)) {
          this.enrolledCourseIds.push(course._id)
        }
      } catch (err) {
        console.error(err)
        this.enrollError = 'Enrollment failed. Please try again.'
      } finally {
        this.enrollingId = null
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.fetchCourses()
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchCourses()
      }
    },

    changePageSize(newSize) {
      this.pageSize = Number(newSize) || this.pageSize
      this.currentPage = 1
      this.fetchCourses()
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.suggestion-list {
  z-index: 2000;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  background: #fff;
  border: 1px solid #dee2e6;
}
</style>

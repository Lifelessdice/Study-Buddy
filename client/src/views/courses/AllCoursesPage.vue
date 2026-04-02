<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>All Courses</h2>
      <div class="d-flex align-items-center gap-2">
        <BaseButton to="/courses" variant="secondary" outline>
          <span class="btn-text btn-text-long">Back to My Courses</span>
          <span class="btn-text btn-text-short">My Courses</span>
          <span class="btn-icon">C</span>
        </BaseButton>

        <BaseButton
          v-if="isTeacher"
          variant="danger"
          outline
          @click="showDeleteAllConfirm = true"
        >
          <span class="btn-text btn-text-long">Delete All Courses</span>
          <span class="btn-text btn-text-short">Delete</span>
          <span class="btn-icon">Del</span>
        </BaseButton>
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
            <BaseButton class="w-100" variant="secondary" outline @click="toggleFilters">
              {{ showFilters ? 'Hide Filters' : 'Filter by Degree' }}
            </BaseButton>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <BaseButton class="w-100" variant="primary" @click="fetchCourses">Search</BaseButton>
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
      <div v-for="course in courses" :key="course._id" class="col-md-6 mb-3">
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
              <BaseButton
                size="sm"
                :variant="isEnrolled(course) ? 'success' : 'primary'"
                :outline="false"
                :disabled="enrollingId === course._id || isEnrolled(course)"
                @click="handleSignup(course)"
              >
                <span v-if="enrollingId === course._id">Enrolling...</span>
                <span v-else-if="isEnrolled(course)">Enrolled</span>
                <span v-else>Enroll</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && courses.length" class="d-flex justify-content-between align-items-center mt-3">
      <div>
        <BaseButton
          variant="secondary"
          outline
          class="page-btn"
          @click="prevPage"
          :disabled="currentPage === 1"
          aria-label="Previous page"
        >
          <span class="page-icon">&lt;</span>
        </BaseButton>

        <BaseButton
          variant="secondary"
          outline
          class="page-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
        >
          <span class="page-icon">&gt;</span>
        </BaseButton>
      </div>

      <div class="d-flex align-items-center">
        <span class="me-3">
          Pg {{ currentPage }}/{{ totalPages }}
          <span v-if="total">({{ total }})</span>
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

    <div v-if="showDeleteAllConfirm" class="overlay">
      <div class="overlay-card overlay-card--danger">
        <h5 class="text-danger">Delete All Courses</h5>
        <p class="mb-3">This will remove all courses. This cannot be undone.</p>
        <div class="d-flex gap-2 justify-content-end">
          <BaseButton variant="primary" outline @click="showDeleteAllConfirm = false">Cancel</BaseButton>
          <BaseButton
            variant="danger"
            :loading="deletingAll"
            :disabled="deletingAll"
            @click="deleteAllCourses"
          >
            {{ deletingAll ? 'Deleting...' : 'Yes, delete all' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CourseService from '@/services/CourseService'
import { notifyError, notifySuccess } from '@/utils/notify'

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
      enrollError: null,

      showDeleteAllConfirm: false,
      deletingAll: false
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
    }
  },

  methods: {
    async fetchCourses() {
      try {
        this.loading = true
        this.error = null

        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }

        if (this.search) {
          // backend will treat these as filters
          params.name = this.search
          params.code = this.search
        }
        if (this.degree) params.degree = this.degree

        const res = await CourseService.getAll(params)

        // backend shape: { status, page, limit, total, totalPages, data, degrees, links, ... }
        const data = res.data

        this.courses = data.data || data
        if (data && Array.isArray(data.degrees)) {
          this.degreeOptions = data.degrees
        }

        // use backend pagination numbers
        if (typeof data.page === 'number') {
          this.currentPage = data.page
        }
        if (typeof data.total === 'number') {
          this.total = data.total
        } else {
          this.total = this.courses.length
        }

        if (typeof data.limit === 'number') {
          this.pageSize = data.limit
        }

        if (typeof data.totalPages === 'number') {
          this.totalPages = data.totalPages
        } else {
          this.totalPages = Math.max(Math.ceil(this.total / this.pageSize), 1)
        }
      } catch (err) {
        this.error = err
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

    // called when user types;
    onSearchInput() {
      //  fetch on Search click
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

    async deleteAllCourses() {
      if (this.deletingAll) return
      this.deletingAll = true
      try {
        await CourseService.removeAll()
        this.courses = []
        this.total = 0
        this.totalPages = 1
        this.currentPage = 1
        this.showDeleteAllConfirm = false
        notifySuccess('All courses deleted')
      } catch (err) {
        console.error(err)
        notifyError('Failed to delete all courses')
      } finally {
        this.deletingAll = false
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
    this.fetchEnrollments()
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

@media (max-width: 480px) {
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
}
</style>

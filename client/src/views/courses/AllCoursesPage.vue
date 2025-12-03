<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>All Courses</h2>
      <router-link to="/courses" class="btn btn-outline-secondary">
        Back to My Courses
      </router-link>
      <div class="ms-auto" v-if="isTeacher">
        <router-link to="/courses/delete-all" class="btn btn-outline-danger">
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
            <ul v-if="search && searchSuggestions.length" class="list-group position-absolute w-100 suggestion-list">
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
            <p class="card-text" v-if="course.material"><strong>Material:</strong> {{ course.material }}</p>
            <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
            <p class="card-text"><small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small></p>
          </div>
        </div>
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
      degreeOptions: ['BSc', 'Master', 'PhD', 'Diploma']
    }
  },
  computed: {
    isTeacher() {
      const u = localStorage.getItem('user')
      if (!u) return false
      const user = JSON.parse(u)
      return user.role === 'teacher'
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
        const params = {}
        if (this.search) {
          params.name = this.search
          params.code = this.search
        }
        if (this.degree) params.degree = this.degree

        const res = await CourseService.getAll(params)
        this.courses = res.data.data || res.data
      } catch (err) {
        this.error = err
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    onSearchInput() {
      // suggestions derived from current list; fetch on Search click
    },
    selectSuggestion(course) {
      this.search = course.code || course.name || ''
      this.fetchCourses()
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

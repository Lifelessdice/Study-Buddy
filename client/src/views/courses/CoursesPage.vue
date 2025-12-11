<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Courses</h2>
      <div>
        <BaseButton
          v-if="isTeacher"
          to="/courses/create"
          variant="primary"
          class="me-2"
        >
          + Create Course
        </BaseButton>
        <BaseButton
          to="/courses/all"
          variant="secondary"
          outline
        >
          See All Courses
        </BaseButton>
      </div>
    </div>

    <div v-if="loading">Loading courses...</div>

    <div v-if="!loading && courses.length === 0" class="alert alert-info">
      No courses yet.
    </div>

        <div class="row">
      <div v-for="course in paginatedCourses" :key="course._id" class="col-md-6 mb-3">
        <router-link :to="`/courses/${course._id}`" class="course-card-link">
          <div class="card h-100 course-card">
            <div class="card-body">
              <h5 class="card-title">{{ course.name }} <small class="text-muted">({{ course.code }})</small></h5>
              <p class="card-text" v-if="course.overview"><strong>Overview:</strong> {{ course.overview }}</p>
              <p class="card-text" v-if="course.degree"><strong>Degree:</strong> {{ course.degree }}</p>
              <p class="card-text"><small class="text-muted">Created: {{ formatDate(course.createdAt) }}</small></p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 🔽 PASTE THIS BLOCK HERE -->
    <div v-if="!loading" class="d-flex justify-content-between align-items-center mt-3">
      <div>
        <BaseButton
          variant="secondary"
          outline
          class="me-2"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          Previous
        </BaseButton>

        <BaseButton
          variant="secondary"
          outline
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          Next
        </BaseButton>
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
    <!-- 🔼 END PAGINATION BLOCK -->

  </div>
</template>

<script>
import CourseService from '@/services/CourseService'

export default {
  name: 'CoursesPage',
  data() {
    return {
      courses: [],
      loading: false,
      error: null,

      // 🔽 pagination state for when we call getAll()
      currentPage: 1,
      pageSize: 5,
      totalPages: 1,
      total: 0
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

        let res

        if (this.isTeacher) {
          try {
            // teachers: first try only their courses
            res = await CourseService.getMine()
            const data = res.data.data || res.data || []
            this.courses = data

            // 🔽 update pagination based on courses list
            this.total = this.courses.length
            this.totalPages = Math.max(Math.ceil(this.total / this.pageSize), 1)

            return
          } catch (err) {
            // If teacher fetch fails (e.g., not assigned yet), fall back to all
            const params = {
              page: this.currentPage,
              limit: this.pageSize
            }
            res = await CourseService.getAll(params)
          }
        } else if (this.isStudent) {
          // students: show courses they are enrolled in (from attendances)
          const enrollments = await CourseService.getStudentEnrollments()
          const data = enrollments.data.data || enrollments.data || []
          this.courses = data.map(att => att.course).filter(Boolean)

          // 🔽 update pagination based on courses list
          this.total = this.courses.length
          this.totalPages = Math.max(Math.ceil(this.total / this.pageSize), 1)

          return
        } else {
          // anonymous / admin: show all with pagination
          const params = {
            page: this.currentPage,
            limit: this.pageSize
          }
          res = await CourseService.getAll(params)
        }

        const data = res.data

        this.courses = data.data || data // sometimes API uses data.data or data

        // 🔽 update pagination based on what we actually have
        this.total = this.courses.length
        this.totalPages = Math.max(Math.ceil(this.total / this.pageSize), 1)
      } catch (err) {
        this.error = err
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString()
    },

    // 🔽 pagination actions (only used when getAll() is being used)
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
.course-card-link {
  text-decoration: none;
  color: inherit;
}

.course-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 16px;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}
</style>

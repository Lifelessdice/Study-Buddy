<template>
  <div class="container mt-5">
    <h2 class="mb-4">Your Lectures</h2>

    <div class="list-group shadow-sm">
      <template v-for="item in lectures" :key="item._id">
        <a
          v-if="item.type === 'pdf'"
          class="list-group-item list-group-item-action text-start"
          :href="item.filePath"
          target="_blank"
          rel="noopener"
          :download="item.downloadName"
        >
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ item.title }}</strong>
            <small class="text-muted">{{ formatDate(item.createdAt) }}</small>
          </div>
          <div class="small text-muted">PDF</div>
          <div v-if="item.description" class="small text-muted mt-1">{{ item.description }}</div>
        </a>

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
      studentAttendance: [] // stores the student's enrolled courses
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
        type: 'note'
      }))
      const materialItems = (this.filteredMaterials || []).map(m => ({
        _id: m._id,
        title: m.title || m.originalName,
        description: m.description,
        createdAt: m.createdAt,
        type: 'pdf',
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
    }
  }
}
</script>

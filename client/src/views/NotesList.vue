<template>
  <div class="container mt-5">
    <h2 class="mb-4">Your Notes</h2>

    <div class="list-group shadow-sm">
      <button
        v-for="note in filteredNotes"
        :key="note._id"
        class="list-group-item list-group-item-action"
        @click="goToNote(note._id)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <strong>{{ note.topic }}</strong>
          <small>{{ new Date(note.createdAt).toLocaleDateString() }}</small>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import api from '../Api'

export default {
  data() {
    return {
      notes: [],
      user: null,
      studentAttendance: [] // stores the student's enrolled courses
    }
  },

  computed: {
    filteredNotes() {
      if (!this.user) return this.notes

      // Teachers see all notes
      if (this.user.role === 'teacher') {
        return this.notes
      }

      // Students → only notes for courses they are enrolled in
      const enrolledCourseIds = this.studentAttendance.map(a => a.course._id)
      return this.notes.filter(n => n.course && enrolledCourseIds.includes(n.course._id))
    }
  },

  async created() {
    try {
      const token = localStorage.getItem('token')
      this.user = JSON.parse(localStorage.getItem('user'))

      // Fetch all notes
      const notesRes = await api.get('/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.notes = notesRes.data.data

      // Fetch student enrollments
      if (this.user && this.user.role === 'student') {
        const attRes = await api.get('/courses/attendances/mine', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.studentAttendance = attRes.data.data
      }
    } catch (err) {
      console.error(err)
      alert('Failed to load notes')
    }
  },

  methods: {
    goToNote(id) {
      this.$router.push(`/notes/${id}`)
    }
  }
}
</script>


<template>
  <div class="container mt-5">
    <h2 class="mb-4">Your Notes</h2>

    <div class="list-group shadow-sm">
      <button
        v-for="note in notes"
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
    return { notes: [] }
  },
  async created() {
    try {
      const res = await api.get('/notes')
      this.notes = res.data.data
    } catch (err) {
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

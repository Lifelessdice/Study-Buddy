<script setup>
import { ref, onMounted } from 'vue'
import QuizParticipationService from '../../services/QuizParticipationService'

const student = JSON.parse(localStorage.getItem('user'))

const analytics = ref(null)
const analyticsLoading = ref(false)
const analyticsError = ref(null)

onMounted(() => {
  loadAnalytics()
})

async function loadAnalytics() {
  try {
    analyticsLoading.value = true
    const res = await QuizParticipationService.getStudentAnalytics(student._id)
    analytics.value = res.data.data
  } catch (err) {
    analyticsError.value = 'Failed to load analytics.'
    console.error(err)
  } finally {
    analyticsLoading.value = false
  }
}
</script>

<template>
  <div class="page">

    <h1>Your Quiz Results</h1>

    <div class="analytics" style="padding:16px; border:1px solid #ccc; border-radius:8px;">
      <h2>Summary</h2>

      <div v-if="analyticsLoading">Loading analytics...</div>
      <div v-if="analyticsError">{{ analyticsError }}</div>

      <div v-if="analytics">
        <p><strong>Total quizzes taken:</strong> {{ analytics.totalQuizzes }}</p>
        <p><strong>Average score:</strong> {{ analytics.averageScore.toFixed(1) }}</p>

        <h3>History</h3>
        <ul>
          <li v-for="item in analytics.history" :key="item.takenAt">
            {{ new Date(item.takenAt).toLocaleString() }} –
            {{ item.courseCode }} –
            {{ item.quizTitle }} –
            Score: {{ item.score }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Your existing attempt list stays below -->
  </div>
</template>

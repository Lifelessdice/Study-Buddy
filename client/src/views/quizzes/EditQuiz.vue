<script setup>
import { ref, onMounted } from 'vue'
import QuizService from '../../services/QuizService'

const props = defineProps({
  quizId: String
})

const quiz = ref(null)
const loading = ref(true)
const error = ref(null)

const analytics = ref(null)
const analyticsLoading = ref(false)
const analyticsError = ref(null)

// Load quiz + analytics when page loads
onMounted(async () => {
  await loadQuiz()
  await loadAnalytics()
})

async function loadQuiz() {
  try {
    loading.value = true
    const res = await QuizService.getQuiz(props.quizId)
    quiz.value = res.data.data
  } catch (err) {
    error.value = 'Failed to load quiz.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadAnalytics() {
  try {
    analyticsLoading.value = true
    const res = await QuizService.getAnalytics(props.quizId)
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

    <h1>Edit Quiz</h1>

    <div v-if="loading">Loading quiz...</div>
    <div v-if="error">{{ error }}</div>

    <div v-if="quiz">
      <!-- YOUR EXISTING QUIZ EDIT UI GOES HERE -->
    </div>

    <!-- ANALYTICS PANEL -->
    <div class="analytics" style="margin-top:20px; padding:16px; border:1px solid #ccc; border-radius:8px;">
      <h2>Quiz Analytics</h2>

      <div v-if="analyticsLoading">Loading analytics...</div>
      <div v-if="analyticsError">{{ analyticsError }}</div>

      <div v-if="analytics">
        <p><strong>Attempts:</strong> {{ analytics.attempts }}</p>
        <p><strong>Average Score:</strong> {{ analytics.averageScore.toFixed(1) }}</p>
        <p><strong>Highest Score:</strong> {{ analytics.highestScore }}</p>
        <p><strong>Lowest Score:</strong> {{ analytics.lowestScore }}</p>

        <h3>Question Difficulty</h3>
        <ul>
          <li
            v-for="q in analytics.questionStats"
            :key="q.questionIndex"
          >
            Q{{ q.questionIndex+1 }} – {{ q.questionText }}
            ({{ (q.correctness * 100).toFixed(0) }}% correct)
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>
